# 一键部署说明

把原来的「打包 → zip → 上传 → 服务器解压 → `mv out/* .`」压缩成一条命令：

```bash
npm run deploy
```

它会：**next build → 增量上传 → 服务器端备份旧版本 → 覆盖网站目录 → 校验 index.html → 记录日志**。

> ### 本机已配置好（2026-11-07）
> | 项 | 值 |
> | --- | --- |
> | 服务器 | `43.161.254.38:22`，用户 `ubuntu`（免密 sudo） |
> | 站点 | `mrduan.me`（1Panel · OpenResty 容器） |
> | 网站根目录 | `/opt/1panel/apps/openresty/openresty/www/sites/mrduan.me/index` |
> | 探活地址 | `https://mrduan.me/` |
>
> ⚠️ 1Panel 面板里显示的网站目录是 `/www/sites/mrduan.me/index`，这是 **OpenResty 容器内**的路径；
> 宿主机上对应 `/opt/1panel/apps/openresty/openresty/www/sites/mrduan.me/index`（`/www` 是容器的挂载点）。
> 往容器内路径写文件在宿主机上会失败，所以脚本里填的是宿主机路径。
> 以后若在 1Panel 里删站/重建站点，目录会变，先跑 `npm run deploy:check` 重新确认。

---

## 一、一次性配置（只做一次）

### 1. 把公钥加到服务器

本机已生成专用部署密钥（`~/.ssh` 之外的独立密钥，不影响你其他 SSH 配置）：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKQZ2kP1tB/QHLJ5D7Wx6nk31ei8aia0oNaGhTM0Kv47 mrduan-deploy
```

**方式 A：1Panel 面板**（推荐）
1Panel → 主机 → 终端（或你平时登录服务器的方式），执行：

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKQZ2kP1tB/QHLJ5D7Wx6nk31ei8aia0oNaGhTM0Kv47 mrduan-deploy' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**方式 B：腾讯云控制台** → 云服务器 → 密钥 → 绑定密钥对（需重启生效，较麻烦）。

### 2. 填写 `.deploy.env`

```bash
DEPLOY_HOST="你的服务器公网 IP 或域名"
DEPLOY_PORT="22"        # 1Panel 改过 SSH 端口就改这里
DEPLOY_USER="root"
```

### 3. 验证连通 + 自动探测网站目录

```bash
npm run deploy:check
```

会输出 SSH 是否通、探测到的 1Panel 站点目录候选、远端可用工具和磁盘余量。**不写入任何文件。**

### 4. 首次部署

```bash
npm run deploy
```

首次会显示目标目录并要求输入 `y` 确认（因为「完全同步」会删除该目录中 out/ 里没有的文件）。确认后目录会写回 `.deploy.env`，以后不再询问。

---

### 耗时参考（实测）

| 场景 | 耗时 |
| --- | --- |
| 首次部署（全量上传 178M） | 约 2–3 分钟（看上行带宽） |
| 之后每次（含 `next build`） | **约 28 秒** |
| 之后每次（`--no-build`） | 约 17 秒 |
| 回滚 | 约 5 秒 |

### 已内置的容错

- SSH 偶发「Connection closed / 255」自动重试 3 次（本机到腾讯云链路上实测会偶发）；
- 上传中断自动断点续传（`rsync --partial`）最多 3 次；
- 服务器缺 rsync 时自动降级 tar+scp；
- 目标目录写不进时自动用 `sudo -n`（当前用 `ubuntu` 用户 + 免密 sudo）；
- 覆盖前硬链接快照，失败可 `npm run deploy:rollback` 一键回退。

## 二、日常命令

| 命令 | 作用 |
| --- | --- |
| `npm run deploy` | 打包 + 部署（最常用） |
| `npm run deploy -- --no-build` | 跳过打包，直接部署现有 `out/` |
| `npm run deploy:check` | 只检查连接与目录，不上传 |
| `npm run deploy:rollback` | 回滚到上一个快照 |
| `bash scripts/deploy.sh --rollback 20251107-120000` | 回滚到指定快照 |
| `npm run deploy:test` | 本地自测同步/备份/回滚逻辑（不联网） |

常用开关：`--no-delete`（只覆盖不删除）、`--dry-run`、`-y`（跳过确认）、`--path /xxx`（指定目录）。

---

## 三、它到底做了什么

```
本机                                  服务器
out/ ──rsync 增量 ──▶ ~/.mrduan-deploy/staging/
                          │
                          ├─ cp -al 硬链接快照 ~/.mrduan-deploy/backups/<时间戳>/
                          ├─ rsync --checksum staging/ → 网站目录/
                          └─ chmod a+rX
```

- **增量**：第一次传全量约 150MB；之后只传有变化的文件（通常几 MB，秒级）。staging 常驻在服务器上正是为了做增量比对。
- **安全**：覆盖之前先做硬链接快照（瞬时、几乎不占空间），`npm run deploy:rollback` 可一键回到上一版；超过 `DEPLOY_BACKUPS` 个自动清理最旧的。
- **保护**：`--delete` 会跳过 `.user.ini` 和 `.well-known/`（1Panel/证书常用），不会误删。
- **校验**：按文件内容（`--checksum`）而不是修改时间判断差异，避免「同尺寸同秒」文件被漏传。
- **兜底**：服务器没装 rsync 时自动退回 tar + scp 整包上传，流程不变。

---

## 四、排错

| 现象 | 处理 |
| --- | --- |
| `连不上服务器` | 检查 `.deploy.env` 的 IP/端口/用户；确认公钥已写入服务器 `~/.ssh/authorized_keys`；腾讯云安全组放行该端口 |
| `Permission denied (publickey)` | 公钥没加对，或 `DEPLOY_USER` 不是 root 但用了 `~/` 指代错误用户；用 `ssh -p 端口 -i .deploy/id_ed25519 用户@IP` 单独试 |
| `找到多个候选目录` | 用 `--path /opt/1panel/apps/openresty/openresty/www/sites/<站点>/index` 指定 |
| `Permission denied` 写 `/opt/1panel/...` | 站点目录属 root，脚本会自动用 `sudo -n`；若报「没有免密 sudo」，把公钥换成 root 或加 `/etc/sudoers.d/` 授权 |
| 面板里看到的路径是 `/www/...` | `/www` 是 OpenResty 容器挂载点，宿主机真实路径是 `/opt/1panel/apps/openresty/openresty/www/...` |
| 部署成功但页面没变 | 1Panel 站点开了缓存/CDN：清 OpenResty 缓存、浏览器强刷；或在 `.deploy.env` 设 `DEPLOY_PUBLIC_URL` 让脚本自动探活 |
| 首次同步把别的文件删了 | 立刻 `npm run deploy:rollback` 恢复 |
| 想改回只覆盖 | `.deploy.env` 里 `DEPLOY_DELETE="0"` 或加 `--no-delete` |

---

## 五、安全提示

- `.deploy/id_ed25519`（私钥）和 `.deploy.env` 已在 `.gitignore` 中，不会进 git。
- 这个密钥是部署专用的，只允许登录你这台服务器；要作废时删掉服务器 `authorized_keys` 里对应那一行即可。
- `out.zip` 也不再进 git（已加入 `.gitignore`）。
