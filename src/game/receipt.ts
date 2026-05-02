import { items } from "../data/items";
import {
  farewellByPath,
  receiptVerbs,
  warmFarewells
} from "../data/templates";
import type { PlayerState, ResourceKey, TradeRecord } from "../data/types";
import { resourceName, formatMoney, pickOne } from "./rules";

export function fallbackFarewell(player: PlayerState): string {
  const legendaryTrade = player.trades.find(
    (trade) => trade.itemId && items.find((item) => item.id === trade.itemId)?.isLegendary
  );
  const legendary = legendaryTrade?.itemId
    ? items.find((item) => item.id === legendaryTrade.itemId)
    : undefined;
  if (legendary?.legendaryFarewell) return legendary.legendaryFarewell;
  if (Math.random() < 0.2) return pickOne(warmFarewells);

  const pawnTrades = player.trades.filter((trade) => trade.type === "pawn");
  const soldHui = pawnTrades.filter((trade) => trade.resourceFrom === "hui").length;
  const soldKarma = pawnTrades.filter(
    (trade) => trade.resourceFrom && trade.resourceFrom !== "hui"
  ).length;
  const boughtClear = player.trades.some((trade) => {
    const item = items.find((entry) => entry.id === trade.itemId);
    return item?.sideEffects.hui && item.sideEffects.hui > 0;
  });
  const huiLow = player.resources.hui <= 8;

  if (boughtClear && soldKarma >= 1) return pickOne(farewellByPath.clear);
  if (huiLow) return pickOne(farewellByPath.heavy);
  if (soldHui >= 2) return pickOne(farewellByPath.huiMain);
  if (soldKarma >= 2) return pickOne(farewellByPath.pawnMain);
  return pickOne(farewellByPath.balanced);
}

export function fallbackReceiptStory(player: PlayerState): { title: string; text: string } {
  const pawnTrades = player.trades.filter((trade) => trade.type === "pawn");
  const buyTrades = player.trades.filter((trade) => trade.type === "buy");
  const lastBeat = player.storyBeats[player.storyBeats.length - 1];
  const firstBeat = player.storyBeats[0];
  const firstPawn = pawnTrades[0];
  const entryLine =
    player.entryIntent === "relief"
      ? "你说有烦恼欲解，掌柜便先把命牌推到灯下。"
      : "你说只是逛逛，灯花却先认出你没说出口的心事。";
  const fateLine = player.fateHook || player.fateText;
  const prizedItem = buyTrades
    .map((trade) => items.find((item) => item.id === trade.itemId))
    .filter(Boolean)
    .sort((a, b) => (b?.tier ?? 0) - (a?.tier ?? 0))[0];

  if (player.lotResult === "xia") {
    return {
      title: "下签入账",
      text: trimStory(`${entryLine}${fateLine}后来你又多问一支签，半两慧便落在柜上。掌柜没罚你，只把迟疑也写进账里。`)
    };
  }

  if (prizedItem?.isLegendary) {
    return {
      title: "旧夜回身",
      text: trimStory(`${entryLine}${fateLine}你用九两九钱买回一夜旧时光。门外天色将白，掌柜只问一句：看清以后，还回不回来？`)
    };
  }

  if (firstBeat && lastBeat && firstBeat.id !== lastBeat.id) {
    return {
      title: "夜账成篇",
      text: trimStory(`${entryLine}${firstBeat.title}先落在纸上，后来又添了${lastBeat.title}。掌柜合上账本，说你今夜不是来买东西，是来看看哪一笔还在替你说话。`)
    };
  }

  if (pawnTrades.length >= 2 && buyTrades.length >= 1) {
    return {
      title: "两当一取",
      text: trimStory(`${entryLine}你先后典出${pawnTrades.length}件心上物，又取走${prizedItem?.name ?? "一件货"}。账面轻了，故事却更像你，只是不知哪一笔最该带出门。`)
    };
  }

  if (firstPawn && prizedItem) {
    return {
      title: "一当一取",
      text: trimStory(`${entryLine}你以${formatMoney(firstPawn.amountFrom ?? 0)}${resourceName(firstPawn.resourceFrom ?? "chi")}入柜，换来${prizedItem.name}。这不是买卖，是你终于给旧事标了价。`)
    };
  }

  if (prizedItem) {
    return {
      title: "空手取物",
      text: trimStory(`${entryLine}${fateLine}你取走${prizedItem.name}，却没带走掌柜的眼神。有些东西买下那刻，才知道原来早就缺着。`)
    };
  }

  return {
    title: "夜账未满",
    text: trimStory(`${entryLine}${fateLine}你在柜前站了一会儿，账本只添几笔。没买下的东西，常常比买下的更会跟人。`)
  };
}

export function fallbackReceiptVerbs(trades: TradeRecord[]): string[] {
  return trades.map((trade) => {
    if (trade.type === "buy") return pickOne(receiptVerbs.buy);
    if (trade.type === "lotPenalty") return pickOne(receiptVerbs.loss);
    return pickOne(receiptVerbs.pawn);
  });
}

export function formatTradeLine(trade: TradeRecord): string {
  if (trade.type === "buy" && trade.itemName && trade.itemPrice) {
    return `以${formatPriceShort(trade.itemPrice)}，${trade.verbForReceipt}${trade.itemName}`;
  }

  if (trade.type === "pawn" && trade.resourceFrom && trade.amountFrom) {
    const object = trade.renamedItem ?? trade.rawName ?? resourceName(trade.resourceFrom);
    return `以${formatMoney(trade.amountFrom)}${resourceName(trade.resourceFrom)}，${trade.verbForReceipt}${object}`;
  }

  if (trade.type === "lotPenalty") {
    return "折半两慧，换一支下签";
  }

  return "以一念，换一夜";
}

function formatPriceShort(price: Partial<Record<ResourceKey, number>>): string {
  return Object.entries(price)
    .filter(([, amount]) => Boolean(amount))
    .map(([key, amount]) => `${formatMoney(amount ?? 0)}${resourceName(key as ResourceKey)}`)
    .join("、");
}

function trimStory(text: string): string {
  return text.length > 118 ? `${text.slice(0, 116)}…` : text;
}
