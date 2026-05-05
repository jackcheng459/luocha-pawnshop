import type {
  ContributionRecord,
  FateStoryRecord,
  Phrase,
  PhraseStatus,
  PhraseType
} from "../src/data/types.js";
import { fallbackPhrases } from "../src/data/goldenPhrases.js";

export interface StoryStorage {
  save(story: FateStoryRecord): Promise<void>;
  get(storyId: string): Promise<FateStoryRecord | null>;
  list(options?: { limit?: number }): Promise<FateStoryRecord[]>;
  delete(storyId: string): Promise<void>;
  exportAll(): Promise<FateStoryRecord[]>;
}

export interface PhraseStorage {
  save(phrase: Phrase): Promise<void>;
  get(id: string): Promise<Phrase | null>;
  list(options?: { status?: PhraseStatus | "all"; type?: PhraseType }): Promise<Phrase[]>;
  update(id: string, patch: Partial<Phrase>): Promise<Phrase | null>;
  getRandom(type: PhraseType): Promise<Phrase | null>;
  incrementUsedCount(id: string): Promise<void>;
  exportAll(): Promise<Phrase[]>;
}

export interface ContributionStorage {
  save(contribution: ContributionRecord): Promise<void>;
  list(options?: { limit?: number }): Promise<ContributionRecord[]>;
  exportAll(): Promise<ContributionRecord[]>;
}

const localStories = new Map<string, FateStoryRecord>();
const localPhrases = new Map<string, Phrase>();
const localContributions = new Map<string, ContributionRecord>();

export function getStoryStorage(): StoryStorage {
  return hasKvEnv() ? new KvStoryStorage() : new LocalStoryStorage();
}

export function getPhraseStorage(): PhraseStorage {
  seedLocalPhrases();
  return hasKvEnv() ? new KvPhraseStorage() : new LocalPhraseStorage();
}

export function getContributionStorage(): ContributionStorage {
  return hasKvEnv() ? new KvContributionStorage() : new LocalContributionStorage();
}

function hasKvEnv(): boolean {
  return Boolean(getKvUrl() && process.env.KV_REST_API_TOKEN);
}

class LocalStoryStorage implements StoryStorage {
  async save(story: FateStoryRecord) {
    localStories.set(story.storyId, story);
  }

  async get(storyId: string) {
    return localStories.get(storyId) ?? null;
  }

  async list(options: { limit?: number } = {}) {
    return [...localStories.values()]
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, options.limit ?? 50);
  }

  async delete(storyId: string) {
    localStories.delete(storyId);
  }

  async exportAll() {
    return this.list({ limit: Number.MAX_SAFE_INTEGER });
  }
}

class LocalPhraseStorage implements PhraseStorage {
  async save(phrase: Phrase) {
    localPhrases.set(phrase.id, phrase);
  }

  async get(id: string) {
    return localPhrases.get(id) ?? null;
  }

