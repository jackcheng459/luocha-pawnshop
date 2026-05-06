import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import type { GuidanceMode } from "../data/types";
import { audioEngine } from "../services/audioEngine";

type LotDrawerProps = {
  guidanceMode?: GuidanceMode | null;
  onDraw: () => void;
  onSkip: () => void;
};

export function LotDrawer({ guidanceMode, onDraw, onSkip }: LotDrawerProps) {
  const isNovice = guidanceMode === "novice";

  return (
    <motion.section
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      className="paper-panel lot-panel"
      initial={{ opacity: 0, y: 22, rotate: -0.6 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => audioEngine.playHover()}
    >
      <div className="lot-stick">
        <span />
        <span />
        <span />
      </div>
      <h2>{isNovice ? "三笔已毕" : "桌上又多一支签"}</h2>
      {isNovice ? (
        <p>
          桌上多出一支签。抽，则再做一笔；不抽，便就此结当。
          <br />
          上签照旧，中签加倍，下签折慧。
        </p>
      ) : (
        <p>桌上又多一支签。</p>
      )}
      <div className="action-row center">
        <button className="ghost-button" type="button" onClick={onSkip}>
          不续了
        </button>
        <button className="seal-button" type="button" onClick={onDraw}>
          <ScrollText size={16} strokeWidth={1.8} />
          <span>再续一签</span>
        </button>
      </div>
    </motion.section>
  );
}
