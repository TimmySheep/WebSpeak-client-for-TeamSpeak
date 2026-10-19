# 移动端语音控制优化

- 日期：2026-10-06
- 对象：WebSpeak 网页端移动 UI

## 实现

- 在移动端频道成员页和语音页添加麦克风静音、扬声器静音、离开服务器三个操作；静音按钮尺寸更大，离开按钮更紧凑。
- 扬声器按钮复用现有 `outputMuted`/`toggleOutputMute` 行为。
- 移动端语音页标题显示当前频道名；聊天页标题继续使用当前聊天名。
- 未参考或修改苹果客户端设计，按用户要求暂缓。

## 验证与部署

- 依赖核查：复用已有 Homebrew Node.js `v24.18.0`（`node@24`）与 npm `11.16.0`；本机原工作区根目录和 `web/` 均没有 `node_modules`，`npm ls` 确认项目锁文件依赖缺失。
- 安装：根目录运行 `npm ci --ignore-scripts --no-audit --no-fund`（194 packages）；`web/` 运行 `npm ci --no-audit --no-fund`（71 packages）。为保留 NUC 特有首页，在隔离源码副本 `/Users/TimmySheep/AWS/webspeak-deploy-mobile-voice-controls-20261006/` 基于线上源码归档移植并另行运行同样两个锁文件安装命令（根 194、前端 71 packages）。未安装全局工具或改动 package/lock 文件。
- 本机完整 `npm test`：19 项通过；`npm run web:build`：通过。根 `npm run build` 未通过，因锁定的 TeamSpeak SDK 需单独执行 `prepare:sdk` 生成 dist；本次只部署前端，没有运行 SDK 准备或后端构建。
- NUC 定制源码隔离副本的 `npm test`：25 项通过；`web/npm run build`（Vue 类型检查 + Vite）：通过，189 modules transformed。
- 部署前快照及 SHA-256 清单：`/home/timmy/webspeak/backups/20261006-001750-CST-mobile-voice-controls/`。先上传并校验新哈希 JS/CSS 与 AGPL 源码归档，再原子切换 `index.html`；原有 PWA/品牌定制、竖屏共享 CSS 覆盖及旧哈希资源保留。
- Express `3040`、Caddy `3041`、公网 HTTPS 的首页、新 JS/CSS、源码归档均 HTTP 200；公网回读哈希与本地构建一致。`/health` 为 `ok`，容器 `StartedAt` 未变；没有重启 WebSpeak 或 Caddy，已连接用户不会因部署断线。现有页面需刷新/重新打开才会载入新版。
- 未完成真实手机语音会话验收。

## 上游

- Commit：`63d7527`（`feat: add mobile voice audio controls`）
- PR：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/18
- PR 已创建；`verify` 与 `docker-smoke` 均成功，检查对应 head `63d7527`。
- 构建副本、构建产物及依赖目录暂保留，尚未清理，等待用户确认清理范围。

## 后续：将目标频道放入设备身份选项

- 将已有的可选目标频道输入从首页主体移入折叠的「设备身份选项」，保留原频道名称输入、查询参数及加入行为；进入前没有服务器频道列表，因此不新增下拉目录或服务端请求。
- 在本机上游源码与 NUC 定制源码副本分别通过测试（22 项、25 项）及 Vue 类型检查/Vite 构建（191、189 modules）。
- Commit：`9a0868f`（`feat: move target channel into identity options`）。PR：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/19；`verify`、`docker-smoke` 均通过。
- NUC 静态部署备份：`/home/timmy/webspeak/backups/20261006-004721-CST-identity-channel-choice/`。更新版 `index.html` 只切换 JS/CSS 哈希并保留首页定制及屏幕共享覆盖；源码归档同步更新。
- Express 3040、Caddy 3041、公网 HTTPS 的首页、JS、CSS、源码归档均返回 HTTP 200。健康检查正常，WebSpeak 容器 `StartedAt` 未变；未重启服务。
- 未通过 AI 浏览器远程查看手机真实渲染；该运行环境无法驱动浏览器面板。请手机重新打开/刷新首页后展开「设备身份选项」验收。

