import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { FateStoryInput, FateStoryRecord } from "../../src/data/types.js";
import { generateFallbackStory, STORY_PROMPT_VERSION } from "../../src/game/fateStory.js";
import { callTextProvider } from "../_llmProvider.js";
import { buildFateStoryPrompt, PROMPT_VERSION } from "../_prompts.js";
import { getStoryStorage } from "../_storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { input, fateDetail } = req.body as { input?: FateStoryInput; fateDetail?: string };
  if (!isValidInput(input)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  const baseRecord = {
    ...input,
    storyId: crypto.randomUUID(),
    fateDetail,
    generatedAt: Date.now(),
    promptVersion: PROMPT_VERSION || STORY_PROMPT_VERSION
  };

  let story: FateStoryRecord;
  let fallback = false;
  try {
    const result = await callTextProvider(
      buildFateStoryPrompt(input),
      "你是罗刹当铺的记账先生。必须只输出合法 JSON，不输出解释、Markdown 或代码块。",
      {
        maxTokens: 900,
        model: "deepseek-v4-pro",
        responseFormat: "json_object",
        temperature: 0.68,
        timeoutMs: 30000
      }
    );
    story = {
      ...baseRecord,
      storyText: cleanStoryText(result.text, input),
      llmModel: result.model
    };
  } catch (error) {
    console.error("story_llm_failed", error);
    fallback = true;
    story = {
      ...baseRecord,
      storyText: generateFallbackStory(input),
      llmModel: "fallback"
    };
  }

  try {
    await getStoryStorage().save(story);
    if (!hasDurableStoryStorage()) fallback = true;
  } catch {
    fallback = true;
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ story, fallback });
}

function hasDurableStoryStorage(): boolean {
  return Boolean((process.env.KV_REST_API_URL ?? process.env.KV_URL) && process.env.KV_REST_API_TOKEN);
}

function isValidInput(input: FateStoryInput | undefined): input is FateStoryInput {
  return Boolean(input?.fateName && input.fateJudgment && input.initialResources && input.finalResources);
}

function cleanStoryText(text: string, input: FateStoryInput): string {
  const cleaned = text
    .replace(/^```[\s\S]*?\n/, "")
    .replace(/```$/g, "")
    .trim();
  if (!cleaned || cleaned.length < 120) return generateFallbackStory(input);
  const storyJson = parseStoryJson(cleaned);
  const storyText = storyJson ? [storyJson.body, storyJson.closing].filter(Boolean).join("\n\n") : cleaned;
  if (storyText.length <= 760) return storyText;
  const clipped = storyText.slice(0, 760);
  const sentenceEnd = Math.max(clipped.lastIndexOf("。"), clipped.lastIndexOf("！"), clipped.lastIndexOf("？"));
  return sentenceEnd > 300 ? clipped.slice(0, sentenceEnd + 1) : clipped;
}

function parseStoryJson(text: string): { body?: string; closing?: string } | null {
  try {
    const parsed = JSON.parse(text) as { body?: unknown; closing?: unknown };
    return {
      body: typeof parsed.body === "string" ? parsed.body.trim() : undefined,
      closing: typeof parsed.closing === "string" ? parsed.closing.trim() : undefined
    };
  } catch {
    return null;
  }
}
