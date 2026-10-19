# PWA 安全区与系统主题适配

- 日期：2026-10-06
- 对象：WebSpeak Web/PWA 前端

## 修改

- 在 `web/index.html` 的 viewport meta 增加 `viewport-fit=cover`，让 iOS 安全区变量可用；沿用现有移动底栏 `env(safe-area-inset-bottom)` 内边距和页面底部预留。
- 主题模式保留 `system`，不再在客户端初始化时固化成当下的浅色或深色；在未手动选择日/夜皮肤时，内置皮肤随设备 `prefers-color-scheme` 改变。
- 系统主题变化时同步原生控件 `color-scheme` 和浏览器/PWA `theme-color`；明确选择日/夜皮肤仍作为用户覆盖选项。Demo 页面也使用相同的主题跟随行为。
- 没有部署到 Intel 服务器。

## 验证

- `npm test`：22 项通过。
- `npm --prefix web run build -- --outDir /private/var/folders/p1/3pqx3j392m381v0g293m9rgc0000gn/T/opencode/webspeak-pwa-theme-build-final-0f364d4c`：Vue 类型检查通过；Vite 转换 191 modules 并构建成功。
- 静态断言确认 viewport-fit、底栏安全区 padding、系统主题模式保留及动态颜色处理。
- 未在真实 iPhone/iOS PWA 上验收；PR 的 GitHub `verify` 检查创建时仍在运行。
- 构建输出提示根 `package.json` 有重复 `test` 键；本任务未改动该既有问题。

## GitHub

- 分支：`fix/pwa-safe-area-system-theme`
- 提交：`a141774`（`fix: respect PWA safe area and system theme`）
- PR #22：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/22（OPEN，未合并）
- 提交仅包含 `web/index.html` 的 viewport 改动及 `theme.ts`、`WebClient.vue`、`DemoView.vue`。工作区原有首页 PWA metadata、图标与图片改动未暂存、未提交。
- 后续回读：GitHub `verify` job 在 5 分钟后仍为 `queued`（尚未开始）；本地测试和构建已通过，未将远端 CI 标记为成功。

## 后续：语音页控制栏位置

- 将移动端语音标题、麦克风/扬声器静音切换、退出按钮合并为一个吸顶栏；滚动语音成员区时仍固定在标题下方。
- 仅在移动端语音页隐藏顶栏中重复的麦克风与退出按钮；频道页、聊天页及桌面布局不变。
- `npm test`：22 项通过；Vue 类型检查及 Vite 构建通过；静态断言确认标题和控制栏组成单一吸顶组。
- 提交：`dfddf15`（`fix: pin mobile audio controls below voice heading`），已推送到同一分支并更新 PR #22。
- 未在真实 iPhone 上确认滚动手感；本次没有部署服务器。

## 后续：语音控件固定在底部导航上方

- 将麦克风、扬声器、退出频道三个控件从语音标题的滚动内容中移出，放入与四项移动导航同一固定 dock；仅语音页显示控件栏。滚动成员列表时，控件栏与导航保持在视口底部。
- 为控件栏、导航栏及 iOS 安全区预留工作区高度；成员菜单在语音页弹出时避开 dock。补充窄屏麦克风按钮的动态无障碍名称。
- `npm test`：34 项通过；`npm --prefix web run build`：Vue 类型检查及 Vite 构建通过（191 modules）。
- 使用隔离 Chromium 在 390×844 移动视口核验含 30 位成员的本地布局 fixture：dock 底边为 y=844，控件栏占 y=706–770，导航占 y=770–844；成员内容独立滚动。该测试不是实际 iPhone/PWA 验收。
- 提交 `f0b1944`（`fix: dock mobile voice controls above navigation`），已推送并更新现有 PR #22；PR 保持 OPEN，GitHub `verify` 检查目前 pending。没有部署或重启生产服务。
- 仅将 `web/src/views/WebClient.vue` 与 `web/src/styles/web-client.css` 纳入提交；工作区已有的后端、首页/PWA、图标及其他未提交文件均未纳入。

