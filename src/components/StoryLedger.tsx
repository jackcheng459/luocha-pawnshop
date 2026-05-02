import type { StoryBeat } from "../data/types";
import { sanitizeShareText } from "../game/compliance";

const toneLabels: Record<StoryBeat["tone"], string> = {
  entry: "来意",
  fate: "命牌",
  pawn: "典当",
  item: "取物",
  lot: "续签"
};

type StoryLedgerProps = {
  beats: StoryBeat[];
};

export function StoryLedger({ beats }: StoryLedgerProps) {
  const visible = beats.slice(-4).reverse();

  return (
    <aside className="story-ledger">
      <strong>夜账札记</strong>
      {visible.length === 0 ? (
        <span className="story-entry story-fate">
          <small>未记</small>
          <b>柜上灯花未动，账本还没有认出你。</b>
        </span>
      ) : (
        visible.map((beat) => (
          <span
            className={`story-entry story-${beat.tone === "entry" ? "intent" : beat.tone}`}
            key={beat.id}
          >
            <small>{toneLabels[beat.tone]}</small>
            <b>{sanitizeShareText(beat.title, "夜账一笔")}</b>
            <em>{sanitizeShareText(beat.text, "掌柜添了一笔，却没有多问。")}</em>
          </span>
        ))
      )}
    </aside>
  );
}
