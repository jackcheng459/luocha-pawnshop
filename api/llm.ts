import type { VercelRequest, VercelResponse } from "@vercel/node";

type Task = "fate" | "pawn" | "receipt";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(getProviderStatus());
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { task, payload } = req.body as { task?: Task; payload?: unknown };
  if (!task || !payload) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  try {
    const prompt = buildPrompt(task, payload);
    const result = await callProvider(prompt);
    res.status(200).json({ result });
  } catch (error) {
    res.status(200).json({
      result: undefined,
      fallback: true,
      error: error instanceof Error ? error.message : "llm_failed"
    });
  }
}

function buildPrompt(task: Task, payload: unknown): string {
  if (task === "fate") {
    return `你是《罗刹当铺》的命格判词生成器。
背景：罗刹海市中有五项命数：痴、嗔、贪、惘、慧。单位为钱，1 两 = 10 钱。
输入：
${JSON.stringify(payload)}
任务：生成 json：{"fateName":"三到五字古风命格名","fateText":"12-28 字半文白判词","fateDetail":"42-70 字签背小字","fateStory":"70-110 字命签小传","shareHook":"12-22 字朋友圈短句"}
规则：
1. 只输出 JSON，不要解释。
2. 命格名必须古风，不要现代人格标签，不要 MBTI、人格、测试等字样。
3. fateText 必须是一句话，像签语，也像用户愿意截图发朋友圈的一句自白。
4. fateDetail 是签背小字，要解释这张命牌为什么像用户，但不能像心理咨询报告。
5. fateStory 要像“这个命签独属于我”的小传：有一个具体内心场景，一处隐痛，一个未说尽的钩子。
6. shareHook 要短，像朋友圈配图文案，第一人称优先。
7. 如果 entryIntentText 是“有烦恼事欲解脱”，语气更像掌柜看见了客官的来意；如果是“来此逛逛”，语气更像灯火无意照见心事。
8. 直击人心但留钩子，不解释太满，不写大道理。
9. 少用“命运、人生、成长、治愈”等泛词。
10. 示例风格：你不是放不下，是不甘心白疼一场。
11. 不引用真实人物、地名、品牌、歌词。
12. 不出现 AI、游戏、系统、模型等出戏词。
13. 不要使用任何涉政、涉黄、暴力、自伤内容。`;
  }

  if (task === "pawn") {
    return `你是罗刹当铺掌柜，无名，年龄不可考，自称“老朽”。
口吻：聊斋式半文不白，淡淡戏谑。不教育，不煽情，不劝导。
输入：
${JSON.stringify(payload)}
任务：将玩家典当物改成一个志怪风物名，给一句估价台词，并写一条夜账札记。
输出 json：{"renamedItem":"不超过 10 字","dialog":"不超过 30 字","ledgerLine":"不超过 46 字的夜账札记"}
规则：
1. 只输出 JSON。
2. renamedItem 要有物感，像能摆上当铺柜台的东西，不要抽象概念词。
3. dialog 要短狠，像掌柜一眼看穿人，最好一句话有反转。
4. ledgerLine 要像账簿边角的小记，记录这个选择留下的痕迹，不要复述成说明文。
5. 如涉及价钱，数值必须沿用输入，不得自行改价。
6. dialog 中可出现“老朽”“客官”，但不要每句都用。
7. 不保留具体真人、公司、学校、地名。
8. 不做心理疏导，不判断玩家对错。
9. 不输出敏感、暴力、自伤、色情、政治内容。`;
  }

  return `你是罗刹当铺掌柜，正在给客官写离店当票。
风格：半文白，克制，小而准，不煽情。
输入：
${JSON.stringify(payload)}
任务：生成 json：{"storyTitle":"四到六字当票小题","story":"70-110 字当票故事","farewell":"不超过 30 字的临别赠言","verbsForTrades":["每笔交易一个动词"]}
规则：
1. 只输出 JSON。
2. verbsForTrades 数量必须等于交易记录数量。
3. 动词从以下风格中选择：换、留、付、弃、赎、添、收、纳、折、典出、换来、取走、收下、封存、留作。
4. story 要优先使用输入里的 entryIntent、fateStory、fateHook、storyBeats，把来意、命格、典当、取物、续签结果串成一段当票背面的掌柜手记。
5. story 不要流水账，不要复述全部数值，抓一两个最有意味的选择，让用户觉得“这局是我的”。
6. story 要有故事性：开头有来处，中段有一笔舍得，结尾留一个没说破的问题。
7. farewell 要像朋友圈配文：一句话，有余味，不鸡汤，不解释。
8. farewell 不要黑暗化，不要告别暗示，不要轻生暗示。
9. 不出现 AI、系统、模型、心理咨询等词。
10. 不引用歌词、真实人物、品牌、地名。`;
}

function getProviderStatus() {
  const provider = process.env.DEEPSEEK_API_KEY
    ? "deepseek"
    : process.env.ANTHROPIC_API_KEY
      ? "anthropic"
      : "none";

  return {
    ok: true,
    configured: provider !== "none",
    provider,
    model:
      provider === "deepseek"
        ? process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash"
        : provider === "anthropic"
          ? process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5"
          : undefined
  };
}

async function callProvider(prompt: string): Promise<unknown> {
  if (process.env.DEEPSEEK_API_KEY) {
    return callDeepSeek(prompt);
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return callAnthropic(prompt);
  }

  throw new Error("missing_llm_api_key");
}

async function callDeepSeek(prompt: string): Promise<unknown> {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
      messages: [
        { role: "system", content: "你只输出合法 JSON，不输出解释。" },
        { role: "user", content: prompt }
      ],
      thinking: { type: "disabled" },
      temperature: 0.72,
      max_tokens: 620,
      stream: false,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) throw new Error(`deepseek_${response.status}`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  return parseJson(content);
}

async function callAnthropic(prompt: string): Promise<unknown> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5",
      max_tokens: 620,
      temperature: 0.72,
      system: "你只输出合法 JSON，不输出解释。",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`anthropic_${response.status}`);
  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  const content = data?.content?.[0]?.text;
  return parseJson(content);
}

function parseJson(content: unknown): unknown {
  if (typeof content !== "string") throw new Error("empty_content");
  const trimmed = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(trimmed);
}
