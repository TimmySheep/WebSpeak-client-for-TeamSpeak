# 手机版导航语音优先顺序

- 日期：2026-10-06
- 对象：WebSpeak 移动端已连接页面与 Intel NUC 静态前端

## 修改

- 底部导航调整为「语音 → 频道 → 聊天 → 更多」。
- 移动端初始页面改为「语音」；桌面端行为不变。
- 代码仅改 `web/src/views/WebClient.vue`。

## 验证与依赖

- 检查到现有 Node.js `v24.18.0`（`node@24`）和 npm `11.16.0`；项目根目录与 `web/` 的 `node_modules` 均缺失，未安装全局工具。
- 按锁文件安装：`npm ci --ignore-scripts --no-audit --no-fund`（194 packages）；`npm --prefix web ci --ignore-scripts --no-audit --no-fund`（71 packages）。未改 package 或 lock 文件。npm 对锁定的旧传递依赖打印弃用警告。
- `npm test`：22 项通过。
- `npm --prefix web run build -- --outDir /private/var/folders/p1/3pqx3j392m381v0g293m9rgc0000gn/T/opencode/webspeak-mobile-nav-validation-28eb435b`：Vue 类型检查通过，Vite 转换 191 modules 并构建成功。构建时提示现有根 `package.json` 有重复 `test` 键；本次未修改该问题。
- Intel NUC 上的源码归档与两份锁文件匹配；按该源码基线另行构建，Vue 类型检查通过、Vite 转换 189 modules。源码回读断言确认四项顺序与默认页面均正确。
- 首次暂存源码包验收发现 macOS `com.apple.provenance` 扩展属性，未用于部署。改用 Python 标准库重新打包并验收：203 entries，不含 xattr、`node_modules`、`dist`、`.git`、AppleDouble 或 `.DS_Store`。
- PR #21 的 `verify` 与 `docker-smoke` 均通过，检查对应 head `343efa0`。

## GitHub

- 分支：`fix/mobile-audio-control-labels`
- 新提交：`343efa0`（`fix: put mobile voice tab first`）
- 推送至现有 PR #21：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/21
- PR 保持 OPEN；没有合并。PR 分支也包含此前已有的移动音频控制标签提交 `978dee7`。

## Intel NUC 部署

- 变更前快照：`/home/timmy/webspeak/backups/20261006-030208-CST-mobile-navigation-order/`，包含旧 `index.html`、旧 AGPL 源码归档及 SHA-256 清单；回读校验通过。
- 原子切换首页后，部署了 `assets/index-CYYIG-c7.js`（SHA-256 `6990c72e59d4541dbcd0928f78911a0bd77770a644a51e58e1f841354d9c5ebd`）和 `assets/index-rKvDZCM-.css`（SHA-256 `47a990e0781cbf9bc67334017f066944f73157c696288c449512d7a2f12853de`），并更新 AGPL 源码归档（SHA-256 `7073b92fe0520d541479e031e83b19c10b137aebd02e20480aebabc70ad6a1b9`）。
- 保留 NUC 首页主题色、PWA/图标设置、`screen-share-portrait-f54f514.css` 覆盖层和所有旧哈希资源；不重启 Caddy。
- 最终回读：端口 3040/3041 的首页、`/health`、新 JS/CSS、屏幕共享覆盖 CSS、源码归档均 HTTP 200；HTTP 回读的源码归档哈希与候选一致。WebSpeak 容器最终为 `running / healthy`。
- 初检时容器曾为 `Exited (137)`；Timmy 授权启动服务。之后复核已见容器恢复运行（`StartedAt=2026-10-05T18:55:10Z`、`RestartCount=0`），来源不明，因此未再执行启动或重启命令。
- 未用真实手机会话验收视觉效果；新开或重新加载的页面会取得新资源。

## 暂存内容

- 未清理本机 `node_modules`、`web/node_modules`、构建输出和源码暂存目录，等待用户确认。
- 服务器快照内首次带扩展属性的拒收候选仍保留于 `candidate/ts6-backstage-source.tar.gz`，未部署；干净候选为 `candidate/ts6-backstage-source-no-xattrs.tar.gz`。
