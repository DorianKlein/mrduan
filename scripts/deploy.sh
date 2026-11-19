#!/usr/bin/env bash
# ============================================================
# mrduan 一键部署
#   npm run deploy                  # build → 增量上传 → 服务器同步 → 备份
#   npm run deploy -- --no-build    # 只部署已存在的 out/
#   bash scripts/deploy.sh --check  # 只测连通性 + 站点路径
#   bash scripts/deploy.sh --rollback            # 回滚到最近一次快照
#   bash scripts/deploy.sh --rollback 20251107-120000
#   bash scripts/deploy.sh --selftest            # 本地自测同步逻辑
# 配置：.deploy.env（见 .deploy.env.example）
# ============================================================
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BOLD=$'\033[1m'; RED=$'\033[31m'; GRN=$'\033[32m'; YLW=$'\033[33m'; RST=$'\033[0m'
step() { printf '\n%s▸ %s%s\n' "$BOLD" "$*" "$RST"; }
info() { printf '    %s\n' "$*"; }
ok()   { printf '    %s✓%s %s\n' "$GRN" "$RST" "$*"; }
warn() { printf '    %s!%s %s\n' "$YLW" "$RST" "$*"; }
die()  { printf '\n%s✗ %s%s\n' "$RED" "$*" "$RST" >&2; exit 1; }
trap 'die "第 $LINENO 行执行失败（命令退出码 $?），已中止"' ERR

# ---------- 默认配置 ----------
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-}"          # 网站根目录；留空自动探测
DEPLOY_KEY="${DEPLOY_KEY:-$ROOT/.deploy/id_ed25519}"
DEPLOY_BUILD="${DEPLOY_BUILD:-1}"
DEPLOY_DELETE="${DEPLOY_DELETE:-1}"
DEPLOY_BACKUPS="${DEPLOY_BACKUPS:-2}"
DEPLOY_PUBLIC_URL="${DEPLOY_PUBLIC_URL:-}"
DEPLOY_REMOTE_HOME="${DEPLOY_REMOTE_HOME:-}"

if [ -f "$ROOT/.deploy.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.deploy.env"
  set +a
fi

BUILD=1
DELETE=1
ASSUME_YES=0
DRY=0
MODE="deploy"   # deploy | check | rollback | selftest
ROLLBACK_SNAP=""

while [ $# -gt 0 ]; do
  case "$1" in
    --host)      DEPLOY_HOST="${2:-}"; shift 2 ;;
    --port)      DEPLOY_PORT="${2:-}"; shift 2 ;;
    --user)      DEPLOY_USER="${2:-}"; shift 2 ;;
    --path)      DEPLOY_PATH="${2:-}"; shift 2 ;;
    --key)       DEPLOY_KEY="${2:-}";   shift 2 ;;
    --no-build)  BUILD=0; shift ;;
    --no-delete) DELETE=0; shift ;;
    -y|--yes)    ASSUME_YES=1; shift ;;
    --dry-run)   DRY=1; shift ;;
    --check)     MODE="check"; shift ;;
    --rollback)  MODE="rollback"; ROLLBACK_SNAP="${2:-latest}"; shift 2 ;;
    --selftest)  MODE="selftest"; shift ;;
    -h|--help)   sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) die "未知参数: $1（--help 查看用法）" ;;
  esac
done

