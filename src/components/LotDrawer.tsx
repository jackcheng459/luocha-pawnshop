import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { audioEngine } from "../services/audioEngine";

type LotDrawerProps = {
  onDraw: () => void;
  onSkip: () => void;
};

export function LotDrawer({ onDraw, onSkip }: LotDrawerProps) {
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
      <h2>桌上多出一支签</h2>
      <p>抽了，可能翻盘；不抽，至少不再加价。</p>
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
