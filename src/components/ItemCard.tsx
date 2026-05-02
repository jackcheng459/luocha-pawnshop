import { motion } from "framer-motion";
import type { Item, ResourceMap } from "../data/types";
import { canAfford, formatResourcePrice } from "../game/rules";
import { audioEngine } from "../services/audioEngine";

type ItemCardProps = {
  item: Item;
  resources: ResourceMap;
  multiplier: 1 | 2;
  onBuy: (itemId: number) => void;
};

export function ItemCard({ item, resources, multiplier, onBuy }: ItemCardProps) {
  const affordable = canAfford(resources, item.price, multiplier);
  return (
    <motion.article
      className={`item-card item-tier-${item.tier}${item.isLegendary ? " legendary-item" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      viewport={{ once: true, margin: "-24px" }}
      whileHover={{
        y: -8,
        rotate: item.isLegendary ? -0.8 : 0.4,
        boxShadow: item.isLegendary
          ? "0 24px 58px rgba(143, 36, 29, 0.28), inset 0 0 36px rgba(143, 36, 29, 0.22)"
          : "0 22px 52px rgba(0, 0, 0, 0.32), inset 0 0 28px rgba(232, 182, 90, 0.08)"
      }}
      whileInView={{ opacity: 1, y: 0 }}
      onMouseEnter={() => audioEngine.playHover()}
    >
      <div className="item-card-head">
        <h3>{item.name}</h3>
        <span>{item.tier === 99 ? "幻物" : `${item.tier}档`}</span>
      </div>
      <p>{item.description}</p>
      <p className="item-lore">{item.lore}</p>
      <div className="item-price">{formatResourcePrice(item.price, multiplier)}</div>
      <button
        className={affordable ? "buy-button" : "buy-button unaffordable"}
        type="button"
        onClick={() => onBuy(item.id)}
      >
        <span>取此物</span>
      </button>
    </motion.article>
  );
}
