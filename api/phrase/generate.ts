import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Phrase, PhraseType } from "../../src/data/types.js";
import { fallbackPhrases } from "../../src/data/goldenPhrases.js";
import { requireAdmin } from "../_admin.js";
import { callTextProvider } from "../_llmProvider.js";
import { buildPhrasePrompt, PROMPT_VERSION } from "../_prompts.js";
import { getPhraseStorage } from "../_storage.js";

const allowedTypes: PhraseType[] = [
  "recognize_pain",
  "less_self_deception",
  "elevate",
  "abrupt",
  "gentle_guard"
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const { type, count } = req.body as { type?: PhraseType; count?: number };
  if (!type || !allowedTypes.includes(type)) {
    res.status(400).json({ error: "bad_type" });
    return;
  }

  const batchCount = Math.max(1, Math.min(10, Number(count) || 5));
  let lines: string[];
  let llmModel = "fallback";
  let fallback = false;
  try {
    const result = await callTextProvider(
      buildPhrasePrompt(type, batchCount),
      "你是罗刹当铺老掌柜。只输出临别赠言，一句一行。",
      { maxTokens: 320, temperature: 0.78, timeoutMs: 8000 }
    );
    llmModel = result.model;
    lines = parsePhraseLines(result.text).slice(0, batchCount);
    if (lines.length === 0) throw new Error("empty_lines");
  } catch {
    fallback = true;
    lines = fallbackPhrases[type].slice(0, batchCount);
  }

  const phrases: Phrase[] = lines.map((text) => ({
    id: crypto.randomUUID(),
    type,
    text,
    status: "pending_review",
    createdAt: Date.now(),
    llmModel,
    promptVersion: PROMPT_VERSION,
    usedCount: 0
  }));

  const storage = getPhraseStorage();
  await Promise.all(phrases.map((phrase) => storage.save(phrase)));
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ phrases, fallback });
}

function parsePhraseLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*0-9.、]+\s*/, "").trim())
    .filter(Boolean)
    .map((line) => line.slice(0, 28));
}