# ============================================================
# 自测：在本地临时目录验证 remote-sync.sh 的同步 / 备份 / 回滚
# ============================================================
SELFTEST_TMP=""
selftest() {
  SELFTEST_TMP="$(mktemp -d)"
  local T="$SELFTEST_TMP"
  trap 'rm -rf "${SELFTEST_TMP:-}"' EXIT
  local fail=0
  chk() { # chk <描述> <期望> <实际>
    if [ "$2" = "$3" ]; then ok "$1"; else warn "$1（期望 [$2] 实际 [$3]）"; fail=1; fi
  }
  content() { if [ -f "$1" ]; then cat "$1"; else echo '<missing>'; fi; }

  mkdir -p "$T/target/old" "$T/out/assets" "$T/out/sub" "$T/staging" "$T/backups"
  echo OLD            > "$T/target/index.html"
  echo OLD-ONLY       > "$T/target/old-only.html"
  echo KEEP-ME        > "$T/target/.user.ini"
  mkdir -p "$T/target/.well-known"; echo acme-token > "$T/target/.well-known/token"
  echo NEW            > "$T/out/index.html"
  echo JS             > "$T/out/assets/a.js"
  echo CSS            > "$T/out/sub/new.css"
  cp -a "$T/out/." "$T/staging/"

  step "自测 1/4：完全同步"
  bash "$ROOT/scripts/remote-sync.sh" --staging "$T/staging" --target "$T/target" \
    --backup-root "$T/backups" --keep 2 >/dev/null
  chk "新文件已覆盖"      "NEW"      "$(content "$T/target/index.html")"
  chk "新资源已上传"      "JS"       "$(content "$T/target/assets/a.js")"
  chk "旧多余文件被删除"  "<missing>" "$(content "$T/target/old-only.html")"
  chk "保留 .user.ini"    "KEEP-ME"  "$(content "$T/target/.user.ini")"
  chk "保留 .well-known"  "acme-token" "$(content "$T/target/.well-known/token")"
  chk "已生成快照"        "1"        "$(ls -1 "$T/backups" | wc -l | tr -d ' ')"
  chk "staging 仍保留（用于下次增量）" "JS" "$(content "$T/staging/assets/a.js")"

  step "自测 2/4：只覆盖不删除"
  bash "$ROOT/scripts/remote-sync.sh" --staging "$T/staging" --target "$T/target" \
    --backup-root "$T/backups" --keep 2 --no-delete >/dev/null
  echo STILL-THERE > "$T/target/keep.html"
  cp -a "$T/out/." "$T/staging/"
  bash "$ROOT/scripts/remote-sync.sh" --staging "$T/staging" --target "$T/target" \
    --backup-root "$T/backups" --keep 2 --no-delete >/dev/null
  chk "--no-delete 保留多余文件" "STILL-THERE" "$(content "$T/target/keep.html")"

  step "自测 3/4：快照数量上限"
  cp -a "$T/out/." "$T/staging/"
  bash "$ROOT/scripts/remote-sync.sh" --staging "$T/staging" --target "$T/target" \
    --backup-root "$T/backups" --keep 2 >/dev/null
  chk "最多保留 2 个快照" "2" "$(ls -1 "$T/backups" | wc -l | tr -d ' ')"

  step "自测 4/4：回滚到上一个快照"
  bash "$ROOT/scripts/remote-sync.sh" --target "$T/target" --backup-root "$T/backups" \
    --rollback latest >/dev/null
  chk "回滚后恢复旧文件" "STILL-THERE" "$(content "$T/target/keep.html")"

  step "安全校验"
  if bash "$ROOT/scripts/remote-sync.sh" --staging "$T/staging" --target "/opt/1panel/www/sites" >/dev/null 2>&1; then
    warn "危险路径未被拦截"; fail=1
  else
    ok "拒绝危险路径 /opt/1panel/www/sites"
  fi
  mkdir -p "$T/empty"; : > "$T/staging2"; rm -rf "$T/staging2"
  mkdir -p "$T/staging2"
  if bash "$ROOT/scripts/remote-sync.sh" --staging "$T/staging2" --target "$T/target" >/dev/null 2>&1; then
    warn "空 staging 未被拦截"; fail=1
  else
    ok "拒绝空 staging"
  fi

  echo
  if [ "$fail" = 0 ]; then printf '%s自测全部通过%s\n' "$GRN" "$RST"; else printf '%s自测有失败项%s\n' "$RED" "$RST"; fi
  return "$fail"
}

if [ "$MODE" = "selftest" ]; then
  if selftest; then exit 0; else exit 1; fi
fi

# ============================================================
# 连接配置检查
# ============================================================
[ -n "$DEPLOY_HOST" ] || die "还没配置服务器地址。请编辑 .deploy.env 里的 DEPLOY_HOST（或 --host <IP>）"
[ -f "$DEPLOY_KEY" ]  || die "SSH 私钥不存在: $DEPLOY_KEY"
chmod 600 "$DEPLOY_KEY" 2>/dev/null || true
mkdir -p "$ROOT/.deploy"
touch "$ROOT/.deploy/known_hosts"
command -v ssh >/dev/null 2>&1 || die "本机缺少 ssh"

SSH_OPTS=(
  -p "$DEPLOY_PORT"
  -i "$DEPLOY_KEY"
  -o IdentitiesOnly=yes
  -o StrictHostKeyChecking=accept-new
  -o UserKnownHostsFile="$ROOT/.deploy/known_hosts"
  -o ConnectTimeout=15
  -o ServerAliveInterval=20
  -o ServerAliveCountMax=6
  -o LogLevel=ERROR
  -o BatchMode=yes
)
SSH_DEST="$DEPLOY_USER@$DEPLOY_HOST"

