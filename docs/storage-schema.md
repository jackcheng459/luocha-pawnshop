# Storage Schema

## Stories

Key: `story:{storyId}`

Value: `FateStoryRecord`

核心字段：

- `storyId`: UUID
- `fateName`: 命格名
- `fateJudgment`: 判词
- `initialResources`: 开局五项命数，单位为钱
- `finalResources`: 离店五项命数，单位为钱
- `trades`: 本夜交易摘要
- `drewLot` / `lotResult`: 是否抽签及结果
- `timestamp`: 古典纪年时间
- `storyText`: 命主故事正文
- `generatedAt`: Unix 毫秒时间戳
- `llmModel`: LLM 模型名或 `fallback`
- `promptVersion`: Prompt 版本

## Phrases

Key: `phrase:{phraseId}`

Value: `Phrase`

索引：

- `phrase:index:by_type:{type}`: approved 状态的指定类型金句 ID 集合
- `phrase:index:{status}`: 指定状态金句 ID 集合

状态：

- `pending_review`
- `approved`
- `rejected`
- `archived`

## Storage Abstraction

服务端只通过 `api/_storage.ts` 中的 `StoryStorage` 与 `PhraseStorage` 接口读写。

当前默认实现：

- 已配置 `KV_REST_API_URL` 与 `KV_REST_API_TOKEN` 时使用 Vercel KV/Upstash REST。
- 未配置 KV 时使用内存 fallback，保证开发和演示流程不死，但不承诺跨请求永久保存。

## Player Contributions

Key: `contribution:{id}`

Value: `ContributionRecord`

采集范围：

- 玩家填写的典当物名称
- 玩家填写的来历
- 典当命数维度和数量
- LLM 或 fallback 改名后的风物名
- 对应节气和命格

默认状态：`pending_review`

这些记录只作为内容生长素材，不存昵称、头像、账号或可识别身份。

导出接口：

- `GET /api/admin/contributions/export?token={ADMIN_TOKEN}`
