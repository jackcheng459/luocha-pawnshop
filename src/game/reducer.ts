import { items } from "../data/items";
import { insufficientDialogs, lotDialogs, tierDialogBucket, buyDialogByTier } from "../data/templates";
import type {
  EntryIntent,
  FateResult,
  GameState,
  LotResult,
  PawnInput,
  PawnLlmResult,
  PlayerState,
  ReceiptLlmResult,
  FateStoryRecord,
  ResourceMap,
  TradeRecord
} from "../data/types";
import { fallbackReceiptStory, fallbackReceiptVerbs, fallbackFarewell } from "./receipt";
import {
  applyPrice,
  applySideEffects,
  canAfford,
  clampMoney,
  computePawn,
  createId,
  pickOne,
  scaledPrice
} from "./rules";
import { getSeasonContext } from "./season";
import {
  createBuyBeat,
  createChangedFateBeat,
  createEntryBeat,
  createFateBeat,
  createLotBeat,
  createPawnBeat,
  limitStoryBeats
} from "./story";

export type GameAction =
  | {
      type: "START_WITH_FATE";
      entryIntent: EntryIntent;
      resources: ResourceMap;
      fate: FateResult;
      llmLoading: boolean;
    }
  | { type: "SET_FATE_RESULT"; fate: FateResult }
  | { type: "SET_FATE_FALLBACK" }
  | {
      type: "CHANGE_FATE";
      resources: ResourceMap;
      fate: FateResult;
    }
  | { type: "GO_PAWN" }
  | { type: "SET_SAFETY_MESSAGE"; message?: string }
  | {
      type: "COMPLETE_PAWN";
      input: PawnInput;
      llmResult: PawnLlmResult;
      llmUsed: boolean;
    }
  | { type: "BUY_ITEM"; itemId: number }
  | { type: "GO_RECEIPT" }
  | { type: "DRAW_LOT"; result: LotResult }
  | { type: "LOT_SHANG_KEEP" }
  | { type: "LOT_SHANG_UNDO_NO_REDO" }
  | { type: "LOT_SHANG_UNDO_REDO" }
  | { type: "LOT_ZHONG_CHOOSE"; choice: "pawn" | "buy" }
  | { type: "SET_RECEIPT_LLM_LOADING" }
  | { type: "SET_RECEIPT_RESULT"; result: ReceiptLlmResult; llmUsed: boolean }
  | { type: "SET_STORY_LOADING" }
  | {
      type: "SET_STORY_RESULT";
      story: FateStoryRecord;
      storyUrl: string;
      storyQrUrl: string;
      usedFallback: boolean;
    }
  | { type: "SET_FAREWELL_PHRASE"; farewell: string }
  | { type: "LEAVE" }
  | { type: "RESET" };

