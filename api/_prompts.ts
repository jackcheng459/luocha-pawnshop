import type { FateStoryInput, PhraseType } from "../src/data/types.js";

export const PROMPT_VERSION = "v2.0.0-story-prompt-v6.0";

export function buildFateStoryPrompt(input: FateStoryInput): string {
  return `# 罗刹当铺 · 命主故事生成 Prompt（v6.0 极简版）

## 你是谁

你是罗刹当铺的记账先生。受老掌柜之托，将今夜进店者的一局命数交易写成笔记一则。

你不是小说家。你是一位用毛笔在油灯下写笔记的老先生。

## 写什么

输入数据：
${JSON.stringify(toStoryPromptInput(input), null, 2)}

## 怎么写

核心理念：客鲜活，掌柜冷。

- 客是子不语笔法。鲜活的人。有情绪、有反应、有动作、有台词。可以笑、可以叹、可以揖、可以掩口、可以眼角有湿意。至少有 2-3 处鲜活反应，至少有 1 句主动开口的话。
- 掌柜是阅微笔法。世界规则的化身。无情绪、无评判、无好奇。台词只能是估价、观察、规则三类。
- 反差是这种笔法的核心：客活，掌柜冷。
- 命格是客的内在重力，不是标签。命格精神要渗透在客的身体动作里，但不能字面引用判词，不能让客自己说出命格名。

情绪曲线要和交易路径匹配：
- 卖业买慧：离店舒展，可大笑、长舒、卸下重负。
- 卖慧买业：离店决绝，可冷笑、长叹、目不回。
- 抽上签摇首未要：离店和解，可笑而摇首、回身一揖。
- 几乎不交易：离店玩味，可微笑、若有所悟。
- 抽到下签：离店错愕，可苦笑、骇然。
- 命格契合：被点中，可恍然、忽按胸、眼角湿意。

结尾要从这一夜独有的逻辑里长出来，不能用通用句式。禁止使用“客出门，雾未散”“门外有风”这类任何故事都能用的收尾。

## 不许做

1. 不混淆 pawned 和 bought：pawned 物只能写“客取置案”；bought 物只能写“客指货架，掌柜自柜底取”。
2. 不写心理活动：“他心想”“他回忆起”“他忽然意识到”一律不用。
3. 不写白话病句：“也”字必须在判断句末封口；不用“了”作完成态助词；用“自”“于”，少用“在”“从”“向”。
4. 不堆志怪鬼气：全篇“非常之笔”最多 1 处。不写“后数日……”回访段落。
5. 不用通用收尾。结尾必须从这一夜独有的细节长出来。

输出要求：
严格 JSON，无任何额外文字：
{
  "title": "命格名，直接复制 fateName",
  "judgment": "判词，直接复制 fateJudgment",
  "body": "正文 200-280 字",
  "closing": "夜账末页，掌柜落一笔朱砂：\\"{title}\\"。"
}

示例：
{
  "title": "慧刃斩尘",
  "judgment": "你以慧为刀，却斩不断陈年蛛网",
  "body": "丙午年某月某夜，酉时三刻。客推门入，衣无雨，眉有霜色。右袖微鼓，似藏一物。\\n\\n客自袖中取一物置案上，纹裂如瓷，乃枯核也。客曰：\\"养七年，今晨乃吐。\\"语毕，按袖。掌柜拨视良久，曰：\\"十钱痴，出七钱慧。\\"客颔首，如点他人头。\\n\\n客指货架，曰：\\"钟。\\"掌柜自柜底取一旧铃，摇之三下。钟声不远，如自胸中出。客闻之，眉间霜化一寸，忽以手按胸。\\n\\n签筒摇出上签。掌柜曰：\\"今夜难得，反悔不加价。\\"客视签，忽笑曰：\\"不必。该断的，今夜断不了。\\"\\n\\n客推门出。右袖犹鼓，刃未出鞘。客行数步，回身向铺中一揖，转身入雾。",
  "closing": "夜账末页，掌柜落一笔朱砂：\\"慧刃斩尘\\"。"
}

严禁复用范例的物件名和台词。必须基于本次输入原创。

输出前最后一问：这篇故事和另一个命格、另一个客、另一个夜晚能换吗？能换则重写，不能换再输出。

Prompt 版本：v6.0 极简版。`;
}

