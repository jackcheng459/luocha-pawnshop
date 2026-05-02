import type {
  PawnInput,
  PawnLlmResult,
  PlayerState,
  ReceiptLlmResult,
  ResourceKey,
  ResourceMap
} from "../data/types";
import { fallbackFate } from "../game/fate";
import { fallbackFarewell, fallbackReceiptStory, fallbackReceiptVerbs } from "../game/receipt";
import { formatMoney, getPawnTarget, pickOne, resourceName } from "../game/rules";

const fallbackPawnObjects: Record<ResourceKey, string[]> = {
  chi: ["回头灯", "旧梦匣", "等人烛"],
  chen: ["旧账页", "未凉火", "咬牙骨"],
  tan: ["空心碗", "未满囊", "追光影"],
  wang: ["雾里舟", "迷路灯", "无岸图"],
  hui: ["明镜灰", "清醒盏", "照心尘"]
};

const fallbackPawnSuffix: Record<ResourceKey, string> = {
  chi: "灯",
  chen: "账",
  tan: "碗",
  wang: "雾",
  hui: "镜"
};

const fallbackPawnReveals: Record<ResourceKey, string[]> = {
  chi: ["你当的是旧灯，不是旧人。", "旧事不值钱，旧心才值。"],
  chen: ["你当的是旧账，不是公道。", "这口气入柜，出门就别回头。"],
  tan: ["你当的是空碗，不是前程。", "想要太多，也会折成小钱。"],
  wang: ["你当的是雾，不是路。", "看不清的东西，最会要价。"],
  hui: ["你当的是明白，不是轻松。", "清醒最贵，贵在不能反悔。"]
};

export function fallbackFateResult(resources: ResourceMap) {
  return fallbackFate(resources);
}

export function fallbackPawnResult(input: PawnInput): PawnLlmResult {
  const resourceTo = getPawnTarget(input);
  const amountTo = Math.floor(input.amountFrom * 0.7);
  const valuation = `${formatMoney(input.amountFrom)}${resourceName(input.resourceFrom)}入柜，${formatMoney(amountTo)}${resourceName(resourceTo)}出门。`;
  return {
    renamedItem: fallbackPawnName(input),
    dialog: `${valuation}${pickOne(fallbackPawnReveals[input.resourceFrom])}`,
    ledgerLine: `${input.itemName.trim() || resourceName(input.resourceFrom)}入柜，灯花短了一寸。${formatMoney(input.amountFrom)}${resourceName(input.resourceFrom)}换作${formatMoney(amountTo)}${resourceName(resourceTo)}。`
  };
}

export function fallbackReceiptResult(player: PlayerState): ReceiptLlmResult {
  const story = fallbackReceiptStory(player);
  return {
    farewell: fallbackFarewell(player),
    storyTitle: story.title,
    story: story.text,
    verbsForTrades: fallbackReceiptVerbs(player.trades)
  };
}

function fallbackPawnName(input: PawnInput): string {
  const rawName = input.itemName
    .trim()
    .replace(/[，。！？、,.!?\s]/g, "")
    .slice(0, 7);
  if (!rawName) return pickOne(fallbackPawnObjects[input.resourceFrom]);
  return `${rawName}${fallbackPawnSuffix[input.resourceFrom]}`.slice(0, 10);
}
