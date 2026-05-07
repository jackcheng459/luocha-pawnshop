# DeepSeek API 接入说明

本项目已经通过 Vercel Function `api/llm.ts` 做了后端代理。前端只请求 `/api/llm`，不会接触 `DEEPSEEK_API_KEY`。

## 本地配置

1. 在项目根目录复制环境变量示例：

```bash
cp .env.example .env.local
```

2. 打开 `.env.local`，填入自己的 DeepSeek API key：

```bash
DEEPSEEK_API_KEY=sk-your-real-key
DEEPSEEK_MODEL=deepseek-v4-pro
```

3. 本地要测试 Vercel Function 时，用 Vercel dev，而不是只跑 Vite：

```bash
npx vercel@latest dev
```

Vite 本身只负责前端开发服务器，`/api/llm` 需要 Vercel dev 才能在本地完整模拟。

## 线上配置

推荐在 Vercel Dashboard 设置，不要把 key 粘到聊天或代码里。

1. 打开 Vercel 项目 `luocha-pawnshop`
2. 进入 `Settings` -> `Environment Variables`
3. 新增：

```text
DEEPSEEK_API_KEY = 你的 DeepSeek API key
DEEPSEEK_MODEL = deepseek-v4-pro
```

4. Environment 选择 `Production`，需要预览环境也可以同时选择 `Preview`
5. 保存后重新部署：

```bash
npx vercel@latest deploy --yes --prod
```

## 调用链路

```text
React 页面
  -> src/services/llmClient.ts
  -> POST /api/llm
  -> api/llm.ts
  -> DeepSeek /chat/completions
```

当前三类 LLM 调用：

1. `fate`：生成命格名、签语、签背小字、命签小传、分享短句
2. `pawn`：改写典当物名、生成掌柜估价台词
3. `receipt`：生成当票故事、临别赠言、交易动词

命主故事生成走 `api/story/create.ts`，服务端明确指定 `deepseek-v4-pro`，用于承接 v6.0 命主故事 prompt。

每类调用都有本地 fallback。DeepSeek 失败、超时、返回不合法 JSON 或命中安全词时，主流程不会中断。

## 线上检查

部署后可访问：

```text
https://你的域名/api/llm
```

返回 `configured: true` 且 `provider: "deepseek"`，说明 Vercel Function 已识别到 `DEEPSEEK_API_KEY`。这个接口只暴露 provider 和 model，不会返回 key。

当前 DeepSeek 请求默认使用 `deepseek-v4-pro`。前端超时或服务端失败时会使用本地文案兜底，主流程不会中断。
