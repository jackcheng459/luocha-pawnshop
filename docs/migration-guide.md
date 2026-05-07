# Migration Guide

v1.5 的数据层已经从业务层拆开。迁移到其他平台或微信小程序时，优先保留业务类型和接口，再替换存储实现。

## 需要替换的文件

- `api/_storage.ts`

## 需要保留的业务契约

- `StoryStorage.save`
- `StoryStorage.get`
- `StoryStorage.exportAll`
- `PhraseStorage.save`
- `PhraseStorage.getRandom`
- `PhraseStorage.update`
- `PhraseStorage.exportAll`

## 导出接口

- 金句导出：`GET /api/admin/phrases/export?token={ADMIN_TOKEN}`
- 故事导出：`GET /api/admin/stories/export?token={ADMIN_TOKEN}`

## 环境变量

生产环境建议配置：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-pro
KV_REST_API_URL=
KV_REST_API_TOKEN=
ADMIN_TOKEN=
VITE_SITE_URL=https://www.luochapawnshop.top
```

## 迁移注意

1. 不引入用户账号作为迁移前提。
2. 故事公开访问只依赖 `storyId`。
3. 金句生成后台只依赖 `ADMIN_TOKEN`，不做完整账号系统。
4. 五项命数内部单位仍为钱，展示层才格式化为两/钱。
