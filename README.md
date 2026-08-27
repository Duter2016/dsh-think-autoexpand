# dsh-think-autoexpand

DeepSeek Harness Web 客户端小插件：让执行过程中的 Think 思考行始终可见并自动展开。

## 作用

- 强制显示被 dsh-auto-collapse 等折叠插件隐藏的 `[data-variant="think"]` 思考行
- 思考行进入 `running`（流式输出中）状态时自动展开，完整思考过程实时可见
- 不干扰工具卡的折叠效果（保留 dsh-auto-collapse 对工具卡的行为）

## 安装

```bash
dsh plugin --profile web-desktop add github:2877905731/dsh-think-autoexpand
```

安装后重启 dsh Web 服务生效。

## 卸载

```bash
dsh plugin --profile web-desktop remove dsh-think-autoexpand
```
