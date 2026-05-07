import { motion } from "framer-motion";
import { RotateCcw, ScrollText, ShoppingBag, Stamp } from "lucide-react";
import type { GuidanceMode, LotResult } from "../data/types";
import { audioEngine } from "../services/audioEngine";

type LotResultPanelProps = {
  result: LotResult;
  guidanceMode?: GuidanceMode | null;
  canPawnExtra: boolean;
  canBuyExtra: boolean;
  huiDeducted?: number;
  onKeepShang: () => void;
  onUndoNoRedo: () => void;
  onUndoRedo: () => void;
  onChooseZhongPawn: () => void;
  onChooseZhongBuy: () => void;
  onFinish: () => void;
};

export function LotResultPanel({
  result,
  guidanceMode,
  canPawnExtra,
  canBuyExtra,
  huiDeducted,
  onKeepShang,
  onUndoNoRedo,
  onUndoRedo,
  onChooseZhongPawn,
  onChooseZhongBuy,
  onFinish
}: LotResultPanelProps) {
  const novice = guidanceMode === "novice";
  const title = result === "shang" ? "上签" : result === "zhong" ? "中签" : "下签";
  const noZhongMove = result === "zhong" && !canPawnExtra && !canBuyExtra;
  const text = buildResultText(result, novice, noZhongMove, huiDeducted);

  return (
    <motion.section
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      className={`paper-panel lot-panel lot-result-panel lot-result-${result}`}
      initial={{ opacity: 0, y: 22, rotate: -0.6 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      onMouseEnter={() => audioEngine.playHover()}
    >
      <motion.div
        animate={{ scale: 1, opacity: 1, rotate: -4 }}
        className="lot-result-seal"
        initial={{ scale: 1.6, opacity: 0, rotate: -14 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        {title}
      </motion.div>
      <h2>{title}</h2>
      <p>{text}</p>
      {result === "shang" ? (
        <div className="action-row center lot-result-actions">
          <button className="ghost-button" type="button" onClick={onUndoRedo}>
            <RotateCcw size={16} strokeWidth={1.8} />
            <span>反悔最后一笔，重做一次</span>
          </button>
          <button className="ghost-button" type="button" onClick={onUndoNoRedo}>
            反悔最后一笔，不再做
          </button>
          <button className="seal-button" type="button" onClick={onKeepShang}>
            不必反悔，直接离店
          </button>
        </div>
      ) : null}
      {result === "zhong" ? (
        noZhongMove ? (
          <div className="action-row center">
            <button className="seal-button" type="button" onClick={onFinish}>
              结当离店
            </button>
          </div>
        ) : (
          <div className="action-row center lot-result-actions">
            <button
              className="ghost-button"
              disabled={!canPawnExtra}
              type="button"
              onClick={onChooseZhongPawn}
            >
              <Stamp size={16} strokeWidth={1.8} />
              <span>再典一物</span>
            </button>
            <button
              className="seal-button"
              disabled={!canBuyExtra}
              type="button"
              onClick={onChooseZhongBuy}
            >
              <ShoppingBag size={16} strokeWidth={1.8} />
              <span>再取一物</span>
            </button>
          </div>
        )
      ) : null}
      {result === "xia" ? (
        <div className="action-row center">
          <button className="seal-button" type="button" onClick={onFinish}>
            <ScrollText size={16} strokeWidth={1.8} />
            <span>结当离店</span>
          </button>
        </div>
      ) : null}
    </motion.section>
  );
}

function buildResultText(
  result: LotResult,
  novice: boolean,
  noZhongMove: boolean,
  huiDeducted?: number
) {
  if (result === "shang") {
    return novice ? "上签：今夜难得，反悔不加价。" : "上签。反悔不加价。";
  }
  if (result === "zhong") {
    if (noZhongMove) return "中签：再做一笔。但客官身上已无可典，亦无可买。";
    return novice ? "中签：再做一笔。买价翻倍，卖损耗加倍。" : "中签。再做一笔，加倍。";
  }
  if (huiDeducted === 0) {
    return "下签：今夜运气不济。但客官慧已尽，未能再扣。";
  }
  return novice ? "下签：今夜运气不济，慧折半两。便就此结当吧。" : "下签。扣慧五钱。";
}
