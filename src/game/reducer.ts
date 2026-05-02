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
  | { type: "SET_RECEIPT_LLM_LOADING" }
  | { type: "SET_RECEIPT_RESULT"; result: ReceiptLlmResult; llmUsed: boolean }
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
      const player: PlayerState = {
        entryIntent: action.entryIntent,
        resources: action.resources,
        originalResources: action.resources,
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
        maxFreeTrades: 2,
        buyCount: 0,
        pawnCount: 0,
        drewLot: false,
        priceMultiplier: 1
      };

      return {
        ...state,
        phase: "fateCard",
        player,
        lastDialog: "命牌已落。别急着认，也别急着不认。",
        safetyMessage: undefined,
        llm: {
          ...state.llm,
          fate: action.llmLoading ? "loading" : action.fate.source === "llm" ? "done" : "fallback"
        }
      };
    }

    case "SET_FATE_RESULT": {
      if (!state.player) return state;
      if (state.player.changedFate) return state;
      return {
        ...state,
        player: {
          ...state.player,
          fateName: action.fate.name,
          fateText: action.fate.text,
          fateDetail: action.fate.detail,
          fateStory: action.fate.story,
          fateHook: action.fate.hook,
          fateSource: action.fate.source,
          storyBeats: [
            ...state.player.storyBeats.filter(
              (beat) => beat.tone !== "fate" || !beat.title.startsWith("命牌：")
            ),
            createFateBeat(createId("beat"), action.fate)
          ]
        },
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
      return { ...state, phase: "pawnRequired", safetyMessage: undefined };

    case "SET_SAFETY_MESSAGE":
      return { ...state, safetyMessage: action.message };

    case "COMPLETE_PAWN": {
      if (!state.player) return state;
      const computed = computePawn(action.input, state.player.resources);
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
        storyNote: action.llmResult.ledgerLine,
        verbForReceipt: "典出"
      };
      const isEntryPawn = !state.player.hasPawned;
      const freeTradeCount = isEntryPawn
        ? state.player.freeTradeCount
        : state.player.freeTradeCount + 1;
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
        pawnCount: state.player.pawnCount + 1,
        freeTradeCount
      };
      return {
        ...state,
        phase:
          nextPlayer.hasPawned && freeTradeCount >= nextPlayer.maxFreeTrades
            ? "lotOffer"
            : "shop",
        player: nextPlayer,
        lastDialog: action.llmResult.dialog,
        safetyMessage: undefined,
        llm: { ...state.llm, pawn: action.llmUsed ? "done" : "fallback" }
      };
    }

    case "BUY_ITEM": {
      if (!state.player) return state;
      const item = items.find((entry) => entry.id === action.itemId);
      if (!item) return state;
      if (!canAfford(state.player.resources, item.price, state.player.priceMultiplier)) {
        return {
          ...state,
          lastDialog: pickOne(insufficientDialogs)
        };
      }

      const itemPrice = scaledPrice(item, state.player.priceMultiplier);
      const afterPrice = applyPrice(state.player.resources, item.price, state.player.priceMultiplier);
      const resources = applySideEffects(afterPrice, item.sideEffects);
      const bucket = tierDialogBucket(item.tier);
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
        amountFrom: Object.values(itemPrice).reduce((sum, value) => sum + (value ?? 0), 0)
      };
      const freeTradeCount = state.player.freeTradeCount + 1;
      const endingLine = item.legendaryEnding ?? state.player.endingLine;
      const nextPlayer: PlayerState = {
        ...state.player,
        resources,
        trades: [...state.player.trades, trade],
        storyBeats: limitStoryBeats([
          ...state.player.storyBeats,
          createBuyBeat(createId("beat"), item)
        ]),
        buyCount: state.player.buyCount + 1,
        freeTradeCount,
        endingLine
      };

      return {
        ...state,
        player: nextPlayer,
        phase: freeTradeCount >= nextPlayer.maxFreeTrades ? "lotOffer" : "shop",
        lastDialog: pickOne(buyDialogByTier[bucket])
      };
    }

    case "DRAW_LOT": {
      if (!state.player || state.player.drewLot) return state;
      if (action.result === "xia") {
        const resources = {
          ...state.player.resources,
          hui: clampMoney(state.player.resources.hui - 5)
        };
        const trade: TradeRecord = {
          id: createId("lot"),
          type: "lotPenalty",
          amountFrom: 5,
          resourceFrom: "hui",
          storyNote: "多问一签，折去半两慧。",
          verbForReceipt: "折"
        };
        return {
          ...state,
          phase: "receipt",
          player: {
            ...state.player,
            resources,
            trades: [...state.player.trades, trade],
            storyBeats: limitStoryBeats([
              ...state.player.storyBeats,
              createLotBeat(createId("beat"), action.result)
            ]),
            drewLot: true,
            lotResult: action.result,
            farewell: fallbackFarewell(state.player),
            receiptStoryTitle: "下签入账",
            receiptStory: "多问一签，便折半两清醒。今夜没有惩罚，只有你亲手添上的后账。"
          },
          lastDialog: lotDialogs[action.result],
          llm: { ...state.llm, receipt: "idle" }
        };
      }

      return {
        ...state,
        phase: "shop",
        player: {
          ...state.player,
          drewLot: true,
          lotResult: action.result,
          storyBeats: limitStoryBeats([
            ...state.player.storyBeats,
            createLotBeat(createId("beat"), action.result)
          ]),
          maxFreeTrades: 3,
          priceMultiplier: action.result === "zhong" ? 2 : 1
        },
        lastDialog: lotDialogs[action.result]
      };
    }

    case "GO_RECEIPT": {
      if (!state.player) return state;
      const fallbackVerbs = fallbackReceiptVerbs(state.player.trades);
      const fallbackStory = fallbackReceiptStory(state.player);
      return {
        ...state,
        phase: "receipt",
        player: {
          ...state.player,
          farewell: state.player.farewell ?? fallbackFarewell(state.player),
          receiptStoryTitle: state.player.receiptStoryTitle ?? fallbackStory.title,
          receiptStory: state.player.receiptStory ?? fallbackStory.text,
          trades: state.player.trades.map((trade, index) => ({
            ...trade,
            verbForReceipt: fallbackVerbs[index] ?? trade.verbForReceipt
          }))
        },
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

    case "LEAVE":
      return { ...state, phase: "leaving" };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
