import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { PhraseType } from "../../../src/data/types.js";
import { fallbackPhrases } from "../../../src/data/goldenPhrases.js";
import { getPhraseStorage } from "../../_storage.js";

const allowedTypes: PhraseType[] = [
  "recognize_pain",
  "less_self_deception",
  "elevate",
  "abrupt",
  "gentle_guard"
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const type = typeof req.query.type === "string" ? (req.query.type as PhraseType) : undefined;
  if (!type || !allowedTypes.includes(type)) {
    res.status(400).json({ error: "bad_type" });
    return;
  }

  try {
    const storage = getPhraseStorage();
    const phrase = await storage.getRandom(type);
    if (phrase) {
      await storage.incrementUsedCount(phrase.id);
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ phrase });
      return;
    }
  } catch {
    // The game must keep moving even if the phrase backend is cold or unconfigured.
  }

  const text = pickFallback(type);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    phrase: {
      id: `fallback-${type}`,
      type,
      text,
      status: "approved",
      createdAt: 0,
      llmModel: "fallback",
      promptVersion: "v1.5.0",
      usedCount: 0
    }
  });
}

function pickFallback(type: PhraseType): string {
  const bank = fallbackPhrases[type];
  return bank[Math.floor(Math.random() * bank.length)] ?? "来日再来。";
}
