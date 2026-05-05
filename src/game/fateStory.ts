import type { FateStoryInput, FateStoryRecord, PlayerState, TradeRecord } from "../data/types.js";
import { getClassicalTimestamp } from "./timestamp.js";

export const STORY_PROMPT_VERSION = "v2.0.0-story-prompt-v6.0";

export function buildFateStoryInput(player: PlayerState): FateStoryInput {
  return {
    fateName: player.fateName,
    fateJudgment: player.fateText,
    weather: player.seasonHint || "衣无雨，眉有霜色",
    initialResources: player.originalResources,
    finalResources: player.resources,
    trades: player.trades.map(summarizeTrade),
    drewLot: player.drewLot,
    lotResult: player.lotResult,
    extraLotAccepted: inferExtraLotAccepted(player),
    timestamp: player.storyTimestamp ?? getClassicalTimestamp(),
    seasonTerm: player.seasonTerm,
    nightLabel: player.nightLabel
  };
}

export function generateFallbackStory(input: FateStoryInput): string {
  const pawnLines = input.trades
    .filter((trade) => trade.type === "pawn")
    .map((trade) => {
      const item = trade.itemName ?? "旧物";
      const story = trade.itemStory ? `客曰：“${trimSentence(trade.itemStory)}。”` : "客不言其来历。";
      const from = trade.resourceFrom ? resourceLabel(trade.resourceFrom) : "命数";
      const to = trade.resourceTo ? resourceLabel(trade.resourceTo) : "命数";
      return `取一物置柜上。${item}也。${story}
掌柜曰：“当${formatMoneyText(trade.amountFrom ?? 0)}${from}，出${formatMoneyText(trade.amountTo ?? 0)}${to}。”
客颔首。`;
    });
  const buyLines = input.trades
    .filter((trade) => trade.type === "buy")
    .map((trade, index) => {
      const prefix = index === 0 ? "先取" : "又取";
      return `${prefix}${trade.itemName ?? "柜上一物"}。掌柜自柜底递出。
${trimSentence(trade.itemStory ?? "客收之，未语。")}`;
    });
  const lotLine = input.lotResult
    ? `签筒忽又自摇，出一签，${lotLabel(input.lotResult)}。
${input.lotResult === "xia" ? "掌柜曰：“此签为定，赔半两慧。”" : "掌柜曰：“今夜难得，反悔不加价。”"}
${input.extraLotAccepted ? "客颔首。" : "客摇首，未要。"}`
    : "";
  const close = input.lotResult ? "掌柜拾起两支签，置回筒中。" : "掌柜拾起签，置回筒中。";

  return `${input.timestamp}。

案上签筒无风自动。落一签，朱文曰：${input.fateName}。

少顷，客推门入。${input.weather || "衣无雨，眉有霜色"}。

${pawnLines.join("\n\n")}

${input.fateName.includes("慧") ? buildHuiBladeLine(input) : ""}

当毕，客指货架。
${buyLines.join("\n\n") || "货架无声，客看了许久。"}

${lotLine}

${close}
客出门，雾未散。`.replace(/\n{3,}/g, "\n\n").trim();
}

export function buildLocalStoryRecord(player: PlayerState): FateStoryRecord {
  const input = buildFateStoryInput(player);
  return {
    ...input,
    storyId: crypto.randomUUID(),
    fateDetail: player.fateDetail,
    storyText: generateFallbackStory(input),
    generatedAt: Date.now(),
    llmModel: "fallback",
    promptVersion: STORY_PROMPT_VERSION
  };
}

function summarizeTrade(trade: TradeRecord): FateStoryInput["trades"][number] {
  return {
    type: trade.type,
    resourceFrom: trade.resourceFrom,
    resourceTo: trade.resourceTo,
    amountFrom: trade.amountFrom,
    amountTo: trade.amountTo,
    itemName: trade.renamedItem ?? trade.itemName ?? trade.rawName,
    itemStory: trade.storyNote,
    itemPrice: trade.itemPrice,
    sideEffects: trade.sideEffects
  };
}

function inferExtraLotAccepted(player: PlayerState): boolean {
  if (!player.lotResult || player.lotResult === "xia") return false;
  return player.trades.length > 3;
}

function buildHuiBladeLine(input: FateStoryInput): string {
  const delta = input.finalResources.hui - input.initialResources.hui;
  if (delta === 0) return "";
  const verb = delta > 0 ? "增" : "短";
  return `顷刻，客腰间慧刃，${verb}${formatLength(Math.abs(delta))}。`;
}

function formatLength(money: number): string {
  const fen = Math.max(1, Math.round(money / 10));
  const cun = Math.floor(fen / 10);
  const rest = fen % 10;
  if (cun && rest) return `${numberText(cun)}寸${numberText(rest)}分`;
  if (cun) return `${numberText(cun)}寸`;
  return `${numberText(rest)}分`;
}

function formatMoneyText(money: number): string {
  const liang = Math.floor(money / 10);
  const qian = money % 10;
  if (liang && qian) return `${numberText(liang)}两${numberText(qian)}钱`;
  if (liang) return `${numberText(liang)}两`;
  return `${numberText(qian)}钱`;
}

function numberText(value: number): string {
  const numerals = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (value <= 10) return numerals[value] ?? String(value);
  if (value < 20) return `十${numerals[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${numerals[tens]}十${ones ? numerals[ones] : ""}`;
}

function resourceLabel(key: NonNullable<FateStoryInput["trades"][number]["resourceFrom"]>): string {
  return {
    chi: "痴",
    chen: "嗔",
    tan: "贪",
    wang: "惘",
    hui: "慧"
  }[key];
}

function lotLabel(result: NonNullable<FateStoryInput["lotResult"]>): string {
  return {
    shang: "上签",
    zhong: "中签",
    xia: "下签"
  }[result];
}

function trimSentence(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 34);
}
