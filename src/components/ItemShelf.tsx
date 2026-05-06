import { useEffect, useState } from "react";
import { items } from "../data/items";
import type { PlayerState } from "../data/types";
import { ItemCard } from "./ItemCard";

type ItemShelfProps = {
  player: PlayerState;
  onBuy: (itemId: number) => void;
  showGuidance?: boolean;
  onGuidanceVisible?: () => void;
  insufficientItemId?: number;
  getInsufficientHint?: (itemId: number) => string | undefined;
};

export function ItemShelf({
  player,
  onBuy,
  showGuidance = false,
  onGuidanceVisible,
  insufficientItemId,
  getInsufficientHint
}: ItemShelfProps) {
  const visibleItems = items;
  const [dismissedGuidance, setDismissedGuidance] = useState(false);

  useEffect(() => {
    if (showGuidance) onGuidanceVisible?.();
  }, [onGuidanceVisible, showGuidance]);

  return (
    <section
      className="shelf-panel"
      onTouchMove={() => setDismissedGuidance(true)}
      onWheel={() => setDismissedGuidance(true)}
    >
      <div className="section-heading">
        <span>货架</span>
        <small>
          {player.priceMultiplier === 2 ? "今夜物贵，价翻一倍" : `${player.seasonTerm}夜，价照旧`}
        </small>
      </div>
      <p className="season-shelf-hint">{player.seasonHint}</p>
      {showGuidance && !dismissedGuidance ? (
        <div className="guidance-inline shelf-guidance">
          <p>货架上每件物事，标着要几钱什么。</p>
          <p>客官身上够，便取得走。</p>
        </div>
      ) : null}
      <div className="items-grid">
        {visibleItems.map((item) => (
          <ItemCard
            item={item}
            key={item.id}
            multiplier={player.priceMultiplier}
            resources={player.resources}
            insufficientHint={insufficientItemId === item.id ? getInsufficientHint?.(item.id) : undefined}
            onBuy={onBuy}
          />
        ))}
      </div>
    </section>
  );
}
