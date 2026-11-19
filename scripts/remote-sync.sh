#!/usr/bin/env bash
# ============================================================
# remote-sync.sh —— 在服务器上执行：备份 → 用 staging 覆盖目标目录 → 清理
# 通过 ssh 以 stdin 方式运行：ssh host "bash -s -- <args>" < scripts/remote-sync.sh
# 也可以本地直接跑（供 deploy.sh --selftest 使用）
# ============================================================
set -Eeuo pipefail
# 排序/比较一律按字节序，避免服务器上的中文/UTF-8 locale 影响快照顺序
export LC_ALL=C

STAGING=""
TARGET=""
BACKUP_ROOT=""
KEEP=2
DELETE=1
DRY=0
ROLLBACK=""

usage() {
  cat <<'EOF'
用法: remote-sync.sh --staging DIR --target DIR --backup-root DIR [选项]

  --staging DIR       已上传的新版本目录（本地磁盘）
  --target DIR        网站根目录（必须已存在或可创建）
  --backup-root DIR   快照存放目录（与 target 同盘时用硬链接，几乎瞬时）
  --keep N            保留最近 N 个快照（默认 2）
  --no-delete         只覆盖，不删除 target 中多余文件
  --dry-run           只打印计划，不改动任何文件
  --rollback NAME     从快照目录中的 NAME（或 latest）恢复，忽略 --staging
EOF
}

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '%s\n' "$*"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --staging)     STAGING="${2:-}";     shift 2 ;;
    --target)      TARGET="${2:-}";      shift 2 ;;
    --backup-root) BACKUP_ROOT="${2:-}"; shift 2 ;;
    --keep)        KEEP="${2:-}";        shift 2 ;;
    --no-delete)   DELETE=0;             shift ;;
    --dry-run)     DRY=1;                shift ;;
    --rollback)    ROLLBACK="${2:-}";    shift 2 ;;
    -h|--help)     usage; exit 0 ;;
    *) die "未知参数: $1" ;;
  esac
done

[ -n "$TARGET" ] || die "缺少 --target"

# ---------- 目标目录安全校验 ----------
case "$TARGET" in
  /*) ;;
  *) die "--target 必须是绝对路径: $TARGET" ;;
esac

if [ "$DRY" = 0 ]; then
  mkdir -p -- "$TARGET"
fi
[ -d "$TARGET" ] || die "目标目录无法创建: $TARGET"

# 归一化（去掉结尾斜杠、解析 .. 与符号链接）
REAL_TARGET="$(cd "$TARGET" && pwd -P)"
case "$REAL_TARGET" in
  /|/root|/home|/opt|/opt/1panel|/opt/1panel/www|/opt/1panel/www/sites|/var|/var/www|/www|/tmp|/etc|/usr|/usr/local)
    die "拒绝在危险目录上同步: $REAL_TARGET" ;;
esac
# 至少两层：/opt/1panel/www/sites/xxx/index
DEPTH="$(printf '%s' "$REAL_TARGET" | awk -F/ '{print NF-2}')"
[ "$DEPTH" -ge 2 ] || die "目标目录层级过浅，拒绝执行: $REAL_TARGET"

TARGET="$REAL_TARGET"
log "target   : $TARGET"

# ---------- 同步函数 ----------
sync_tree() { # $1=src $2=dst  (遵循 DELETE 设置)
  local src="$1" dst="$2"
  if [ "$DRY" = 1 ]; then
    log "[dry-run] 同步 $src/ -> $dst/  (delete=$DELETE)"
    return 0
  fi
  if command -v rsync >/dev/null 2>&1; then
    # --checksum：按内容比对，避免 mtime/尺寸相同却内容不同的文件被跳过
    local opts=(-a --checksum --exclude=.user.ini --exclude=.well-known)
    [ "$DELETE" = 1 ] && opts+=(--delete)
    rsync "${opts[@]}" "$src/" "$dst/"
  else
    if [ "$DELETE" = 1 ]; then
      find "$dst" -mindepth 1 -maxdepth 1 \
        ! -name '.user.ini' ! -name '.well-known' -exec rm -rf {} +
    fi
    cp -a "$src/." "$dst/"
  fi
}

# ---------- 回滚模式 ----------
if [ -n "$ROLLBACK" ]; then
  [ -n "$BACKUP_ROOT" ] || die "--rollback 需要 --backup-root"
  if [ "$ROLLBACK" = "latest" ]; then
    latest="$(ls -1dt "$BACKUP_ROOT"/*/ 2>/dev/null | head -n1 || true)"
    [ -n "$latest" ] || die "没有可用快照: $BACKUP_ROOT"
    ROLLBACK="$(basename "$latest")"
  fi
  SNAP="$BACKUP_ROOT/$ROLLBACK"
  [ -d "$SNAP" ] || die "快照不存在: $SNAP"
  log "回滚     : $SNAP -> $TARGET"
  sync_tree "$SNAP" "$TARGET"
  chmod -R a+rX "$TARGET" 2>/dev/null || true
  log "ROLLBACK_OK source=$SNAP"
  exit 0
fi

[ -n "$STAGING" ] || die "缺少 --staging"
[ -d "$STAGING" ] || die "staging 目录不存在: $STAGING"
[ -n "$(ls -A "$STAGING" 2>/dev/null)" ] || die "staging 为空，拒绝用它覆盖网站: $STAGING"

# ---------- 备份 ----------
BACKUP_PATH=""
if [ -n "$BACKUP_ROOT" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null || true)" ]; then
  TS="$(date +%Y%m%d-%H%M%S)"
  BASE_TS="$TS"; N=1
  while [ -e "$BACKUP_ROOT/$TS" ]; do N=$((N + 1)); TS="$BASE_TS-$N"; done
  BACKUP_PATH="$BACKUP_ROOT/$TS"
  if [ "$DRY" = 0 ]; then
    mkdir -p -- "$BACKUP_ROOT"
    # 硬链接快照：秒级完成、几乎不占空间（rsync 写入新 inode，旧内容保持完整）
    if ! cp -al "$TARGET/." "$BACKUP_PATH/" 2>/dev/null; then
      rm -rf -- "$BACKUP_PATH"
      cp -a "$TARGET/." "$BACKUP_PATH/" 2>/dev/null || true
    fi
    log "备份     : $BACKUP_PATH"
    # cp -a 会连源目录的 mtime 一起复制，这里改成当前时间，
    # 之后就能用 ls -1t 可靠地判断新旧（名称排序会被 locale 影响，不能用）
    touch "$BACKUP_PATH" 2>/dev/null || true
    ls -1dt "$BACKUP_ROOT"/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
      rm -rf -- "$old"
    done
  else
    log "[dry-run] 备份 $TARGET -> $BACKUP_PATH"
  fi
fi

# ---------- 覆盖目标目录 ----------
sync_tree "$STAGING" "$TARGET"

if [ "$DRY" = 0 ]; then
  # 静态站点只需可读：目录 755 / 文件 644
  chmod -R a+rX "$TARGET" 2>/dev/null || true
  FILES="$(find "$TARGET" -type f | wc -l | tr -d ' ')"
  SIZE="$(du -sh "$TARGET" 2>/dev/null | awk '{print $1}')"
  [ -f "$TARGET/index.html" ] || log "WARN: 目标目录里没有 index.html"
  log "SYNC_OK files=$FILES size=$SIZE target=$TARGET backup=${BACKUP_PATH:-none}"
else
  log "[dry-run] 未做任何修改"
fi
