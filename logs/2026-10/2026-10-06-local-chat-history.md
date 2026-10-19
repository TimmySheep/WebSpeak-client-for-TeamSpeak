# 本机聊天记录持久化

- 日期：2026-10-06
- 对象：WebSpeak 浏览器客户端与 Intel NUC 静态前端

## 实现

- 新聊天消息仅保存到浏览器现有 IndexedDB `webspeak-local`，数据库版本升至 v3；不增加服务器集中存储、跨设备同步或旧记录回填。
- 按 TeamSpeak 服务器目标与频道/服务器/私聊会话隔离；私聊优先使用对方 UID，缺少 UID 时使用客户端 ID 与名称，避免重连或客户端 ID 重用时串线。
- 每个会话保留最近 200 条；“清除本地数据”同时清除聊天记录。离线私聊保留阅读，但禁用发送，避免把旧客户端 ID 用于错误对象。
- 增加本机存储范围提示及中文、英文、德文、俄文、日文文案。
- 修正从成员菜单打开私聊时的选中键，使其与消息历史分区一致。

## 验证与部署

- 本地功能分支 `feat/local-chat-history` 提交：`1bb8142`（本地聊天记录）和 `3da4933`（私聊键修正与测试）；另保留已部署移动语音标签/导航提交。该功能分支尚未推送到 GitHub。
- 当前 NUC 定制源码 `npm test`：31 项通过；功能分支 `npm test`：33 项通过。定制源码 Vue 类型检查通过，Vite 构建 189 modules 成功；功能分支前端构建 191 modules 成功。测试脚本同时合并了原重复的 `test` 键，并纳入新测试。
- 新生产资源：`assets/index-CYu4Kzn4.js`、`assets/index-F3ciYNXf.css`；更新源码归档。保留 NUC 首页、PWA 图标/元数据、移动语音优先导航、屏幕共享竖屏覆盖 CSS 及旧哈希资源。
- 部署前快照：`/home/timmy/webspeak/backups/20261006-033609-CST-local-chat-history/`，包括原入口页、源码归档、运维说明和 SHA-256 清单。
- Intel NUC Express 3040、Caddy 3041 与公网 HTTPS 页面及新 JS/CSS 均返回 HTTP 200；健康端点为 `ok`。WebSpeak 容器 `StartedAt` 与重启计数前后不变，本次没有重启服务。
- 尚未用真实浏览器会话验证 IndexedDB 写入/重开/清除，也未远程操作手机。需 Timmy 重新打开或刷新页面后自行确认设备端行为。
