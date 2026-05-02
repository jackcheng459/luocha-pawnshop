# 罗刹当铺

《罗刹当铺》是一个 React + Vite + Tailwind CSS 实现的 H5 志怪小游戏。玩家入店后抽取命签，以身上的“气、尘、贪、妄、悔”为筹码完成三笔典当，最后得到一张带故事评语的当票卡。

线上体验：https://luocha-pawnshop.vercel.app

## 作品亮点

- 90 到 120 秒完整体验：雾门入店、掌柜问来意、摇命签、典当交易、续签和当票离店形成一条完整叙事。
- DeepSeek API 通过 Vercel Function 代理调用，前端不暴露 key；所有 LLM 结果都有本地 fallback，接口失败也不影响主流程。
- 命格卡和当票卡支持一键导出 PNG，适合比赛展示和社交分享。
- 古风纸纹、墨幕转场、掌柜台词、程序化音效与 CC0 背景音乐共同构成“聊斋骨”的店内氛围。

## 技术栈

- React 19 + Vite
- TypeScript
- Tailwind CSS
- useReducer 状态机
- framer-motion 动效
- html2canvas 分享卡导出
- Vercel Functions LLM proxy

## 本地启动

```bash
npm install
npm run dev
```

本地完整测试 `/api/llm` 时建议使用：

```bash
npx vercel@latest dev
```

## 环境变量

复制 `.env.example` 后填入本地 key。不要提交真实 key。

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-v4-flash
```

线上部署时在 Vercel Project Settings 或 Vercel CLI 中配置同名环境变量。

## 常用命令

```bash
npm run lint
npm run build
npx vercel@latest deploy --prod
```

## 目录说明

- `src/App.tsx`：主流程和场景切换
- `src/game/reducer.ts`：核心状态机
- `src/game/rules.ts`：交易、资源和价格规则
- `src/data/fateStories.ts`：命签故事与分享文案
- `src/services/llmClient.ts`：前端 LLM 调用与 fallback
- `api/llm.ts`：Vercel Function 代理 DeepSeek API
- `public/images/`：游戏视觉资产
- `public/audio/`：音频资产与授权说明
- `docs/`：设计、接入和素材说明

## 开源与素材说明

代码采用 MIT License。

当前仓库内 BGM `public/audio/bgm/a-really-dark-alley.mp3` 来自 Wikimedia Commons / Free Music Archive，许可为 CC0 1.0。程序化音效由 Web Audio API 实时生成。

本地文件 `public/audio/bgm/luocha.mp3` 和根目录 `罗刹当铺.mp3` 未纳入开源仓库，避免授权边界不清影响公开分发。`Night-Patrol` 仅作为交互设计参考，本项目未复制其代码和素材。
