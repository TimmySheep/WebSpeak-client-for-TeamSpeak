# 网页扬声器静音状态同步到 TeamSpeak

- 日期：2026-10-06
- 对象：WebSpeak 网页端、语音网关与 TeamSpeak 客户端状态

## 实现

- 浏览器扬声器静音按钮在切换时通过 WebSocket 发送 `setOutputMuted`；会话就绪/重连后发送当前状态。
- 服务端校验布尔状态并调用 TeamSpeak 客户端 `clientupdate client_output_muted=0|1`，使服务器目录中的成员扬声器状态可供其他成员端显示。
- TeamSpeak 输出静音同步沿用现有状态变更命令队列、连接代次校验、flood protection 有界重试和成功后状态去重；重连会使缓存失效。
- 浏览器本地音频静音行为未改变；此状态是客户端报告的扬声器静音状态，并非服务器对物理设备的检测。

## 验证与范围

- `npm test`：38 项通过，其中新增输出静音状态去重/重连及 WebSocket 协议验证测试。
- `npm run build`：TypeScript 后端构建通过。
- `npm --prefix web run build`：Vue 类型检查通过，Vite 构建 192 modules 成功。
- 尚未对当前运行服务器执行集成验证或部署；需要服务器端实测确认 `client_output_muted` 更新事件在目标 TeamSpeak 服务及客户端中可见。
- 未提交代码。工作区原有未提交改动保留，未尝试重置或覆盖。

## 生产部署补充（2026-10-06）

- 按 Timmy 授权应用到 Intel NUC。生产后端以已运行的 `webspeak:local-floodfix-b0e9638e` 为基底，仅叠加本次编译的后端 `dist/`；因此保留先前 flood-protection 修复，未带入工作区其他屏幕共享、PWA 或界面改动。新镜像为 `webspeak:local-output-mute-20261006`（image ID `sha256:96dae00a6cd41797e8fc0db7d1e36a4b6ddf767aa2a8393a52600d3de78c0b85`）。
- 更新 NUC 定制前端哈希资源 `assets/index-DDazDPo-.js`，保留 `assets/index-CzoXIear.css`、竖屏共享覆盖及原 PWA 元数据；AGPL 源码归档同步更新。
- 部署前快照：`/home/timmy/webspeak/backups/20261006-144802-CST-output-mute/`，包括原 `.env`、index、源码归档、运维 README 和停服后 `/data` 的一致性归档（DB/WAL/SHM/`master.key`）。
- WebSpeak 单独重建，语音连接在更新期间可能中断；Caddy、TeamSpeak、FRP 未重启，数据卷未更换。新容器健康、重启次数 0；本机与公网健康端点均返回 `ok`/版本 `0.2.5`。公网回读的 index、JS、源码归档哈希与候选一致。
- 尚未使用真实网页和另一位成员端做静音图标端到端验收；请刷新页面，切换扬声器静音后由朋友确认图标变化。未提交代码，也未创建上游 PR。

## 经 Timmy 授权移入回收站（2026-10-06）

- 本机本次构建/暂存文件及 `web/dist/` 移至 `/Users/TimmySheep/.Trash/20261006-150940-output-mute-cleanup/`，按原路径层次保存；构建源码中的两个依赖符号链接随目录移动，目标依赖目录未移动。
- 服务器本次部署快照目录经 `gio trash` 从 `/home/timmy/webspeak/backups/20261006-144802-CST-output-mute/` 移至 `/home/timmy/.local/share/Trash/files/20261006-144802-CST-output-mute/`；`.trashinfo` 已核对原始路径和时间。快照未永久删除，恢复前须先从服务器回收站取回。
- 只处理本次扬声器同步部署的临时项和专属快照；更早备份、预先存在的根 `dist/`、生产/回滚 Docker 镜像、项目源文件、依赖目标目录和运行服务均未清理或更改。

## 生产首页脚本引用修正（2026-10-06）

- 部署后发现自定义 `index.html` 将入口写为 `/assets/index-DDazDPo-`，漏掉 `.js` 扩展名；Express SPA fallback 对该错误 URL 返回了 HTTP 200 的 HTML，导致浏览器无法执行 `<script type="module">`，表现为页面打不开。
- 已将首页引用修正为 `/assets/index-DDazDPo-.js` 并原子切换；该 URL 公网返回 `200` 且 `Content-Type: text/javascript`。首页与健康端点正常；未重启 WebSpeak 或 Caddy。
- 修复前首页快照：`/home/timmy/webspeak/backups/20261006-151350-CST-fix-script-extension/pre-fix-index.html`。修复后无需刷新后端；请重新载入/刷新浏览器页面。
