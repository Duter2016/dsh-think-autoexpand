# dsh-think-autoexpand

DeepSeek Harness Web 客户端插件：让执行过程中的 Think 思考行始终可见并自动展开，并让 Agent 的思考语言跟随 Harness 界面语言。

## 功能

- 强制显示被 dsh-auto-collapse 等折叠插件隐藏的 `[data-variant="think"]` 思考行
- 思考行进入 `running`（流式输出中）状态时自动展开，完整思考过程实时可见
- 不干扰工具卡的折叠效果（保留 dsh-auto-collapse 对工具卡的行为）
- 注入 system prompt：思考过程与回复语言跟随 Harness 界面语言（设置 → 通用 → 语言）
  - Harness 语言为中文 → 始终用中文思考与回复
  - Harness 语言为 English → always think and reply in English
  - 未显式设置语言时 → 跟随用户最新消息的语言

## 安装

```bash
dsh plugin --profile web-desktop add github:2877905731/dsh-think-autoexpand
```

安装后重启 dsh Web 服务生效。

## 卸载

```bash
dsh plugin --profile web-desktop remove dsh-think-autoexpand
```
