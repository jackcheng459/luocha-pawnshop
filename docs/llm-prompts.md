# LLM Prompts

## v1.5.0

当前生产 Prompt 位于：

- 命格、典当、当票：`api/llm.ts`
- 命主故事、临别金句：`api/_prompts.ts`

版本号写入字段：

- 命主故事：`promptVersion: "v1.5.0"`
- 临别金句：`promptVersion: "v1.5.0"`

## 维护规则

1. 修改 Prompt 前先新增版本号，不覆盖旧版说明。
2. 命主故事必须保持 300-500 字目标、白描、开放结尾。
3. 临别金句必须经后台审核后才进入业务随机取用。
4. 所有 LLM 调用失败都必须有 fallback，不阻断游戏主流程。