export const initialState: GameState = {
  phase: "entry",
  lastDialog: undefined,
  safetyMessage: undefined,
  llm: {
    fate: "idle",
    pawn: "idle",
    receipt: "idle"
  }
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_WITH_FATE": {
      const season = getSeasonContext();
      const player: PlayerState = {
        entryIntent: action.entryIntent,
        resources: action.resources,
        originalResources: action.resources,
        seasonTerm: season.term,
        seasonHint: season.hint,
        nightLabel: season.nightLabel,
        fateName: action.fate.name,
        fateText: action.fate.text,
        fateDetail: action.fate.detail,
        fateStory: action.fate.story,
        fateHook: action.fate.hook,
        fateSource: action.fate.source,
        changedFate: false,
        trades: [],
        storyBeats: [
          createEntryBeat(createId("beat"), action.entryIntent),
          createFateBeat(createId("beat"), action.fate)
        ],
        hasPawned: false,
        freeTradeCount: 0,
        maxFreeTrades: 3,
        buyCount: 0,
        pawnCount: 0,
        drewLot: false,
        priceMultiplier: 1,
        storyStatus: "idle"
      };

      return {
        ...state,
        phase: "fateCard",
        player,
        lastDialog: "九两九钱，整整。客官身上不少不多，与众生同。",
        safetyMessage: undefined,
        llm: {
          ...state.llm,
          fate: action.llmLoading ? "loading" : action.fate.source === "llm" ? "done" : "fallback"
        }
      };
    }

    case "SET_FATE_RESULT": {
      if (!state.player) return state;
      // 命牌一旦落案，不再用后到的异步命格覆写，避免用户看到卡面闪换。
      return {
        ...state,
        llm: { ...state.llm, fate: action.fate.source === "llm" ? "done" : "fallback" }
      };
    }

    case "SET_FATE_FALLBACK":
      return { ...state, llm: { ...state.llm, fate: "fallback" } };

    case "CHANGE_FATE": {
      if (!state.player || state.player.changedFate || state.player.resources.hui < 10) {
        return {
          ...state,
          lastDialog: "慧根不够，命先别动。"
        };
      }
      const resources = {
        ...action.resources,
        hui: clampMoney(action.resources.hui - 10)
      };
      return {
        ...state,
        player: {
          ...state.player,
          resources,
          originalResources: resources,
          fateName: action.fate.name,
          fateText: action.fate.text,
          fateDetail: action.fate.detail,
          fateStory: action.fate.story,
          fateHook: action.fate.hook,
          fateSource: "fallback",
          changedFate: true,
          storyBeats: limitStoryBeats([
            ...state.player.storyBeats,
            createChangedFateBeat(createId("beat"), action.fate)
          ])
        },
        lastDialog: "此命已改，代价已付。",
        llm: { ...state.llm, fate: "fallback" }
      };
    }

    case "GO_PAWN":
      return {
        ...state,
        phase: "pawnRequired",
        lastDialog: "客官今夜的命数，与昨夜不同。也无须与昨夜相比。",
        safetyMessage: undefined
      };

    case "SET_SAFETY_MESSAGE":
      return { ...state, safetyMessage: action.message };

    case "COMPLETE_PAWN": {
      if (!state.player) return state;
      const isLotExtra = Boolean(state.player.lotMode);
      const pawnRate = state.player.lotMode === "zhongExtra" ? 0.4 : 0.7;
      const computed = computePawn(action.input, state.player.resources, pawnRate);
      const storyNote =
        pawnRate === 0.4
          ? `${action.input.itemName.trim() || "一物"}入柜，中签加倍损耗，${formatMoneyForReceipt(computed.amountFrom)}${resourceLabel(action.input.resourceFrom)}换作${formatMoneyForReceipt(computed.amountTo)}${resourceLabel(computed.resourceTo)}。`
          : action.llmResult.ledgerLine;
      const trade: TradeRecord = {
        id: createId("pawn"),
        type: "pawn",
        resourceFrom: action.input.resourceFrom,
        resourceTo: computed.resourceTo,
        amountFrom: computed.amountFrom,
        amountTo: computed.amountTo,
        rawName: action.input.itemName,
        renamedItem: action.llmResult.renamedItem,
        dialog: action.llmResult.dialog,
        storyNote,
        verbForReceipt: "典出",
        resourcesBefore: state.player.resources,
        resourcesAfter: computed.resources,
        pawnCountBefore: state.player.pawnCount,
        buyCountBefore: state.player.buyCount,
        freeTradeCountBefore: state.player.freeTradeCount,
        lotExtra: isLotExtra
      };
      const isEntryPawn = !state.player.hasPawned;
      const freeTradeCount = state.player.freeTradeCount + (isEntryPawn ? 0 : 1);
      const pawnCount = state.player.pawnCount + 1;
      const lotEntry = state.player.lotMode
        ? completeLotEntry(state.player, trade)
        : state.player.lotEntry;
      const nextPlayer: PlayerState = {
        ...state.player,
        resources: computed.resources,
        trades: [...state.player.trades, trade],
        storyBeats: limitStoryBeats([
          ...state.player.storyBeats,
          createPawnBeat(
            createId("beat"),
            action.input,
            action.llmResult,
            computed.resourceTo,
            computed.amountTo
          )
        ]),
        hasPawned: true,
        pawnCount,
        freeTradeCount,
        lotEntry,
        lotMode: isLotExtra ? undefined : state.player.lotMode,
        lotExtraChoice: isLotExtra ? undefined : state.player.lotExtraChoice,
        priceMultiplier: isLotExtra ? 1 : state.player.priceMultiplier
      };
      const shouldGoLot = !isLotExtra && !nextPlayer.drewLot && (pawnCount >= 3 || nextPlayer.buyCount >= 3);
      const finalPlayer = isLotExtra ? prepareReceiptPlayer(nextPlayer) : nextPlayer;
      return {
        ...state,
        phase: isLotExtra ? "receipt" : shouldGoLot ? "lotOffer" : "shop",
        player: finalPlayer,
        lastDialog: action.llmResult.dialog,
        safetyMessage: undefined,
        llm: {
          ...state.llm,
          pawn: action.llmUsed ? "done" : "fallback",
          receipt: isLotExtra ? "idle" : state.llm.receipt
        }
      };
    }

    case "BUY_ITEM": {
      if (!state.player) return state;
      const item = items.find((entry) => entry.id === action.itemId);
      if (!item) return state;
      if (!canAfford(state.player.resources, item.price, state.player.priceMultiplier)) {
        return {
          ...state,
          lastDialog: insufficientDialogs[0]
        };
      }

      const itemPrice = scaledPrice(item, state.player.priceMultiplier);
      const afterPrice = applyPrice(state.player.resources, item.price, state.player.priceMultiplier);
      const resources = applySideEffects(afterPrice, item.sideEffects);
      const bucket = tierDialogBucket(item.tier);
      const isLotExtra = Boolean(state.player.lotMode);
      const trade: TradeRecord = {
        id: createId("buy"),
        type: "buy",
        itemId: item.id,
        itemName: item.name,
        itemPrice,
        sideEffects: item.sideEffects,
        dialog: item.hiddenFlavor,
        storyNote: item.hiddenFlavor,
        verbForReceipt: "换",
        amountFrom: Object.values(itemPrice).reduce((sum, value) => sum + (value ?? 0), 0),
        resourcesBefore: state.player.resources,
        resourcesAfter: resources,
        pawnCountBefore: state.player.pawnCount,
        buyCountBefore: state.player.buyCount,
        freeTradeCountBefore: state.player.freeTradeCount,
        lotExtra: isLotExtra
      };
      const freeTradeCount = state.player.freeTradeCount + 1;
      const buyCount = state.player.buyCount + 1;
      const endingLine = item.legendaryEnding ?? state.player.endingLine;
      const lotEntry = state.player.lotMode
        ? completeLotEntry(state.player, trade)
        : state.player.lotEntry;
      const nextPlayer: PlayerState = {
        ...state.player,
        resources,
        trades: [...state.player.trades, trade],
        storyBeats: limitStoryBeats([
          ...state.player.storyBeats,
          createBuyBeat(createId("beat"), item)
        ]),
        buyCount,
        freeTradeCount,
        endingLine,
        lotEntry,
        lotMode: isLotExtra ? undefined : state.player.lotMode,
        lotExtraChoice: isLotExtra ? undefined : state.player.lotExtraChoice,
        priceMultiplier: isLotExtra ? 1 : state.player.priceMultiplier
      };
      const shouldGoLot = !isLotExtra && !nextPlayer.drewLot && (nextPlayer.pawnCount >= 3 || buyCount >= 3);

      const finalPlayer = isLotExtra ? prepareReceiptPlayer(nextPlayer) : nextPlayer;
      return {
        ...state,
        player: finalPlayer,
        phase: isLotExtra ? "receipt" : shouldGoLot ? "lotOffer" : "shop",
        lastDialog: pickOne(buyDialogByTier[bucket]),
        llm: {
          ...state.llm,
          receipt: isLotExtra ? "idle" : state.llm.receipt
        }
      };
    }

    case "DRAW_LOT": {
      if (!state.player || state.player.drewLot) return state;
      const lotBeat = createLotBeat(createId("beat"), action.result);
      if (action.result === "xia") {
        const deduction = Math.min(state.player.resources.hui, 5);
        const resources = {
          ...state.player.resources,
          hui: clampMoney(state.player.resources.hui - deduction)
        };
        return {
          ...state,
          phase: "lotResult",
          player: {
            ...state.player,
            resources,
            storyBeats: limitStoryBeats([
              ...state.player.storyBeats,
              lotBeat
            ]),
            drewLot: true,
            lotResult: action.result,
            lotHuiDeducted: deduction,
            lotEntry: {
              type: "xia",
              description:
                deduction > 0
                  ? `今夜运气不济，扣慧${formatMoneyForReceipt(deduction)}`
                  : "今夜运气不济，但慧已尽，未能再扣",
              huiDeducted: deduction
            }
          },
          lastDialog:
            deduction > 0
              ? "下签。扣慧五钱。"
              : "下签。慧已尽，未能再扣。"
        };
      }

      return {
        ...state,
        phase: "lotResult",
        player: {
          ...state.player,
          drewLot: true,
          lotResult: action.result,
          storyBeats: limitStoryBeats([
            ...state.player.storyBeats,
            lotBeat
          ])
        },
        lastDialog: lotDialogs[action.result]
      };
    }

    case "LOT_SHANG_KEEP":
      if (!state.player || state.player.lotResult !== "shang") return state;
      return {
        ...state,
        phase: "receipt",
        player: prepareReceiptPlayer({
          ...state.player,
          lotEntry: {
            type: "shang",
            description: "未反悔"
          }
        }),
        llm: { ...state.llm, receipt: "idle" }
      };

    case "LOT_SHANG_UNDO_NO_REDO": {
      if (!state.player || state.player.lotResult !== "shang") return state;
      const undone = undoLastTrade(state.player);
      return {
        ...state,
        phase: "receipt",
        player: prepareReceiptPlayer({
          ...undone,
          lotEntry: {
            type: "shang",
            description: "反悔最后一笔，未再做"
          }
        }),
        llm: { ...state.llm, receipt: "idle" }
      };
    }

    case "LOT_SHANG_UNDO_REDO": {
      if (!state.player || state.player.lotResult !== "shang") return state;
      const undone = undoLastTrade(state.player);
      return {
        ...state,
        phase: "shop",
        player: {
          ...undone,
          lotMode: "shangRedo",
          lotExtraChoice: "any",
          lotEntry: {
            type: "shang",
            description: "反悔最后一笔，待重做"
          },
          priceMultiplier: 1
        },
        lastDialog: "已反悔。客官可重做一笔。"
      };
    }

    case "LOT_ZHONG_CHOOSE":
      if (!state.player || state.player.lotResult !== "zhong") return state;
      return {
        ...state,
        phase: action.choice === "pawn" ? "pawnRequired" : "shop",
        player: {
          ...state.player,
          lotMode: "zhongExtra",
          lotExtraChoice: action.choice,
          priceMultiplier: 2,
          lotEntry: {
            type: "zhong",
            description: "再做一笔（加倍）"
          }
        },
        lastDialog: "中签。再做一笔，加倍。"
      };

    case "GO_RECEIPT": {
      if (!state.player) return state;
      return {
        ...state,
        phase: "receipt",
        player: prepareReceiptPlayer(ensureLotEntryForReceipt(state.player)),
        llm: { ...state.llm, receipt: "idle" }
      };
    }

    case "SET_RECEIPT_LLM_LOADING":
      return { ...state, llm: { ...state.llm, receipt: "loading" } };

    case "SET_RECEIPT_RESULT": {
      if (!state.player) return state;
      const verbs = action.result.verbsForTrades;
      return {
        ...state,
        player: {
          ...state.player,
          farewell: action.result.farewell,
          receiptStoryTitle: action.result.storyTitle,
          receiptStory: action.result.story,
          trades: state.player.trades.map((trade, index) => ({
            ...trade,
            verbForReceipt: verbs[index] ?? trade.verbForReceipt
          }))
        },
        llm: { ...state.llm, receipt: action.llmUsed ? "done" : "fallback" }
      };
    }

    case "SET_STORY_LOADING":
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          storyStatus: "loading"
        }
      };

    case "SET_STORY_RESULT":
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          storyStatus: action.usedFallback ? "fallback" : "done",
          storyId: action.story.storyId,
          storyUrl: action.storyUrl,
          storyQrUrl: action.storyQrUrl,
          nightStory: action.story.storyText,
          storyTimestamp: action.story.timestamp
        }
      };

    case "SET_FAREWELL_PHRASE":
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          farewell: action.farewell
        }
      };

    case "LEAVE":
      return { ...state, phase: "leaving" };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