## 后续：移动端离开状态与成员音频状态

- 移除移动端顶栏重复的麦克风开关，保留分享、网络测试与音频设置入口；在语音页 dock 和频道页工具栏中将离开状态放在扬声器与退出之间，并在“更多”中加入扬声器和离开操作。
- 仅移动触控设备在页面进入后台时自动标记 TeamSpeak 离开，回到前台时只撤销本功能自动设置的状态；桌面不自动切换，断线后后台重连会重新应用离开状态。手动离开状态不会被自动恢复流程清除。
- 语音成员卡片、频道成员列表显示离开、麦克风及扬声器状态；消息发送者显示离开标记。未从服务端取得的音频/离开状态明确显示为未知，不假定为开启或在线。
- 麦克风开关增加两种短提示音，沿用通知音量和整体静音设置；新增移动后台状态控制器及状态机测试，并更新皮肤状态契约中的 `away` 状态。
- `npm test`：34 项通过；新增移动后台控制器测试单独运行 6 项通过；`npm --prefix web run build` 的 Vue 类型检查及 Vite 构建通过。
- 根目录 `npm run build` 未能验证：本机缺少 `@echosixhiya/teamspeak-client` 安装包，造成既有服务端模块的 TS2307 连带类型错误；未安装依赖。未改动服务端源文件，未部署或重启生产服务，也未在真实 iPhone/PWA 上验收。
- 本地提交 `c471c7c`（`feat: add mobile away and member audio status`）仅包含上列 9 个前端与皮肤契约文件；其他已有未提交更改仍留在工作区。
- 推送 `origin/fix/pwa-safe-area-system-theme` 被 GitHub 以 HTTP 403 拒绝（Permission denied）；没有执行其他 GitHub 写操作，PR #22 尚未包含此提交。已发送 ntfy 受阻通知。

## 后续：补齐本地 SDK 并更新 PR

- 复查确认先前写的“缺少 SDK 安装包”不够准确：`npm ls` 显示 `@echosixhiya/teamspeak-client@0.2.4`，但项目 `node_modules` 内仅有 `LICENSE`、`package.json`、`README.md`（约 20 KB），缺少构建入口 `dist/index.mjs`；npm 缓存也未发现该包。项目 `package.json` 与 lockfile 均将 SDK 固定到 commit `56d426d24852c39439f7bfe1d5850b574a1b0811`。
- 按用户授权修复本机依赖：使用已存在的 Node.js `v24.18.0` / npm `11.16.0`，在代理环境变量已指向本机 Clash `127.0.0.1:7890` 的情况下，将上述固定 commit 克隆到 `/private/var/folders/p1/3pqx3j392m381v0g293m9rgc0000gn/T/opencode/teamspeak-sdk-c471c7c`；运行 `npm install --ignore-scripts --no-audit --no-fund`（88 packages）及 SDK `npm run build` 成功，并将生成的 `dist` 补入项目现有 `node_modules/@echosixhiya/teamspeak-client/`。未改 `package.json`、lockfile、全局工具或服务端源码；未安装全局依赖。SDK 目录现约 1.7 MB。
- 验证：根目录 `npm run build -- --noEmit`（TypeScript 检查）通过；`npm test` 34 项通过。SDK 构建有 Vite `configLoader: native` 关于 `__dirname` 的前瞻性警告，但构建成功。
- PR head 实际位于 `fork`（`TimmySheep/WebSpeak-client-for-TeamSpeak`），不是先前尝试的上游 `origin`；按此修正后 `git push fork fix/pwa-safe-area-system-theme` 成功。PR #22 仍为 OPEN，head 为 `c471c7ce9d34ebddc953887d06e0434058c344c8`；GitHub `verify` 检查回读时仍为 IN_PROGRESS/pending，未报告为通过。
- SDK 构建克隆及其 `node_modules` 保留在上述临时目录（约 110 MB），没有执行清理。真实 iPhone/PWA 验收仍待完成；未部署或重启生产服务，其他原有未提交改动保持不变。

