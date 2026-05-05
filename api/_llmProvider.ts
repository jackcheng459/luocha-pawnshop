export type LlmTextResult = {
  text: string;
  model: string;
};

export function getProviderStatus() {
  const provider = process.env.DEEPSEEK_API_KEY
    ? "deepseek"
    : process.env.ANTHROPIC_API_KEY
      ? "anthropic"
      : "none";

  return {
    configured: provider !== "none",
    provider,
    model:
      provider === "deepseek"
        ? process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash"
        : provider === "anthropic"
          ? process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5"
          : "fallback"
  };
}

export async function callTextProvider(
  prompt: string,
  system: string,
  options: {
    maxTokens?: number;
    model?: string;
    responseFormat?: "json_object";
    temperature?: number;
    timeoutMs?: number;
  } = {}
): Promise<LlmTextResult> {
  const status = getProviderStatus();
  if (status.provider === "deepseek") {
    return callDeepSeekText(prompt, system, options);
  }
  if (status.provider === "anthropic") {
    return callAnthropicText(prompt, system, options);
  }
  throw new Error("missing_llm_api_key");
}

async function callDeepSeekText(
  prompt: string,
  system: string,
  options: {
    maxTokens?: number;
    model?: string;
    responseFormat?: "json_object";
    temperature?: number;
    timeoutMs?: number;
  }
): Promise<LlmTextResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  const model = options.model ?? process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        thinking: { type: "disabled" },
        response_format: options.responseFormat ? { type: options.responseFormat } : undefined,
        temperature: options.temperature ?? 0.72,
        max_tokens: options.maxTokens ?? 900,
        stream: false
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`deepseek_${response.status}`);
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("empty_content");
    return { text, model };
  } finally {
    clearTimeout(timeout);
  }
}

async function callAnthropicText(
  prompt: string,
  system: string,
  options: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<LlmTextResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens ?? 900,
        temperature: options.temperature ?? 0.72,
        system,
        messages: [{ role: "user", content: prompt }]
      }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`anthropic_${response.status}`);
    const data = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error("empty_content");
    return { text, model };
  } finally {
    clearTimeout(timeout);
  }
}