function undoLastTrade(player: PlayerState): PlayerState {
  const lastTrade = player.trades[player.trades.length - 1];
  if (!lastTrade) return player;
  const storyBeats = [...player.storyBeats];
  const tradeBeatIndex =
    storyBeats[storyBeats.length - 1]?.tone === "lot"
      ? storyBeats.length - 2
      : storyBeats.length - 1;
  if (tradeBeatIndex >= 0) storyBeats.splice(tradeBeatIndex, 1);

  return {
    ...player,
    resources: lastTrade.resourcesBefore ?? player.resources,
    trades: player.trades.slice(0, -1),
    storyBeats,
    pawnCount: lastTrade.pawnCountBefore ?? player.pawnCount,
    buyCount: lastTrade.buyCountBefore ?? player.buyCount,
    freeTradeCount: lastTrade.freeTradeCountBefore ?? player.freeTradeCount,
    hasPawned:
      (lastTrade.pawnCountBefore ?? player.pawnCount) > 0 ||
      player.trades.slice(0, -1).some((trade) => trade.type === "pawn")
  };
}

function prepareReceiptPlayer(player: PlayerState): PlayerState {
  const fallbackVerbs = fallbackReceiptVerbs(player.trades);
  const fallbackStory = fallbackReceiptStory(player);
  return {
    ...player,
    farewell: player.farewell ?? fallbackFarewell(player),
    receiptStoryTitle: player.receiptStoryTitle ?? fallbackStory.title,
    receiptStory: player.receiptStory ?? fallbackStory.text,
    trades: player.trades.map((trade, index) => ({
      ...trade,
      verbForReceipt: fallbackVerbs[index] ?? trade.verbForReceipt
    }))
  };
}

