# 罗刹当铺升级记录

## 2026-05-07 v1.5.1 抽签机制升级

提交计划：`feat(lot): add v1.5.1 dual-track lot flow`

升级内容：

- 将交易后段从“自由做满三笔”升级为“卖满三笔或买满三笔后强制抽签”。
- 新增上签、中签、下签的完整分支：
  - 上签：可保留原账、反悔离店、反悔后重做一笔。
  - 中签：必须再做一笔，买价翻倍，卖出折损加重。
  - 下签：折慧五钱，不足则扣尽，随后结当。
- 当票卡新增“签落”独立记录，放在交易记录与五维账目之间。
- 命主故事输入补充签运结果、签运效果、是否接受额外交易、重做交易类型。
- 中签若已无可典、亦无可买，也会写入签落记录后离店。

验证状态：

- `npm run build` 已通过。
- Vite chunk size warning 保留，不影响当前 H5 比赛交付。

## 2026-05-07 文档与开源口径整理

提交计划：`docs: organize upgrade notes and refresh README`

升级内容：

- README 主流程更新为“摇签问命、卖物取物、签落改局、当票离店”。
- README 五维统一为“痴、嗔、贪、惘、慧”，修正旧口径“气、尘、贪、妄、悔”。
- README 与 `.env.example` 将 DeepSeek 默认模型更新为 `deepseek-v4-pro`。
- README 主访问地址更新为 `https://www.luochapawnshop.top`。
- 页面 meta 与展示图文案统一为“痴嗔贪惘慧”。
- 新增 `docs/upgrades/`，归档引导文案 v1.0 至 v1.3 与 v1.5.1 抽签机制文档。

## 已推送基线

- `95a9446 Add v1.2 guidance flow`：已落地 v1.2 引导流程。
- `59380d7 Fix fate ritual title and stabilize fate card`：已修正“摇签问命”标题，并稳定命格卡不再被后到异步结果覆写。
- `a9b3089 Prepare Wispbyte self-host deployment`：已准备 Wispbyte 自托管包。
- `62d4a5c Initial open-source release`：项目开源初版。