function toStoryPromptInput(input: FateStoryInput) {
  return {
    fateName: input.fateName,
    fateJudgment: input.fateJudgment,
    pawned: input.trades
      .filter((trade) => trade.type === "pawn")
      .map((trade) => ({
        itemName: trade.itemName,
        resourceFrom: trade.resourceFrom,
        amountFrom: trade.amountFrom,
        resourceTo: trade.resourceTo,
        amountTo: trade.amountTo
      })),
    bought: input.trades
      .filter((trade) => trade.type === "buy")
      .map((trade) => ({
        itemName: trade.itemName,
        cost: trade.itemPrice
      })),
    lot: input.drewLot
      ? {
          result: input.lotResult,
          effect: input.lotEffect,
          accepted: Boolean(input.extraLotAccepted),
          redoneTradeType: input.lotRedoneTradeType
        }
      : null,
    timestamp: parseClassicalTimestamp(input.timestamp)
  };
}

function parseClassicalTimestamp(timestamp: string) {
  const ganzhiYear = timestamp.match(/^(.+?)年/)?.[1] ?? "丙午";
  const shichen = timestamp.match(/([子丑寅卯辰巳午未申酉戌亥]时)/)?.[1] ?? "酉时";
  const quarter = timestamp.match(/([一二三四]刻)/)?.[1] ?? "";
  return { ganzhiYear, shichen, quarter };
}

export function buildLegacyStoryPromptInput(input: FateStoryInput) {
  return {
    timestamp: input.timestamp,
    seasonTerm: input.seasonTerm,
    nightLabel: input.nightLabel,
    fateName: input.fateName,
    fateJudgment: input.fateJudgment,
    weather: input.weather ?? "衣无雨，眉有霜色",
    resourceChange: { initial: input.initialResources, final: input.finalResources },
    pawnRecords: input.trades
      .filter((trade) => trade.type === "pawn")
      .map((trade) => ({
        resourceFrom: trade.resourceFrom ? resourceLabel(trade.resourceFrom) : undefined,
        amountFrom: trade.amountFrom,
        resourceTo: trade.resourceTo ? resourceLabel(trade.resourceTo) : undefined,
        amountTo: trade.amountTo,
        itemName: trade.itemName,
        itemDescription: trade.itemStory
      })),
    buyRecords: input.trades
      .filter((trade) => trade.type === "buy")
      .map((trade) => ({
        itemName: trade.itemName,
        cost: formatCost(trade.itemPrice),
        effect: trade.itemStory
      })),
    extraLotResult: input.lotResult ? lotLabel(input.lotResult) : null,
    extraLotAccepted: Boolean(input.extraLotAccepted),
    extraLotEffect: input.lotEffect,
    extraLotRedoneTradeType: input.lotRedoneTradeType
  };
}

function resourceLabel(key: "chi" | "chen" | "tan" | "wang" | "hui") {
  return {
    chi: "痴",
    chen: "嗔",
    tan: "贪",
    wang: "惘",
    hui: "慧"
  }[key];
}

function lotLabel(result: "shang" | "zhong" | "xia") {
  return {
    shang: "上签",
    zhong: "中签",
    xia: "下签"
  }[result];
}

function formatCost(price: FateStoryInput["trades"][number]["itemPrice"]) {
  if (!price) return undefined;
  return Object.fromEntries(
    Object.entries(price).map(([key, value]) => [resourceLabel(key as "chi" | "chen" | "tan" | "wang" | "hui"), value])
  );
}

export function buildPhrasePrompt(type: PhraseType, count: number): string {
  return `你是罗刹当铺的老掌柜，需要为玩家写一句临别赠言。

这句话不是评分，不是打气，不是说教。
是一位看过太多事的老者，对一位走过一夜的进店者，说一句“我看到你了”。

文风约束：
1. 不要“加油”“你最棒”“你做得对”等鸡汤。
2. 不要“愿你幸福”“祝君平安”等套话。
3. 不要“成长”“勇气”“力量”等励志词。
4. 字数 8-20 字，控制在两个短句以内。
5. 阅微草堂笔记 + 子不语调子，半文白。
6. 承认残缺，不修复残缺。
7. 半句没说，留余韵。

调子样本：
认出疼过型：客官走得稳，因为疼过。此物压心多年，今夜终于落柜。
少骗自己型：今夜没白来，你少骗自己一次。客官话不多，今夜想必想透了一些。
抬举玩家型：此处已留你不住，人间还未必配得上你。客官走得轻，配得上一夜好梦。
戛然而止型：灯下莫回头。夜路上慢些。来日再来。
温柔守护型：明日的你，不必谢今夜的你。天亮前回得来便好。

任务：请为“${type}”调子生成 ${count} 句新的临别赠言。

要求：
每句独立成一行。
不要编号，不要解释，不要标点之外的额外字符。
与样本风格一致但不重复样本。`;
}