## 部署更新（2026-10-06）

- 按 Timmy 明确要求，将 PR #22 head `c471c7ce9d34ebddc953887d06e0434058c344c8` 的前端功能移植到 Intel NUC 当前定制 v0.2.5 前端源码并部署；保留现有简化首页、品牌/PWA 图标、浏览器本地聊天历史及竖屏共享 CSS overlay。未更改后端镜像、协议、数据、TeamSpeak 配置或 Compose，也未重启 WebSpeak/Caddy。
- 部署前快照及校验清单：服务器 `/home/timmy/webspeak/backups/20261006-133043-CST-pr22-mobile-away-status/`；包括原首页、原源码归档、运维 README、SHA-256 清单及本次确切候选文件。
- 发布 `assets/index-BUJjeWiL.js`、`assets/index-DojViKUg.css` 和相应 AGPL 源码归档，保留原有哈希资源；原子切换 `index.html` 最后。入口保留原 PWA/图标元数据及 `screen-share-portrait-f54f514.css`，并加入 `viewport-fit=cover`。
- 候选源码 `npm test` 31 项通过，后台离开控制器测试 6 项通过；`npm --prefix web run build` 的 Vue 类型检查及 Vite 构建通过（190 modules）。Express 3040、Caddy 3041、公网 HTTPS 的首页、新 JS/CSS、共享 overlay 与源码归档均返回 HTTP 200；公网 JS/CSS/归档 SHA-256 与暂存候选一致。`/health` 返回 `ok`/版本 `0.2.5`；容器 `StartedAt` 保持 `2026-10-05T21:05:13.329125217Z`、重启次数为 0。
- 现有页面/语音会话仍使用已载入的旧 bundle；重新加载或重新打开 `https://ts-panel.u675805.nyat.app:13489` 后才会加载新前端。真实 iPhone/PWA 视觉与交互验收仍待 Timmy 完成；此次部署没有合并 PR #22。

## 后续：离开状态图标优化（2026-10-06）

- 按 Timmy 的要求保留图标式切换，不新增按钮可见文字。用“人形＋小钟”`user-clock` 表示切换为离开，用“人形＋勾号”`user-check` 表示恢复在线；退出语音仍使用独立门箭头图标。更多面板原有的菜单文字未改。
- `npm test`：34 项通过；移动后台离开控制器测试：6 项通过；`npm --prefix web run build`：Vue 类型检查及 Vite 构建通过（192 modules）。
- 本轮只修改本地 `Icon.vue` 与 `WebClient.vue`，没有推送或部署；真实移动设备图标尺寸与辨识度尚未验收。

## 临时产物移入废纸篓（2026-10-06）

- 经 Timmy 明确授权，将本轮列出的三个临时目录使用 `mv` 移入 `/Users/TimmySheep/.Trash/20261006-141046-CST-opencode-temp-cleanup/`，保留原路径层级；没有永久删除，也没有清理废纸篓。
- 发布候选目录（约 73 MB）移至 `private/var/folders/p1/3pqx3j392m381v0g293m9rgc0000gn/T/opencode/webspeak-deploy-c471c7c/`；其两个绝对符号链接仍指向项目 `node_modules`，目标未移动。
- SDK 临时构建克隆（约 110 MB）移至 `private/var/folders/p1/3pqx3j392m381v0g293m9rgc0000gn/T/opencode/teamspeak-sdk-c471c7c/`；项目 `node_modules/@echosixhiya/teamspeak-client/dist` 保留。
- 忽略的本地前端构建输出 `web/dist`（约 6.7 MB）移至 `Users/TimmySheep/AWS/webspeak/web/dist/`；移前确认没有进程打开该目录中的文件。项目源码、现有未提交工作区改动及服务器回滚快照均未移动。
