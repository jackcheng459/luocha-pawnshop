import type { FateStoryRecord } from "../data/types";

export type YezhangRecord = {
  storyId: string;
  fateName: string;
  judgmentSnippet: string;
  timestamp: string;
  visitedAt: number;
};

export type YezhangData = {
  records: YezhangRecord[];
  version: "1.0";
};

const YEZHANG_KEY = "luocha:yezhang";
const MAX_RECORDS = 20;

export function isYezhangAvailable(): boolean {
  try {
    const test = "__luocha_yezhang_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function loadYezhang(): YezhangData {
  if (!isYezhangAvailable()) return emptyYezhang();
  try {
    const raw = window.localStorage.getItem(YEZHANG_KEY);
    if (!raw) return emptyYezhang();
    const parsed = JSON.parse(raw) as Partial<YezhangData>;
    if (!Array.isArray(parsed.records)) return emptyYezhang();
    return {
      version: "1.0",
      records: parsed.records
        .filter(isValidRecord)
        .sort((a, b) => b.visitedAt - a.visitedAt)
        .slice(0, MAX_RECORDS)
    };
  } catch {
    return emptyYezhang();
  }
}

export function saveStoryToYezhang(story: FateStoryRecord): void {
  if (!isYezhangAvailable()) return;
  const data = loadYezhang();
  const record: YezhangRecord = {
    storyId: story.storyId,
    fateName: story.fateName,
    judgmentSnippet: trimSnippet(story.fateJudgment || story.fateDetail || "这一夜，账上有风。"),
    timestamp: story.timestamp || story.nightLabel || "某年某月某夜",
    visitedAt: Date.now()
  };
  const records = [
    record,
    ...data.records.filter((entry) => entry.storyId !== story.storyId)
  ].slice(0, MAX_RECORDS);
  window.localStorage.setItem(YEZHANG_KEY, JSON.stringify({ version: "1.0", records }));
}

export function clearYezhang(): void {
  if (!isYezhangAvailable()) return;
  window.localStorage.removeItem(YEZHANG_KEY);
}

function emptyYezhang(): YezhangData {
  return { version: "1.0", records: [] };
}

function isValidRecord(record: unknown): record is YezhangRecord {
  const candidate = record as Partial<YezhangRecord>;
  return Boolean(
    candidate &&
      typeof candidate.storyId === "string" &&
      typeof candidate.fateName === "string" &&
      typeof candidate.judgmentSnippet === "string" &&
      typeof candidate.timestamp === "string" &&
      typeof candidate.visitedAt === "number"
  );
}

function trimSnippet(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 34 ? `${cleaned.slice(0, 33)}…` : cleaned;
}
