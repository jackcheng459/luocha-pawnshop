import type { FateStoryRecord, PlayerState } from "../data/types";
import { buildFateStoryInput, buildLocalStoryRecord } from "../game/fateStory";
import LZString from "lz-string";

const LOCAL_STORY_PREFIX = "luocha:story:";

export async function createFateStory(player: PlayerState): Promise<{
  record: FateStoryRecord;
  usedFallback: boolean;
  storyUrl: string;
  storyQrUrl: string;
}> {
  const fallback = buildLocalStoryRecord(player);
  try {
    const response = await fetch("/api/story/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: buildFateStoryInput(player),
        fateDetail: player.fateDetail
      })
    });
    if (!response.ok) throw new Error("story_create_failed");
    const data = (await response.json()) as {
      story?: FateStoryRecord;
      fallback?: boolean;
    };
    if (!data.story?.storyId || !data.story.storyText) throw new Error("story_payload_invalid");
    persistLocalStory(data.story);
    const storyUrl = buildStoryUrl(data.story, Boolean(data.fallback));
    return {
      record: data.story,
      usedFallback: Boolean(data.fallback),
      storyUrl,
      storyQrUrl: await buildStoryQrUrl(data.story, Boolean(data.fallback), storyUrl)
    };
  } catch {
    persistLocalStory(fallback);
    const storyUrl = buildStoryUrl(fallback, true);
    return {
      record: fallback,
      usedFallback: true,
      storyUrl,
      storyQrUrl: await buildStoryQrUrl(fallback, true, storyUrl)
    };
  }
}

export async function fetchFateStory(storyId: string, search = ""): Promise<FateStoryRecord | null> {
  try {
    const response = await fetch(`/api/story/${encodeURIComponent(storyId)}`);
    if (response.ok) {
      const data = (await response.json()) as { story?: FateStoryRecord };
      if (data.story) {
        persistLocalStory(data.story);
        return data.story;
      }
    }
  } catch {
    // Local Vite dev does not serve Vercel functions; local cache keeps demo usable.
  }
  return readLocalStory(storyId) ?? readStoryFromUrl(search, storyId);
}

export function buildStoryUrl(story: FateStoryRecord, includePayload: boolean, compactPayload = false): string {
  const baseUrl = `/story/${story.storyId}`;
  if (!includePayload) return baseUrl;
  return `${baseUrl}?c=${encodeStory(story, compactPayload)}`;
}

async function buildStoryQrUrl(story: FateStoryRecord, includePayload: boolean, storyUrl: string): Promise<string> {
  if (!includePayload) return buildStoryUrl(story, false);
  try {
    return await shortenStoryUrl(toAbsoluteStoryUrl(storyUrl));
  } catch {
    return buildStoryUrl(story, true, true);
  }
}

async function shortenStoryUrl(url: string): Promise<string> {
  const response = await fetch("/api/story/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  if (!response.ok) throw new Error("shorten_failed");
  const data = (await response.json()) as { shortUrl?: string };
  if (!data.shortUrl) throw new Error("shorten_payload_invalid");
  return data.shortUrl;
}

function toAbsoluteStoryUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const configuredSite = import.meta.env.VITE_SITE_URL as string | undefined;
  const siteUrl = configuredSite?.replace(/\/$/, "") || window.location.origin;
  return `${siteUrl}${url}`;
}

function persistLocalStory(story: FateStoryRecord) {
  try {
    window.localStorage.setItem(`${LOCAL_STORY_PREFIX}${story.storyId}`, JSON.stringify(story));
  } catch {
    // Export and QR rendering should not depend on localStorage availability.
  }
}

function readLocalStory(storyId: string): FateStoryRecord | null {
  try {
    const raw = window.localStorage.getItem(`${LOCAL_STORY_PREFIX}${storyId}`);
    if (!raw) return null;
    return JSON.parse(raw) as FateStoryRecord;
  } catch {
    return null;
  }
}

function readStoryFromUrl(search: string, storyId: string): FateStoryRecord | null {
  try {
    const params = new URLSearchParams(search);
    const encoded = params.get("c") ?? params.get("s");
    if (!encoded) return null;
    const story = decodeStory(encoded);
    if (story.storyId !== storyId) return null;
    persistLocalStory(story);
    return story;
  } catch {
    return null;
  }
}

function encodeStory(story: FateStoryRecord, compactPayload: boolean): string {
  const storyText = compactPayload ? compactStoryText(story.storyText) : story.storyText;
  return LZString.compressToEncodedURIComponent(
    JSON.stringify({
      v: 1,
      id: story.storyId,
      n: story.fateName,
      j: story.fateJudgment,
      d: story.fateDetail,
      ts: story.timestamp,
      st: story.seasonTerm,
      nl: story.nightLabel,
      txt: storyText,
      at: story.generatedAt,
      m: story.llmModel,
      p: story.promptVersion
    })
  );
}

function decodeStory(encoded: string): FateStoryRecord {
  const compressed = LZString.decompressFromEncodedURIComponent(encoded);
  if (compressed) return hydrateStory(JSON.parse(compressed));

  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return hydrateStory(JSON.parse(decodeURIComponent(escape(atob(padded)))));
}

function hydrateStory(payload: Partial<FateStoryRecord> & Record<string, unknown>): FateStoryRecord {
  if (payload.storyId && payload.storyText) return payload as FateStoryRecord;
  return {
    storyId: String(payload.id ?? ""),
    fateName: String(payload.n ?? "无名命牌"),
    fateJudgment: String(payload.j ?? ""),
    fateDetail: typeof payload.d === "string" ? payload.d : undefined,
    timestamp: String(payload.ts ?? ""),
    seasonTerm: typeof payload.st === "string" ? payload.st : undefined,
    nightLabel: typeof payload.nl === "string" ? payload.nl : undefined,
    storyText: String(payload.txt ?? ""),
    generatedAt: typeof payload.at === "number" ? payload.at : Date.now(),
    llmModel: String(payload.m ?? "qr-payload"),
    promptVersion: String(payload.p ?? "qr-v1"),
    initialResources: { chi: 0, chen: 0, tan: 0, wang: 0, hui: 0 },
    finalResources: { chi: 0, chen: 0, tan: 0, wang: 0, hui: 0 },
    trades: [],
    drewLot: false
  };
}

function compactStoryText(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 240) return cleaned;
  const sentences = cleaned.match(/[^。！？!?]+[。！？!?]?/g) ?? [cleaned];
  const selected: string[] = [];
  for (const sentence of sentences) {
    const next = `${selected.join("")}${sentence}`;
    if (next.length > 240) break;
    selected.push(sentence);
  }
  const compacted = selected.join("").trim() || cleaned.slice(0, 240);
  return compacted.endsWith("。") ? compacted : `${compacted.replace(/[，、；：,.!?！？;:]$/, "")}。`;
}
