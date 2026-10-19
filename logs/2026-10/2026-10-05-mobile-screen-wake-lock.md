# 手机语音会话保持屏幕唤醒

- 日期：2026-10-05
- 对象：WebSpeak 手机端语音会话

## 实现

- 手机端连接、通话和重连期间申请 Screen Wake Lock；离开会话后释放。
- 页面进入后台时释放系统锁，返回前台后重新申请。
- 移动端会话栏展示状态，并允许手动关闭或重试；不支持或系统拒绝时提示。
- 使用标准 Web API，不新增浏览器权限声明或 PWA manifest 权限。要求 HTTPS；iOS/iPadOS 主屏幕 Web App 需 18.4+。
- 增加唤醒锁生命周期测试和 CI 测试步骤，覆盖五种界面语言。

## 验证

- `git diff --check`、JSON、TypeScript 文件语法及五种语言文案检查：通过。
- Node 运行时检查：申请/释放、后台恢复、拒绝重试、请求取消竞态和不支持降级均通过。
- 本机未安装项目依赖，未安装新依赖；完整 `npm test` 和 Vue 构建未在本机运行。
- 上游 PR 的 GitHub Actions 状态为 `action_required`，尚未得到 CI 构建结果。

## 提交

- Commit：`88b1883` (`feat: keep mobile screen awake during voice sessions`)
- PR：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/16

## 后续修正（2026-10-05）

- PR #16 后续获上游合并，`verify` 和 `docker-smoke` 均通过。
- 根据 Timmy 的反馈，移除会话栏唤醒图标与手动开关；手机会话期间默认申请唤醒锁，仅在不支持或系统拒绝时提示。
- 新增后续 PR #17：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/17
- Commit：`a4f3384` (`fix: remove visible wake-lock control from chat`)
- PR #17 的 `npm test`、应用构建及 Docker health smoke test 均通过；PR 等待上游审阅。
- 状态更新：PR #17 随后于 2026-10-05 合并（merge commit：`e94ecb65ac9ca1cd453e84e82eedd854330b8cbf`）；`verify` 与 `docker-smoke` 均通过。

## NUC 自用服务部署（2026-10-05）

- 按 Timmy 授权，将合并后的标准 Screen Wake Lock 生命周期回移到 NUC 上基于 v0.2.5 的定制静态前端；没有覆盖用户首页定制、更新后端镜像/数据，也没有重启 WebSpeak 或 Caddy。
- 手机端连接、已连接和重连期间默认申请；页面隐藏或会话结束时释放，返回前台后重新申请。没有常驻图标或手动开关；浏览器不支持或设备设置拒绝时显示本地化提示。仅针对页面可见时的自动熄屏，不保证手动锁屏或后台状态下继续播放音频。
- 构建工具核查：复用现有 Node.js `v24.18.0`（项目要求 `>=22.5.0`）和 npm `11.16.0`；本机项目副本及隔离源码副本均无 `node_modules`。未安装系统工具、SDK 或全局构建依赖。
- 在隔离目录按锁文件安装：源码根目录 `npm ci --ignore-scripts --no-audit --no-fund`（194 packages），前端目录 `npm ci --no-audit --no-fund`（71 packages）。前端单独安装后首次类型检查因缺少根目录 Node 类型而未通过；按项目 Docker 构建顺序补装根依赖后解决，未改 package/lock 声明。最终 `npm run build` 通过（vue-tsc + Vite，189 modules）；完整 `npm test` 25 项全通过，五种语言降级文案检查通过。
- 部署前快照：NUC `/home/timmy/webspeak/backups/20261005-233554-CST-mobile-screen-wake-lock/`，包含原 `index.html`、原 AGPL 源码归档、原运维说明及 SHA-256 manifest；备份校验通过。
- 原子部署三个新哈希资源 `index-C580gJMJ.js`、`index-M5lJm8cB.css`、`workletProcessor-oeaMQ38w.js`，随后替换源码归档和运维说明，最后切换 `index.html`；保留旧哈希资源及竖屏共享 CSS 覆盖。首次归档验收发现 macOS 扩展属性记录，重新以 `tar --no-xattrs` 打包并原子替换；最终归档无扩展属性、`node_modules`、构建目录或 `.git`，哈希 `38e77901045236be0ccde784c3a8876ba17838f341585750c14df30dcd8787ad`。
- 验收：Express `3040`、Caddy `3041` 与公网 HTTPS 的首页、新 JS/CSS、worklet 和源码归档均 HTTP 200；首页及最终源码归档 HTTP 回读哈希与候选一致。WebSpeak 仍 healthy，镜像固定于原 v0.2.5，`StartedAt` 未变；Caddy 未重启。
- 没有真实 iPhone/Android 会话验收；iOS/iPadOS 主屏幕 Web App 需 18.4+。已打开页面继续用旧 bundle，新开或重新加载才会取得改动；正在通话时不要刷新页面。
