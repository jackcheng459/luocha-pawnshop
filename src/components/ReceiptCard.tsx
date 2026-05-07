import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { PlayerState } from "../data/types";
import { sanitizeShareText } from "../game/compliance";
import { formatLotEntryLine, formatTradeLine } from "../game/receipt";
import { audioEngine } from "../services/audioEngine";
import { ResourceLedger } from "./ResourceLedger";
import { StoryQr } from "./StoryQr";

type ReceiptCardProps = {
  player: PlayerState;
};

export const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(function ReceiptCard(
  { player },
  ref
) {
  const farewell = sanitizeShareText(player.farewell ?? "来日再来。", "来日再来。");
  const storyTitle = sanitizeShareText(player.receiptStoryTitle ?? "夜账小记", "夜账小记");
  const story = sanitizeShareText(player.receiptStory ?? "掌柜收了账，也收了你今夜没说完的那句话。", "掌柜收了账，也收了你今夜没说完的那句话。");
  return (
    <motion.div
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      className="share-card receipt-share-card"
      initial={{ opacity: 0, rotate: 1.4, y: 16 }}
      ref={ref}
      transition={{ duration: 0.42, ease: "easeOut" }}
      whileHover={{ y: -6, rotate: -0.5, scale: 1.012 }}
      onMouseEnter={() => audioEngine.playHover()}
    >
      <div className="receipt-title">罗刹当铺</div>
      <div className="receipt-subtitle">当票 · 丙午年某月某夜</div>
      <div className="receipt-fate">
        命格：{sanitizeShareText(player.fateName, "无名客")}
      </div>
      <div className="receipt-story">
        <strong>{storyTitle}</strong>
        <p>{story}</p>
      </div>
      <div className="receipt-lines">
        {player.trades.slice(0, 4).map((trade) => (
          <p key={trade.id}>{sanitizeShareText(formatTradeLine(trade), "以一念，换一夜")}</p>
        ))}
      </div>
      {player.lotEntry ? (
        <div className="receipt-lot-entry">
          <span>签落</span>
          <p>{sanitizeShareText(formatLotEntryLine(player.lotEntry), "签落，命已入账")}</p>
        </div>
      ) : null}
      <ResourceLedger resources={player.resources} original={player.originalResources} compact />
      <p className="receipt-farewell">{farewell}</p>
      <StoryQr caption="扫读命主故事" url={player.storyQrUrl ?? player.storyUrl} />
      <div className="receipt-seal">当</div>
    </motion.div>
  );
});
