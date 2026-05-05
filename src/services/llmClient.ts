import type {
  EntryIntent,
  FateResult,
  PawnInput,
  PawnLlmResult,
  PlayerState,
  ReceiptLlmResult,
  ResourceMap
} from "../data/types";
import { fallbackPhrase, inferPhraseType } from "../data/goldenPhrases";
import { isSafeText } from "../game/compliance";
import {
  fallbackFateResult,
  fallbackPawnResult,
  fallbackReceiptResult
} from "./fallback";

type LlmTask = "fate" | "pawn" | "receipt";

export async function requestFate(
  resources: ResourceMap,
  entryIntent: EntryIntent
): Promise<FateResult> {
  const fallback = fallbackFateResult(resources);
  const fallbackPayload = {
    fateName: fallback.name,
    fateText: fallback.text,
    fateDetail: fallback.detail,
    fateStory: fallback.story,
    shareHook: fallback.hook
  };
  const result = await callWithFallback<{
    fateName: string;
    fateText: string;
    fateDetail?: string;
    fateStory?: string;
    shareHook?: string;
  }>(
    "fate",
    {
      resources,
      entryIntent,
      entryIntentText: entryIntent === "relief" ? "有烦恼事欲解脱" : "来此逛逛"
    },
    fallbackPayload
  );

  if (
    !("fateName" in result) ||
    !isSafeText(
      result.fateName,
      result.fateText,
      result.fateDetail ?? "",
      result.fateStory ?? "",
      result.shareHook ?? ""
    )
  ) {
    return fallback;
  }

  return {
    name: cleanLine(result.fateName, fallback.name, 8),
    text: cleanLine(result.fateText, fallback.text, 30),
    detail: cleanLine(result.fateDetail, fallback.detail, 76),
    story: cleanLine(result.fateStory, fallback.story, 128),
    hook: cleanLine(result.shareHook, fallback.hook, 32),
    source: "llm"
  };
}

export async function requestPawn(input: PawnInput): Promise<PawnLlmResult> {
  const fallback = fallbackPawnResult(input);
  const result = await callWithFallback<PawnLlmResult>("pawn", input, fallback);
  if (!isSafeText(result.renamedItem, result.dialog, result.ledgerLine)) return fallback;
  return {
    renamedItem: cleanLine(result.renamedItem, fallback.renamedItem, 10),
    dialog: cleanLine(result.dialog, fallback.dialog, 34),
    ledgerLine: cleanLine(result.ledgerLine, fallback.ledgerLine, 48)
  };
}

export async function requestReceipt(player: PlayerState): Promise<ReceiptLlmResult> {
  const fallback = fallbackReceiptResult(player);
  const result = await callWithFallback<ReceiptLlmResult>(
    "receipt",
    { player: summarizePlayer(player) },
    fallback
  );

  const verbs = Array.isArray(result.verbsForTrades) ? result.verbsForTrades : fallback.verbsForTrades;
  if (!isSafeText(result.farewell, result.storyTitle, result.story, ...verbs)) return fallback;
  const phrase = await requestFarewellPhrase(player);
  return {
    farewell: cleanLine(phrase ?? result.farewell, fallback.farewell, 34),
    storyTitle: cleanLine(result.storyTitle, fallback.storyTitle, 12),
    story: cleanLine(result.story, fallback.story, 116),
    verbsForTrades: player.trades.map(
      (_trade, index) => cleanLine(verbs[index], fallback.verbsForTrades[index] ?? "换", 4)
    )
  };
}

export async function requestFarewellPhrase(player: PlayerState): Promise<string> {
  const type = inferPhraseType(player);
  try {
    const response = await fetch(`/api/phrase/random/${type}`);
    if (!response.ok) return fallbackPhrase(type);
    const data = (await response.json()) as { phrase?: { text?: string } };
    const text = data.phrase?.text;
    if (!text || !isSafeText(text)) return fallbackPhrase(type);
    return cleanLine(text, fallbackPhrase(type), 34);
  } catch {
    return fallbackPhrase(type);
  }
}

async function callWithFallback<T>(task: LlmTask, payload: unknown, fallback: T): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, payload }),
      signal: controller.signal
    });
    if (!response.ok) return fallback;
    const data = (await response.json()) as { result?: T };
    return data.result ?? fallback;
  } catch {
    return fallback;
  } finally {
    window.clearTimeout(timeout);
  }
}

function cleanLine(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== "string") return fallback;
  const line = value.replace(/\s+/g, " ").trim();
  if (!line) return fallback;
  return line.slice(0, maxLength);
}

function summarizePlayer(player: PlayerState) {
  return {
    resources: player.resources,
    originalResources: player.originalResources,
    entryIntent: player.entryIntent,
    fateName: player.fateName,
    fateText: player.fateText,
    fateDetail: player.fateDetail,
    fateStory: player.fateStory,
    fateHook: player.fateHook,
    changedFate: player.changedFate,
    lotResult: player.lotResult,
    trades: player.trades.map((trade) => ({
      type: trade.type,
      resourceFrom: trade.resourceFrom,
      resourceTo: trade.resourceTo,
      amountFrom: trade.amountFrom,
      amountTo: trade.amountTo,
      itemName: trade.itemName,
      renamedItem: trade.renamedItem,
      storyNote: trade.storyNote
    })),
    storyBeats: player.storyBeats.map((beat) => ({
      tone: beat.tone,
      title: beat.title,
      text: beat.text
    }))
  };
}
