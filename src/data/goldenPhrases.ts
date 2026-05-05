import type { PhraseType, PlayerState, ResourceKey } from "./types.js";

export const phraseTypeLabels: Record<PhraseType, string> = {
  recognize_pain: "认出疼过型",
  less_self_deception: "少骗自己型",
  elevate: "抬举玩家型",
  abrupt: "戛然而止型",
  gentle_guard: "温柔守护型"
};

export const fallbackPhrases: Record<PhraseType, string[]> = {
  recognize_pain: [
    "客官走得稳，因为疼过。",
    "此物压心多年，今夜终于落柜。",
    "疼处已收，不必回身验账。",
    "客官疼得有声，偏还走得直。",
    "旧伤不轻，幸而不再装轻。"
  ],
  less_self_deception: [
    "今夜没白来，你少骗自己一次。",
    "客官话不多，心里倒清了一寸。",
    "这一回，你没替旧事圆谎。",
    "账面难看，胜过心里假清白。",
    "老朽不夸你，只记你肯认。"
  ],
  elevate: [
    "此处已留你不住，人间还未必配得上你。",
    "客官走得轻，配得上一夜好梦。",
    "灯下这一眼，算老朽高看你。",
    "你肯清醒，人间便欠你一盏灯。",
    "此夜之后，莫再低看自己。"
  ],
  abrupt: [
    "灯下莫回头。",
    "夜路上慢些。",
    "话到此处。",
    "天亮前别拆。",
    "门外有风。"
  ],
  gentle_guard: [
    "明日的你，不必谢今夜的你。",
    "天亮前回得来便好。",
    "此夜不重，却也算数。",
    "留一点软，给明日用。",
    "客官慢走，别惊动旧梦。"
  ]
};

export function inferPhraseType(player: PlayerState): PhraseType {
  const pawnTrades = player.trades.filter((trade) => trade.type === "pawn");
  const heavyPawnCount = pawnTrades.filter((trade) => (trade.amountFrom ?? 0) >= 7).length;
  const soldChiOrWang = pawnTrades.filter(
    (trade) => trade.resourceFrom === "chi" || trade.resourceFrom === "wang"
  ).length;
  const huiGain = player.resources.hui - player.originalResources.hui;
  const totalLoss = sumResourceLoss(player.originalResources, player.resources);
  const boughtRiskyWant = player.trades.some((trade) => {
    const spentKeys = Object.keys(trade.itemPrice ?? {}) as ResourceKey[];
    return trade.type === "buy" && spentKeys.some((key) => key === "tan" || key === "chen");
  });

  if (heavyPawnCount >= 2) return "recognize_pain";
  if (soldChiOrWang >= 1) return "less_self_deception";
  if (huiGain >= 5) return "elevate";
  if (boughtRiskyWant || player.lotResult === "xia") return "abrupt";
  if (totalLoss <= 5) return "gentle_guard";
  return "recognize_pain";
}

export function fallbackPhrase(type: PhraseType): string {
  const bank = fallbackPhrases[type];
  return bank[Math.floor(Math.random() * bank.length)] ?? "来日再来。";
}

function sumResourceLoss(
  initial: Record<ResourceKey, number>,
  final: Record<ResourceKey, number>
): number {
  return (Object.keys(initial) as ResourceKey[]).reduce((sum, key) => {
    return sum + Math.max(0, initial[key] - final[key]);
  }, 0);
}
