import { crisisMessage, crisisWordList, denyMessage, denyWordList } from "../data/safety";

export type SafetyResult =
  | { ok: true; text: string }
  | { ok: false; kind: "crisis" | "deny"; message: string };

export function checkSafety(...parts: string[]): SafetyResult {
  const text = parts.join(" ").trim();
  if (containsAny(text, crisisWordList)) {
    return { ok: false, kind: "crisis", message: crisisMessage };
  }
  if (containsAny(text, denyWordList)) {
    return { ok: false, kind: "deny", message: denyMessage };
  }
  return { ok: true, text };
}

export function isSafeText(...parts: string[]): boolean {
  const text = parts.join(" ");
  return !containsAny(text, crisisWordList) && !containsAny(text, denyWordList);
}

export function sanitizeShareText(text: string, fallback: string): string {
  return isSafeText(text) ? text : fallback;
}

function containsAny(text: string, words: string[]): boolean {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word.toLowerCase()));
}
