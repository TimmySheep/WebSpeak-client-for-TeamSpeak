# 手机竖屏屏幕共享被裁切

- 日期：2026-10-05
- 对象：WebSpeak 网页端屏幕共享播放器

## 排查结论

观看端将远端 MediaStream 直接挂载到 `<video>`，WebRTC 视频没有在服务端重编码。播放器舞台是带 `overflow: hidden` 的 16:9 grid；视频作为 grid 子项同时设置 `width: 100%` 与 `height: 100%`，竖屏源的固有尺寸可能影响网格项目尺寸，导致超出舞台后被裁切。此结论来自代码路径与 CSS 约束检查，未在真实手机共享会话中复现。

## 修复

- 将播放器视频绝对定位到舞台边缘，使其不再参与 grid 固有尺寸计算。
- 保留 `object-fit: contain`，完整显示横屏和竖屏来源。
- 增加 CSS 回归断言。

## 验证

- `git diff --check`：通过。
- 独立 CSS 契约断言：通过。
- `npm test`：因本地未安装项目依赖、缺少 `tsx` 而无法运行；未安装依赖。

## 提交

- Commit：`f54f514` (`fix: keep portrait screen shares within viewer stage`)
- PR：https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/15

---

## 追加记录（2026-10-05）—— 生产静态前端部署

- 按用户请求，将等效 CSS-only 修复部署到 Intel NUC 当前自定义静态前端；更新 AGPL 源码归档的 CSS 与回归断言，并在原 stylesheet 后添加一个小型 overlay 样式。
- 变更前备份、回滚说明及哈希清单记录于服务器 `/home/timmy/webspeak/backups/20261005-screen-share-portrait/`。
- Express、Caddy、公网 HTTPS 首页和 overlay CSS 均 HTTP 200；源码归档内容核对通过。服务健康且容器 StartedAt 未变，没有重启或强制刷新页面。
- 未通过真实手机屏幕共享会话验收；线上资源部署成功，但实际设备画面仍待用户验证。
