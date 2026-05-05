import type {
  EntryIntent,
  FateResult,
  Item,
  LotResult,
  PawnInput,
  PawnLlmResult,
  ResourceKey,
  StoryBeat
} from "../data/types";
import { formatMoney, pickOne, resourceName } from "./rules";

export function limitStoryBeats(beats: StoryBeat[]): StoryBeat[] {
  return beats.slice(-6);
}

export function createEntryBeat(id: string, intent: EntryIntent): StoryBeat {
  return {
    id,
    tone: "entry",
    title: intent === "relief" ? "来意：欲解烦恼" : "来意：雾中闲逛",
    text:
      intent === "relief"
        ? "掌柜问客从何处来，你说有一桩烦恼，想在柜上称一称轻重。"
        : "掌柜问客从何处来，你只说随意逛逛。灯花一跳，账本已经翻开。"
  };
}

export function createFateBeat(id: string, fate: FateResult): StoryBeat {
  return {
    id,
    tone: "fate",
    title: `命牌：${fate.name}`,
    text: `签筒停住，掌柜先称一声：九两九钱，整整。纸上再落一句：${fate.hook || fate.text}`
  };
}

export function createChangedFateBeat(id: string, fate: FateResult): StoryBeat {
  return {
    id,
    tone: "fate",
    title: `改命：${fate.name}`,
    text: `一两慧入火，旧字退潮。新命牌只留一句：${fate.hook || fate.text}`
  };
}

export function createPawnBeat(
  id: string,
  input: PawnInput,
  result: PawnLlmResult,
  resourceTo: ResourceKey,
  amountTo: number
): StoryBeat {
  return {
    id,
    tone: "pawn",
    title: `典当：${result.renamedItem}`,
    text:
      result.ledgerLine ||
      `${formatMoney(input.amountFrom)}${resourceName(input.resourceFrom)}入柜，换得${formatMoney(amountTo)}${resourceName(resourceTo)}。掌柜没问来处，只把灯拨暗了些。`
  };
}

export function createBuyBeat(id: string, item: Item): StoryBeat {
  return {
    id,
    tone: "item",
    title: `取物：${item.name}`,
    text: pickOne([
      `${item.hiddenFlavor} 柜台木牌另写：${item.lore}`,
      `你收下${item.name}，掌柜没有笑，只把价签翻到背面：${item.hiddenFlavor}`,
      `${item.name}离柜时，灯影低了一寸。${item.lore}`
    ])
  };
}

export function createLotBeat(id: string, result: LotResult): StoryBeat {
  const beats: Record<LotResult, StoryBeat> = {
    shang: {
      id,
      tone: "lot",
      title: "续签：上签",
      text: "签头一翻，朱砂未干。掌柜说，今夜难得有一次反悔不加价。"
    },
    zhong: {
      id,
      tone: "lot",
      title: "续签：中签",
      text: "签落中平，货架轻轻一响。想要的还在，只是每件东西都学会了抬价。"
    },
    xia: {
      id,
      tone: "lot",
      title: "续签：下签",
      text: "下签磕在桌上，半两慧随声入账。不是倒霉，是你又多问了一句为什么。"
    }
  };
  return beats[result];
}
