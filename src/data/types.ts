export type ResourceKey = "chi" | "chen" | "tan" | "wang" | "hui";

export type ResourceMap = Record<ResourceKey, number>;

export type GamePhase =
  | "entry"
  | "fateDrawing"
  | "fateCard"
  | "pawnRequired"
  | "shop"
  | "lotOffer"
  | "lotResult"
  | "receipt"
  | "leaving";

export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 99;

export type EntryIntent = "wander" | "relief";

export type GuidanceMode = "novice" | "veteran";

export type Item = {
  id: number;
  name: string;
  tier: ItemTier;
  price: Partial<ResourceMap>;
  description: string;
  lore: string;
  sideEffects: Partial<ResourceMap>;
  hiddenFlavor: string;
  isLegendary?: boolean;
  legendaryFarewell?: string;
  legendaryEnding?: string;
};

export type FateCategory = "single" | "double" | "balanced" | "extreme";

export type FateName = {
  name: string;
  category: FateCategory;
  primary?: ResourceKey;
  secondary?: ResourceKey;
  judgments: string[];
};

export type FateResult = {
  name: string;
  text: string;
  detail: string;
  story: string;
  hook: string;
  source: "llm" | "fallback";
};

export type StoryBeatTone = "entry" | "fate" | "pawn" | "item" | "lot";

export type StoryBeat = {
  id: string;
  tone: StoryBeatTone;
  title: string;
  text: string;
};

export type PawnAmount = 3 | 7 | 10;

export type LotResult = "shang" | "zhong" | "xia";

export type TradeRecord = {
  id: string;
  type: "pawn" | "buy" | "lotPenalty";
  resourceFrom?: ResourceKey;
  resourceTo?: ResourceKey;
  amountFrom?: number;
  amountTo?: number;
  rawName?: string;
  renamedItem?: string;
  itemId?: number;
  itemName?: string;
  itemPrice?: Partial<ResourceMap>;
  sideEffects?: Partial<ResourceMap>;
  dialog?: string;
  storyNote?: string;
  verbForReceipt: string;
};

export type PlayerState = {
  entryIntent: EntryIntent;
  resources: ResourceMap;
  originalResources: ResourceMap;
  seasonTerm: string;
  seasonHint: string;
  nightLabel: string;
  fateName: string;
  fateText: string;
  fateDetail: string;
  fateStory: string;
  fateHook: string;
  fateSource: "llm" | "fallback";
  changedFate: boolean;
  trades: TradeRecord[];
  storyBeats: StoryBeat[];
  hasPawned: boolean;
  freeTradeCount: number;
  maxFreeTrades: 2 | 3;
  buyCount: number;
  pawnCount: number;
  drewLot: boolean;
  lotResult?: LotResult;
  priceMultiplier: 1 | 2;
  farewell?: string;
  receiptStoryTitle?: string;
  receiptStory?: string;
  endingLine?: string;
  storyStatus?: "idle" | "loading" | "done" | "fallback";
  storyId?: string;
  storyUrl?: string;
  storyQrUrl?: string;
  nightStory?: string;
  storyTimestamp?: string;
};

export type LlmSlot = "idle" | "loading" | "done" | "fallback";

export type GameState = {
  phase: GamePhase;
  player?: PlayerState;
  selectedItemId?: number;
  lastDialog?: string;
  safetyMessage?: string;
  llm: {
    fate: LlmSlot;
    pawn: LlmSlot;
    receipt: LlmSlot;
  };
};

export type PawnInput = {
  resourceFrom: ResourceKey;
  resourceTo?: ResourceKey;
  amountFrom: PawnAmount;
  itemName: string;
  itemStory: string;
};

export type PawnLlmResult = {
  renamedItem: string;
  dialog: string;
  ledgerLine: string;
};

export type ReceiptLlmResult = {
  farewell: string;
  storyTitle: string;
  story: string;
  verbsForTrades: string[];
};

export type FateStoryInput = {
  fateName: string;
  fateJudgment: string;
  weather?: string;
  initialResources: ResourceMap;
  finalResources: ResourceMap;
  trades: Array<{
    type: "pawn" | "buy" | "lotPenalty";
    resourceFrom?: ResourceKey;
    resourceTo?: ResourceKey;
    amountFrom?: number;
    amountTo?: number;
    itemName?: string;
    itemStory?: string;
    itemPrice?: Partial<ResourceMap>;
    sideEffects?: Partial<ResourceMap>;
  }>;
  drewLot: boolean;
  lotResult?: LotResult;
  extraLotAccepted?: boolean;
  timestamp: string;
  seasonTerm?: string;
  nightLabel?: string;
};

export type FateStoryRecord = FateStoryInput & {
  storyId: string;
  fateDetail?: string;
  storyText: string;
  generatedAt: number;
  llmModel: string;
  promptVersion: string;
};

export type PhraseType =
  | "recognize_pain"
  | "less_self_deception"
  | "elevate"
  | "abrupt"
  | "gentle_guard";

export type PhraseStatus = "pending_review" | "approved" | "rejected" | "archived";

export type Phrase = {
  id: string;
  type: PhraseType;
  text: string;
  status: PhraseStatus;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  llmModel: string;
  promptVersion: string;
  usedCount: number;
  lastUsedAt?: number;
};

export type ContributionRecord = {
  id: string;
  createdAt: number;
  entryIntent: EntryIntent;
  fateName: string;
  seasonTerm?: string;
  resourceFrom: ResourceKey;
  resourceTo?: ResourceKey;
  amountFrom: PawnAmount;
  rawName: string;
  rawStory: string;
  renamedItem?: string;
  ledgerLine?: string;
  status: "pending_review" | "approved" | "rejected" | "archived";
  promptVersion?: string;
};
