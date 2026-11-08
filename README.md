# dsh-think-autoexpand

DeepSeek Harness Web 客户端插件：让执行过程中的 Think 思考行始终可见并自动展开，并让 Agent 的思考语言跟随 Harness 界面语言。

## 功能

- 强制显示被 dsh-auto-collapse 等折叠插件隐藏的 `[data-variant="think"]` 思考行
- 思考行进入 `running`（流式输出中）状态时自动展开，完整思考过程实时可见
- 不干扰工具卡的折叠效果（保留 dsh-auto-collapse 对工具卡的行为）
- 每个回合注入中文语言规则（通过官方 agent/pre-step 机制）：始终强制中文思考（Think / reasoning）与回复
  - 规则本身用中文书写，避免自指矛盾
  - 兼容 minimal 等使用 complete persona 的预设（普通 system prompt 会被该预设丢弃）

## 安装

```bash
# 按实际的 profile 名替换 web（当前 GUI 用 web；desktop 由 Electron 独占）
# 用 fork 版：上游 0.3.0 仍带 v4 报错
dsh plugin --profile web add github:Duter2016/dsh-think-autoexpand
```

安装后重启 dsh Web 服务生效。

## 兼容性

- v0.3.1：修复 DSH 会话格式 v4 报错 `format v4 message requires a producer-owned source kind`。注入消息的 source 改为生产者自有 kind `plugin:dsh-think-autoexpand`（与官方对未知第三方插件的迁移命名一致），不再使用已退役的 `{ kind: 'plugin' }` 包装。
- v0.3.0 及更早版本仅适用于会话格式 v3（DSH 0.2.1 及更早）。

## 卸载

```bash
dsh plugin --profile web remove dsh-think-autoexpand
```
