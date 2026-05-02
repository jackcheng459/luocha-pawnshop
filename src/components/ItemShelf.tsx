import { items } from "../data/items";
import type { PlayerState } from "../data/types";
import { ItemCard } from "./ItemCard";

type ItemShelfProps = {
  player: PlayerState;
  onBuy: (itemId: number) => void;
};

export function ItemShelf({ player, onBuy }: ItemShelfProps) {
  const visibleItems = items;
  return (
    <section className="shelf-panel">
      <div className="section-heading">
        <span>货架</span>
        <small>{player.priceMultiplier === 2 ? "今夜物贵，价翻一倍" : "价照旧"}</small>
      </div>
      <div className="items-grid">
        {visibleItems.map((item) => (
          <ItemCard
            item={item}
            key={item.id}
            multiplier={player.priceMultiplier}
            resources={player.resources}
            onBuy={onBuy}
          />
        ))}
      </div>
    </section>
  );
}
