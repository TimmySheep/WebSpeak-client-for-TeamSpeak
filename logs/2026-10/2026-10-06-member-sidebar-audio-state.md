# 成员侧栏隐藏本机音频状态

- 日期：2026-10-06
- 对象：WebSpeak 网页端及 Intel NUC 静态前端

## 修改

- 成员侧栏不再显示当前网页用户自己的麦克风和扬声器状态；其他成员仍按 TeamSpeak 上报状态显示。
- 移除聊天页本机历史说明，以及音频设置中的浏览器音频/录音说明；移除相关多语言文案和聊天说明样式。
- 保留浏览器本地聊天历史、会话上限和服务端实现不变。

## 验证与部署

- `npm test`：33 项通过。
- 当前功能分支 `npm --prefix web run build`：Vue 类型检查通过，Vite 构建 191 modules 成功。
- 依据 NUC 当前 `ts6-backstage-source.tar.gz` 定制源码构建：Vue 类型检查通过，Vite 构建 190 modules 成功；产物保留 NUC 首页/PWA 品牌资源引用和 `screen-share-portrait-f54f514.css` 覆盖。
- 部署前快照：`/home/timmy/webspeak/backups/20261006-140537-CST-speaker-state/`，保存原首页、原 AGPL 源码归档、候选首页/JS/CSS/源码归档及 `SHA256SUMS`。
- 部署新哈希资源 `assets/index-CD_7ujcv.js`、`assets/index-fLs3jBVi.css` 和源码归档；最后原子切换 `index.html`。未删除旧资源，未更改后端或重启服务。
- 公网首页、新 JS/CSS 均 HTTP 200；线上入口保留竖屏共享覆盖引用。线上 JS SHA-256 与候选一致，聊天说明和音频隐私提示字符串不在新 bundle 中。`/health` 返回 `ok`、版本 `0.2.5`；容器 `StartedAt` 未变、重启次数为 0。
- 尚未用真实移动设备/TeamSpeak 会话手动验收侧栏图标交互；客户端需刷新页面载入新资源。

## GitHub

- 分支：`feat/local-chat-history`
- 提交：`3d810eb`（`fix: hide own mute states in member sidebar`）
- PR #23：<https://github.com/EchoSixHIYA/WebSpeak-client-for-TeamSpeak/pull/23>，状态 OPEN；GitHub `verify` 检查仍在运行，未报告为通过。

## 补充：语音中间卡片（2026-10-06）

- 用户反馈语音页面中间成员卡片仍显示本机麦克风/扬声器状态。NUC 定制源码中卡片徽标是独立模板，已只对 `inputMuted`、`outputMuted` 两个图标添加 `!member.isSelf` 条件；其他成员状态、离开状态及频道侧栏逻辑不变。
- NUC 定制前端 Vue 类型检查通过，Vite 构建 191 modules；`npm test` 33 项通过。
- 部署前快照：`/home/timmy/webspeak/backups/20261006-142757-CST-middle-card/`，保留原首页和 AGPL 源码归档，并包含部署候选文件及 `SHA256SUMS`。
- 公网首页已切换到 `assets/index-Bt3mHvEF.js` 与 `assets/index-s47vbxGl.css`，仍保留 `screen-share-portrait-f54f514.css` 覆盖；源码归档同步更新。公网首页 SHA-256 与候选一致，健康端点返回 `ok`/版本 `0.2.5`；WebSpeak 容器未重启（重启次数 0）。
- 客户端需刷新页面。尚未在真实设备语音会话中目视验收。此处修改仅适用于 NUC 定制卡片；上游通用客户端没有这套中间卡片徽标，PR #24 继续承载麦克风权限修复。

## 补充：移除桌面音量提示（2026-10-06）

- 按用户要求，移除桌面音量控制卡片中“悬停图标调整音量”提示及其英、德、俄、日译文；实际音量控件和悬停交互不变。伴奏共享激活时的状态提示保留。
- NUC 定制源码 `npm test` 33 项通过；Vue 类型检查通过，Vite 构建 191 modules 成功。
- 部署前备份：`/home/timmy/webspeak/backups/20261006-143120-CST-remove-hover-hint/`（含原首页/源码归档、候选资源及 `SHA256SUMS`）；公网回读哈希与候选一致。健康检查正常；未修改后端或重启容器。
