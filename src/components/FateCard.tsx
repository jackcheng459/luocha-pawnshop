import { forwardRef } from "react";
import { motion } from "framer-motion";
import { resourceLabels, resourceOrder } from "../data/fates";
import type { PlayerState } from "../data/types";
import { formatMoney } from "../game/rules";
import { audioEngine } from "../services/audioEngine";

type FateCardProps = {
  player: PlayerState;
};

export const FateCard = forwardRef<HTMLDivElement, FateCardProps>(function FateCard(
  { player },
  ref
) {
  return (
    <motion.div
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      className="share-card fate-share-card"
      initial={{ opacity: 0, rotate: -1.6, y: 18 }}
      ref={ref}
      transition={{ duration: 0.42, ease: "easeOut" }}
      whileHover={{ y: -6, rotate: 0.6, scale: 1.015 }}
      onMouseEnter={() => audioEngine.playHover()}
    >
      <div className="card-corner top-left" />
      <div className="card-corner top-right" />
      <div className="card-corner bottom-left" />
      <div className="card-corner bottom-right" />
      <p className="card-kicker">罗刹当铺命牌</p>
      <h1>{player.fateName}</h1>
      {player.changedFate ? <div className="changed-mark">此命已改</div> : null}
      <p className="fate-text">{player.fateText}</p>
      <p className="fate-detail">{player.fateDetail}</p>
      <div className="fate-story">
        <strong>命签小传</strong>
        <p>{player.fateStory}</p>
      </div>
      <p className="fate-hook">{player.fateHook}</p>
      <div className="fate-bars">
        {resourceOrder.map((key) => (
          <div className="fate-bar" key={key}>
            <div className="fate-bar-head">
              <span>{resourceLabels[key]}</span>
              <span>{formatMoney(player.resources[key])}</span>
            </div>
            <div className="fate-track">
              <span style={{ width: `${Math.max(8, player.resources[key])}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="card-stamp">九两九钱</div>
    </motion.div>
  );
});
