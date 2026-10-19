# 屏幕共享发现修复重新部署

- 日期：2026-10-06
- 对象：WebSpeak Intel NUC 生产后端
- 上游修复：GitHub PR #13，合并提交 `284ee06efa7ce08521424162f7dab25ee0263f93`

## 原因与修改

- 核查发现 PR #13 的修复此前曾在上游 `efb400d` 镜像中部署；后续扬声器静音部署将较旧编译版 `dist/` 叠加到该镜像，重新带入了 `screenStreamDiscoveryTargets` 的按服务器一次性扫描逻辑。
- 从 NUC 当前定制源码归档回建，仅移植 PR #13 的后端发现协调改动、helper 与测试；保留 flood-protection、`setOutputMuted` 和当前前端定制。不直接换成上游镜像，避免回退 NUC 的其他定制功能。
- 更新了生产公开源码归档以匹配部署后端；没有改动主页或前端 bundle。未安装依赖，复用现有锁文件匹配的依赖。

## 构建与验证

- TypeScript 后端构建通过；定制源码包 `npm test`：47 项通过，包括发现扫描可再次运行、重叠扫描合并及来源频道按服务器隔离测试。
- 候选编译代码同时包含屏幕共享重扫、扬声器静音同步和 flood-protection；无旧的一次性扫描 gate。
- 真实 TS6 原生共享端到端会话未执行；需之后由新加入的 WebSpeak 用户在实际频道中验收。

## 生产部署

- 新镜像：`webspeak:local-screen-share-pr13-20261006`；image ID `sha256:5cc35f2e18e8db536b7fbfe6eeb0f2607e976222bb861e7bc286e094490f5c3f`。基于当时运行的 `webspeak:local-output-mute-20261006`，保留既有静音与 flood-protection 实现。
- `WEBSPEAK_IMAGE` 已原子切换到新镜像；容器于北京时间 2026-10-06 19:55 启动。数据卷 `webspeak_webspeak-data` 与只读静态目录挂载未变。
- 只停止并重建 WebSpeak；停止前有 2 条 3040 已建立连接，期间会话短暂中断。Caddy 启动时间与重启计数不变；TeamSpeak 和 FRP 未重启。
- 容器读回为 `running / healthy`、重启计数 0、非 OOM；端口 3040、本机 Caddy 3041、公网 HTTPS `/health` 均返回 `ok` / 版本 `0.2.5`。
- 运行中 `/app/dist/server/voice-bridge.js` 已包含 `ScreenShareDiscoveryCoordinator` 和后续会话的 `requeststreaminfo` 扫描；`screenStreamDiscoveryTargets` 已不存在。
- 新公开源码归档 SHA-256：`2c4b8405d1f094bec8612f6ba35fe3753e8b11754f7b9ee23e66b6dad8b067cb`。

## 备份与回滚

- 部署快照：`/home/timmy/webspeak/backups/20261006-194558-CST-screen-share-pr13/`；包含旧 `.env`、Compose/运维说明、主页、旧源码归档、候选镜像输入及 `/data` 快照，私有校验清单排除了环境变量文件与主密钥内容。
- WebSpeak 正常停止，停服复制的数据快照中 SQLite `PRAGMA integrity_check` 为 `ok`，主密钥长度为 32 字节。此次无数据库 schema 或应用数据变更。
- 回滚时从快照恢复 `.env` 中原镜像 pin，原子恢复 `predeploy-source.tar.gz`，再仅重建 WebSpeak。旧 `webspeak:local-output-mute-20261006` 镜像仍保留；除非另有数据问题，不恢复 `/data`。

## 暂存文件

- 本机隔离构建及候选包保留在 `/private/var/folders/p1/3pqx3j392m381v0g293m9rgc0000gn/T/opencode/webspeak-screen-share-pr13-redeploy-20261006/`，未清理，等待用户确认后再处理。
- 本次没有改动本机项目源代码；既有未提交工作区内容保持原样。