# rsync 的 -e 参数在 macOS 的 openrsync 下不能可靠地携带多参数，
# 改为生成一个 ssh 包装脚本，只传一个路径给 -e。
SSH_WRAPPER="$ROOT/.deploy/ssh_cmd.sh"
mk_ssh_wrapper() {
  {
    printf '#!/bin/sh\nexec ssh'
    for opt in "${SSH_OPTS[@]}"; do printf ' %q' "$opt"; done
    printf ' "$@"\n'
  } > "$SSH_WRAPPER"
  chmod +x "$SSH_WRAPPER"
}
mk_ssh_wrapper

# ssh 偶发拒连（255）时自动重试；远端命令本身失败（非 255）不重试
ssh_run() {
  local attempt=1 max=3 rc=0
  while :; do
    rc=0
    set +e
    ssh "${SSH_OPTS[@]}" "$SSH_DEST" "$@"
    rc=$?
    set -e
    [ "$rc" -eq 0 ] && return 0
    [ "$rc" -ne 255 ] && return "$rc"
    [ "$attempt" -ge "$max" ] && return "$rc"
    printf '    %s!%s SSH 连接抖动（第 %s 次），2 秒后重试\n' "$YLW" "$RST" "$attempt"
    attempt=$((attempt + 1))
    sleep 2
  done
}

# 以 root 身份在远端执行一段 shell（网站目录归 root，普通用户需 sudo）
SUDO_CMD=""
ssh_sh() {
  local cmd="$1"
  if [ -n "$SUDO_CMD" ]; then
    ssh_run "$SUDO_CMD bash -c $(printf '%q' "$cmd")"
  else
    ssh_run "bash -c $(printf '%q' "$cmd")"
  fi
}

step "检查 SSH 连接 $SSH_DEST:$DEPLOY_PORT"
ssh_run 'true' 2>/dev/null || die "连不上服务器。请确认：1) IP/端口/用户名正确 2) 公钥已加到服务器（见 DEPLOY.md）"
ok "SSH 连接正常"

REMOTE_HOME="$(ssh_run 'printf %s "$HOME"')"
[ -n "$REMOTE_HOME" ] || REMOTE_HOME="/root"

REMOTE_UID="$(ssh_run 'id -u')"
if [ "$REMOTE_UID" != "0" ]; then
  ssh_run 'sudo -n true' 2>/dev/null \
    || die "用户 $DEPLOY_USER 没有免密 sudo。请把公钥换成 root，或在服务器执行：echo \"$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL\" | sudo tee /etc/sudoers.d/mrduan-deploy"
  SUDO_CMD="sudo -n"
  info "将用 sudo 写入网站目录"
fi

WORK_DIR="$REMOTE_HOME/.mrduan-deploy"
STAGING_DIR="$WORK_DIR/staging"
BACKUP_DIR="$WORK_DIR/backups"
ssh_run "mkdir -p -- '$STAGING_DIR' '$BACKUP_DIR'"

# ============================================================
# 定位网站根目录（1Panel 默认 /opt/1panel/www/sites/<站点>/index）
# ============================================================
detect_sites() {
  ssh_sh 'for d in /opt/1panel/www/sites/*/index /opt/1panel/apps/*/*/www/sites/*/index /www/sites/*/index /www/wwwroot/* /opt/1panel/www/*; do
      [ -d "$d" ] && echo "$d"
    done 2>/dev/null | sort -u'
}