function ensureLotEntryForReceipt(player: PlayerState): PlayerState {
  if (player.lotEntry || !player.lotResult) return player;
  if (player.lotResult === "zhong") {
    return {
      ...player,
      lotEntry: {
        type: "zhong",
        description: "已无可典，亦无可买"
      }
    };
  }
  if (player.lotResult === "shang") {
    return {
      ...player,
      lotEntry: {
        type: "shang",
        description: "未反悔"
      }
    };
  }
  return player;
}

function completeLotEntry(player: PlayerState, trade: TradeRecord) {
  const description = describeTradeForLot(trade);
  if (player.lotMode === "shangRedo") {
    return {
      type: "shang" as const,
      description: `反悔最后一笔，重做：${description}`,
      redoneAction: trade
    };
  }
  if (player.lotMode === "zhongExtra") {
    return {
      type: "zhong" as const,
      description: `再做一笔（加倍）：${description}`,
      redoneAction: trade
    };
  }
  return player.lotEntry;
}

function describeTradeForLot(trade: TradeRecord): string {
  if (trade.type === "pawn" && trade.resourceFrom && trade.resourceTo) {
    return `以${formatMoneyForReceipt(trade.amountFrom ?? 0)}${resourceLabel(trade.resourceFrom)}换${formatMoneyForReceipt(trade.amountTo ?? 0)}${resourceLabel(trade.resourceTo)}`;
  }
  if (trade.type === "buy" && trade.itemName && trade.itemPrice) {
    return `以${formatPriceForReceipt(trade.itemPrice)}取走“${trade.itemName}”`;
  }
  return "以一念，换一夜";
}

function formatPriceForReceipt(price: Partial<ResourceMap>): string {
  return Object.entries(price)
    .filter(([, amount]) => Boolean(amount))
    .map(([key, amount]) => `${formatMoneyForReceipt(amount ?? 0)}${resourceLabel(key as keyof ResourceMap)}`)
    .join("、");
}

function formatMoneyForReceipt(value: number): string {
  const liang = Math.floor(value / 10);
  const qian = value % 10;
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

function resourceLabel(key: keyof ResourceMap): string {
  return {
    chi: "痴",
    chen: "嗔",
    tan: "贪",
    wang: "惘",
    hui: "慧"
  }[key];
}