  async list(options: { status?: PhraseStatus | "all"; type?: PhraseType } = {}) {
    return [...localPhrases.values()]
      .filter((phrase) => !options.type || phrase.type === options.type)
      .filter((phrase) => !options.status || options.status === "all" || phrase.status === options.status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async update(id: string, patch: Partial<Phrase>) {
    const phrase = localPhrases.get(id);
    if (!phrase) return null;
    const next = { ...phrase, ...patch };
    localPhrases.set(id, next);
    return next;
  }

  async getRandom(type: PhraseType) {
    const approved = await this.list({ status: "approved", type });
    return approved[Math.floor(Math.random() * approved.length)] ?? null;
  }

  async incrementUsedCount(id: string) {
    const phrase = localPhrases.get(id);
    if (!phrase) return;
    localPhrases.set(id, {
      ...phrase,
      usedCount: phrase.usedCount + 1,
      lastUsedAt: Date.now()
    });
  }

  async exportAll() {
    return this.list({ status: "all" });
  }
}

class LocalContributionStorage implements ContributionStorage {
  async save(contribution: ContributionRecord) {
    localContributions.set(contribution.id, contribution);
  }

  async list(options: { limit?: number } = {}) {
    return [...localContributions.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, options.limit ?? 200);
  }

  async exportAll() {
    return this.list({ limit: Number.MAX_SAFE_INTEGER });
  }
}

class KvStoryStorage implements StoryStorage {
  async save(story: FateStoryRecord) {
    await redisCommand(["SET", storyKey(story.storyId), JSON.stringify(story)]);
  }

  async get(storyId: string) {
    const raw = await redisCommand<string | null>(["GET", storyKey(storyId)]);
    return raw ? (JSON.parse(raw) as FateStoryRecord) : null;
  }

  async list(options: { limit?: number } = {}) {
    const keys = await redisCommand<string[]>(["KEYS", "story:*"]);
    const records = await Promise.all(keys.slice(0, options.limit ?? 50).map((key) => redisCommand<string | null>(["GET", key])));
    return records
      .filter(Boolean)
      .map((raw) => JSON.parse(raw as string) as FateStoryRecord)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }

  async delete(storyId: string) {
    await redisCommand(["DEL", storyKey(storyId)]);
  }

  async exportAll() {
    return this.list({ limit: Number.MAX_SAFE_INTEGER });
  }
}

class KvPhraseStorage implements PhraseStorage {
  async save(phrase: Phrase) {
    await redisCommand(["SET", phraseKey(phrase.id), JSON.stringify(phrase)]);
    await redisCommand(["SADD", statusKey(phrase.status), phrase.id]);
    if (phrase.status === "approved") await redisCommand(["SADD", typeKey(phrase.type), phrase.id]);
  }

  async get(id: string) {
    const raw = await redisCommand<string | null>(["GET", phraseKey(id)]);
    return raw ? (JSON.parse(raw) as Phrase) : null;
  }

  async list(options: { status?: PhraseStatus | "all"; type?: PhraseType } = {}) {
    const ids = options.type
      ? await redisCommand<string[]>(["SMEMBERS", typeKey(options.type)])
      : options.status && options.status !== "all"
        ? await redisCommand<string[]>(["SMEMBERS", statusKey(options.status)])
        : (await redisCommand<string[]>(["KEYS", "phrase:*"]))
            .filter((key) => !key.includes(":index:"))
            .map((key) => key.replace("phrase:", ""));
    const records = await Promise.all(ids.map((id) => this.get(id)));
    return records
      .filter((phrase): phrase is Phrase => Boolean(phrase))
      .filter((phrase) => !options.status || options.status === "all" || phrase.status === options.status)
      .filter((phrase) => !options.type || phrase.type === options.type)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async update(id: string, patch: Partial<Phrase>) {
    const old = await this.get(id);
    if (!old) return null;
    const next = { ...old, ...patch };
    await redisCommand(["SREM", statusKey(old.status), id]);
    await redisCommand(["SREM", typeKey(old.type), id]);
    await this.save(next);
    return next;
  }

  async getRandom(type: PhraseType) {
    const id = await redisCommand<string | null>(["SRANDMEMBER", typeKey(type)]);
    if (!id) return seedPhrase(type);
    return this.get(id);
  }

  async incrementUsedCount(id: string) {
    const phrase = await this.get(id);
    if (!phrase) return;
    await this.update(id, {
      usedCount: phrase.usedCount + 1,
      lastUsedAt: Date.now()
    });
  }

  async exportAll() {
    return this.list({ status: "all" });
  }
}

class KvContributionStorage implements ContributionStorage {
  async save(contribution: ContributionRecord) {
    await redisCommand(["SET", contributionKey(contribution.id), JSON.stringify(contribution)]);
    await redisCommand(["SADD", "contribution:index:pending_review", contribution.id]);
  }

  async list(options: { limit?: number } = {}) {
    const keys = await redisCommand<string[]>(["KEYS", "contribution:*"]);
    const records = await Promise.all(
      keys
        .filter((key) => !key.includes(":index:"))
        .slice(0, options.limit ?? 200)
        .map((key) => redisCommand<string | null>(["GET", key]))
    );
    return records
      .filter(Boolean)
      .map((raw) => JSON.parse(raw as string) as ContributionRecord)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async exportAll() {
    return this.list({ limit: Number.MAX_SAFE_INTEGER });
  }
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const response = await fetch(getKvUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error(`kv_${response.status}`);
  const data = (await response.json()) as { result?: T; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result as T;
}

function seedLocalPhrases() {
  if (localPhrases.size > 0) return;
  (Object.keys(fallbackPhrases) as PhraseType[]).forEach((type) => {
    fallbackPhrases[type].forEach((text, index) => {
      const phrase = seedPhrase(type, index, text);
      localPhrases.set(phrase.id, phrase);
    });
  });
}

function seedPhrase(type: PhraseType, index = 0, text = fallbackPhrases[type][0]): Phrase {
  return {
    id: `seed-${type}-${index}`,
    type,
    text,
    status: "approved",
    createdAt: 0,
    reviewedAt: 0,
    reviewedBy: "seed",
    llmModel: "seed",
    promptVersion: "v1.5.0",
    usedCount: 0
  };
}

function getKvUrl(): string {
  return process.env.KV_REST_API_URL ?? process.env.KV_URL ?? "";
}

function storyKey(storyId: string): string {
  return `story:${storyId}`;
}

function phraseKey(id: string): string {
  return `phrase:${id}`;
}

function contributionKey(id: string): string {
  return `contribution:${id}`;
}

function statusKey(status: PhraseStatus): string {
  return `phrase:index:${status}`;
}

function typeKey(type: PhraseType): string {
  return `phrase:index:by_type:${type}`;
}