## 后续：修复移动端皮肤菜单遮挡

- 原因：更多/设置页的皮肤菜单为绝对定位浮层，不占布局空间，会覆盖后续语言选择；菜单也处在可滚动面板内。
- 修改：仅移动端更多页的皮肤菜单改为触发按钮下方的普通布局内容，展开时推开语言选择；长选项列表限定最大高度并在菜单内滚动。桌面端及首页顶部菜单不变。
- 本机与 NUC 定制源码副本分别通过测试（22 项、25 项）及 Vue 类型检查/Vite 构建（191、189 modules）。
- Commit：`fdac90b`（`fix: keep mobile skin menu clear of language selector`）。PR：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/20；`verify` 与 `docker-smoke` 均通过。
- NUC 部署前快照：`/home/timmy/webspeak/backups/20261006-005641-CST-mobile-skin-menu/`。部署 JS/CSS 和源码归档后原子切换首页 HTML；保留既有首页定制及其他样式。
- Express 3040、Caddy 3041、公网 HTTPS 的首页、JS、CSS、源码归档均 HTTP 200；WebSpeak 健康，`StartedAt` 未变；未重启任何服务。
- 未能通过远程浏览器实际操作手机验收；需在手机关闭旧页并重新打开后，进入「更多/设置」展开皮肤菜单确认语言项已被推到菜单下方。

## 后续：统一移动端麦克风与扬声器按钮名称

- 移动端频道成员页、语音页、「更多」页及音频设置中的麦克风控件，固定显示「麦克风」；语音页和频道成员页的输出控件固定显示「扬声器」。状态继续由现有颜色区分：静音/关闭为红色，开启为主题色；保留 `aria-pressed` 和状态提示。将窄屏（≤390px）原先隐藏的按钮文字重新显示，并调整按钮弹性宽度。
- 补齐中、英、德、俄、日五种界面的「扬声器」标签。
- 本机测试 22 项通过，Vue 类型检查与 Vite 构建通过（191 modules）；NUC 定制源码测试 25 项通过，构建通过（189 modules）。`npm --prefix web run build` 输出项目原有 package.json 重复 `test` 键警告，构建成功。
- Commit：`978dee7`（`fix: clarify mobile audio control labels`）。PR：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/21；`verify` 和 `docker-smoke` 均通过，PR 保持 OPEN。
- NUC 静态更新哈希资源为 `index-BP8Hy5vd.js` 与 `index-X6teRnG2.css`；同步更新定制源码归档，保留目标频道设置、移动皮肤菜单修复、首页/PWA 元数据及竖屏共享样式。
- 部署前快照：`/home/timmy/webspeak/backups/20261006-023657-CST-mobile-audio-labels/`。Express 3040、Caddy 3041、公网首页/JS/CSS/源码归档回读均 HTTP 200，健康检查正常，WebSpeak `StartedAt` 未变化；没有重启 WebSpeak/Caddy。
- 已按 Timmy 授权清理并移入 Mac 废纸篓 `/Users/TimmySheep/.Trash/20261006-023657-mobile-audio-labels/`，保留相对路径：主项目 `node_modules`（85 MB）、`web/node_modules`（65 MB）、`web/dist`（6 MB）、隔离构建源码目录（175 MB）、构建输出目录（99 MB）。目标均非符号链接；检查时无相关构建进程或打开文件。
- 已把 NUC 未引用旧临时包（16,921,494 bytes；SHA-256 `8e3564186e9f9b9238bf226e9523f8230aab178dc4d8d3cb7d2cb2e6754f818c`）移入 `/home/timmy/.local/share/Trash/files/20261006-023657-mobile-audio-labels/home/timmy/webspeak/ops/production-web-dist/open-source/`，并回读核验哈希；未触碰生产源码归档、静态资源或部署备份。
