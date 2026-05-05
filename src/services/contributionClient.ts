import type { PawnInput, PawnLlmResult, PlayerState } from "../data/types";

export function capturePawnContribution(
  player: PlayerState | undefined,
  input: PawnInput,
  result: PawnLlmResult
) {
  if (!player) return;
  void fetch("/api/contribution/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entryIntent: player.entryIntent,
      fateName: player.fateName,
      seasonTerm: player.seasonTerm,
      resourceFrom: input.resourceFrom,
      resourceTo: input.resourceTo,
      amountFrom: input.amountFrom,
      rawName: input.itemName,
      rawStory: input.itemStory,
      renamedItem: result.renamedItem,
      ledgerLine: result.ledgerLine,
      promptVersion: "v1.5.0"
    })
  }).catch(() => {
    // Contribution capture is a content-growth side channel; it must never block play.
  });
}