resolve_path() {
  local candidates
  candidates="$(detect_sites)"

  if [ -z "$DEPLOY_PATH" ]; then
    local n
    n="$(printf '%s\n' "$candidates" | grep -c . || true)"
    if [ "$n" -eq 0 ]; then
      die "服务器上没自动找到网站目录。请在 1Panel → 网站 → 你的站点 → 网站目录 里复制绝对路径，填到 .deploy.env 的 DEPLOY_PATH"
    elif [ "$n" -eq 1 ]; then
      DEPLOY_PATH="$(printf '%s\n' "$candidates" | head -n1)"
      warn "自动探测到站点目录：$DEPLOY_PATH"
    else
      info "找到多个候选目录，请用 --path 指定（或写进 .deploy.env）："
      printf '%s\n' "$candidates" | sed 's/^/      - /'
      die "目标目录不唯一，请加 --path <绝对路径>"
    fi
  fi

  case "$DEPLOY_PATH" in /*) ;; *) die "DEPLOY_PATH 必须是绝对路径: $DEPLOY_PATH" ;; esac
  case "$DEPLOY_PATH" in *\'*|*\"*|*' '*) die "DEPLOY_PATH 不能包含空格/引号: $DEPLOY_PATH" ;; esac

  # 目标必须是已存在的目录或可创建；展示现状方便确认
  local exists
  exists="$(ssh_sh "if [ -d '$DEPLOY_PATH' ]; then echo yes; else echo no; fi")"
  if [ "$exists" = "no" ]; then
    warn "服务器上还没有这个目录，将创建：$DEPLOY_PATH"
  else
    local cnt
    cnt="$(ssh_sh "find '$DEPLOY_PATH' -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' '")"
    info "该目录现有顶层文件数：$cnt"
  fi

  if [ "$MODE" = "deploy" ] && [ "$ASSUME_YES" = 0 ] && [ "${DEPLOY_PATH_CONFIRMED:-0}" != "1" ]; then
    printf '    %s即将把 out/ 同步到：%s%s\n' "$YLW" "$DEPLOY_PATH" "$RST"
    [ "$DELETE" = 1 ] && warn "完全同步模式：该目录中 out/ 里没有的文件会被删除"
    printf '    确认继续？[y/N] '
    local ans=""
    read -r ans || true
    case "$ans" in
      y|Y|yes|YES) ;;
      *) die "已取消。确认无误后可把 DEPLOY_PATH 写入 .deploy.env 并加 DEPLOY_PATH_CONFIRMED=1，或用 -y 跳过确认" ;;
    esac
  fi
}

step "定位网站目录"
resolve_path
ok "目标目录：$DEPLOY_PATH"

if [ "$MODE" = "check" ]; then
  info "远端可用工具：$(ssh_sh 'for t in tar rsync du find chmod sudo; do command -v $t >/dev/null 2>&1 && printf "%s " $t; done')"
  info "服务器磁盘：$(ssh_sh 'df -h /opt 2>/dev/null | tail -n1 | awk "{print \$4\" 可用\"}"')"
  ok "检查完成，配置可用。去掉 --check 即可正式部署"
  exit 0
fi

# ============================================================
# 回滚
# ============================================================
if [ "$MODE" = "rollback" ]; then
  step "回滚到快照：$ROLLBACK_SNAP"
  ssh_run "${SUDO_CMD:+$SUDO_CMD }bash -s -- --target '$DEPLOY_PATH' --backup-root '$BACKUP_DIR' --rollback '$ROLLBACK_SNAP'" \
    < "$ROOT/scripts/remote-sync.sh" | sed 's/^/    /'
  ok "回滚完成（页面如未变化，强刷浏览器缓存）"
  exit 0
fi

# ============================================================
# 打包
# ============================================================
if [ "$BUILD" = 1 ]; then
  step "打包 next build"
  command -v npm >/dev/null 2>&1 || die "本机找不到 npm"
  npm run build 2>&1 | tail -n 25 | sed 's/^/    /'
  ok "打包完成"
else
  step "跳过打包（--no-build）"
fi

[ -d "$ROOT/out" ] || die "没有 out/ 目录（导出失败？）"
[ -f "$ROOT/out/index.html" ] || die "out/index.html 不存在，导出结果异常"
OUT_SIZE="$(du -sh "$ROOT/out" | awk '{print $1}')"
OUT_FILES="$(find "$ROOT/out" -type f | wc -l | tr -d ' ')"
info "out/：${OUT_SIZE}（${OUT_FILES} 个文件）"

# ============================================================
# 上传（rsync 增量；无 rsync 时退回 tar+scp）
# ============================================================
step "上传到服务器"
HAS_RSYNC_REMOTE="$(ssh_run 'command -v rsync >/dev/null 2>&1 && echo yes || echo no')"
HAS_RSYNC_LOCAL=no; command -v rsync >/dev/null 2>&1 && HAS_RSYNC_LOCAL=yes

if [ "$HAS_RSYNC_LOCAL" = yes ] && [ "$HAS_RSYNC_REMOTE" = yes ]; then
  info "模式：rsync 增量同步（第二次起只传有变化的文件）"
  RSYNC_LOG="$ROOT/.deploy/rsync.log"
  attempt=0
  while :; do
    if rsync -az --checksum --partial --delete --exclude=.DS_Store \
        --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
        -e "$SSH_WRAPPER" "$ROOT/out/" "$SSH_DEST:$STAGING_DIR/" >"$RSYNC_LOG" 2>&1; then
      break
    fi
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 3 ]; then
      tail -n 20 "$RSYNC_LOG" | sed 's/^/    /' >&2
      die "上传失败（已重试 3 次，日志：.deploy/rsync.log）"
    fi
    warn "上传中断（第 ${attempt} 次），3 秒后续传 …"
    sleep 3
  done
  tail -n 3 "$RSYNC_LOG" | sed 's/^/    /'
else
  warn "本地或服务器缺少 rsync，改用 tar + scp（每次整包上传）"
  LOCAL_TAR="$ROOT/.deploy/out.tar.gz"
  mkdir -p "$ROOT/.deploy"
  info "压缩中…"
  tar czf "$LOCAL_TAR" -C "$ROOT/out" --exclude=.DS_Store .
  info "上传压缩包（$(du -sh "$LOCAL_TAR" | awk '{print $1}')）…"
  scp -P "$DEPLOY_PORT" -i "$DEPLOY_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new \
      "$LOCAL_TAR" "$SSH_DEST:$WORK_DIR/out.tar.gz"
  ssh_run "rm -rf -- '$STAGING_DIR' && mkdir -p -- '$STAGING_DIR' && tar xzf '$WORK_DIR/out.tar.gz' -C '$STAGING_DIR' && rm -f '$WORK_DIR/out.tar.gz'"
  rm -f "$LOCAL_TAR"
fi
ok "上传完成"

# ============================================================
# 服务器端：备份旧版本 → 覆盖网站目录 → 清理
# ============================================================
step "服务器端同步"
DEL_FLAG=""; [ "$DELETE" = 1 ] || DEL_FLAG="--no-delete"
ssh_run "${SUDO_CMD:+$SUDO_CMD }bash -s -- --staging '$STAGING_DIR' --target '$DEPLOY_PATH' --backup-root '$BACKUP_DIR' --keep '$DEPLOY_BACKUPS' $DEL_FLAG" \
  < "$ROOT/scripts/remote-sync.sh" | sed 's/^/    /'

step "验证"
REMOTE_CHECK="$(ssh_sh "printf 'files=%s size=%s index=%s' \"\$(find '$DEPLOY_PATH' -type f | wc -l | tr -d ' ')\" \"\$(du -sh '$DEPLOY_PATH' | awk '{print \$1}')\" \"\$(test -f '$DEPLOY_PATH/index.html' && echo yes || echo NO)\"")"
info "$REMOTE_CHECK"
case "$REMOTE_CHECK" in
  *index=yes*) ok "index.html 已就位" ;;
  *) die "远端缺少 index.html，请检查。可执行 --rollback 恢复上一版本" ;;
esac

if [ -n "$DEPLOY_PUBLIC_URL" ]; then
  CODE=""
  if command -v curl >/dev/null 2>&1; then
    CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 15 "$DEPLOY_PUBLIC_URL" 2>/dev/null || true)"
  fi
  if [ -z "$CODE" ] || [ "$CODE" = "000" ]; then
    # 本机网络受限时改由服务器侧探活
    CODE="$(ssh_run "curl -sk -o /dev/null -w '%{http_code}' -m 15 '$DEPLOY_PUBLIC_URL'" 2>/dev/null || true)"
    [ -n "$CODE" ] && info "本机无法直连，改由服务器侧探活"
  fi
  info "线上访问 $DEPLOY_PUBLIC_URL → HTTP ${CODE:-未知}"
  case "$CODE" in
    2*|3*) ok "站点响应正常" ;;
    000|"") warn "探活失败（本机/服务器都无法访问，可能是 DNS 或安全组问题）" ;;
    *) warn "站点返回 ${CODE}，请看 1Panel 网站日志/缓存" ;;
  esac
fi

# 部署日志
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
{
  printf '%s\t%s\t%s\t%s\n' "$STAMP" "$(git rev-parse --short HEAD 2>/dev/null || echo no-git)" "$DEPLOY_PATH" "$OUT_FILES files / $OUT_SIZE"
} >> "$ROOT/.deploy/deploy.log" 2>/dev/null || true

# 首次部署成功后记住已确认的目录，后续不再询问
if [ "${DEPLOY_PATH_CONFIRMED:-0}" != "1" ] && [ -f "$ROOT/.deploy.env" ]; then
  {
    printf '\n# 首次部署成功后自动写入 %s\n' "$STAMP"
    printf 'DEPLOY_PATH=%q\n' "$DEPLOY_PATH"
    printf 'DEPLOY_PATH_CONFIRMED=1\n'
  } >> "$ROOT/.deploy.env"
  info "已把确认过的目录记入 .deploy.env，下次不再询问"
fi

printf '\n%s✅ 部署完成%s  %s → %s:%s（%s）\n' "$GRN" "$RST" "$ROOT/out" "$DEPLOY_HOST" "$DEPLOY_PATH" "$STAMP"
