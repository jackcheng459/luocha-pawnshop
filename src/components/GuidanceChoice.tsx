import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GuidanceMode } from "../data/types";
import { audioEngine } from "../services/audioEngine";

type GuidanceChoiceProps = {
  onChoose: (mode: GuidanceMode) => void;
};

export function GuidanceChoice({ onChoose }: GuidanceChoiceProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 2300);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(mode: GuidanceMode) {
    audioEngine.playChoice();
    onChoose(mode);
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="guidance-choice-panel"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 1.5, duration: 0.58, ease: "easeOut" }}
    >
      <p className="guidance-kicker">命格朱砂未干，掌柜抬眼</p>
      <div className="guidance-rule-copy">
        <p>客官身上有命数九两九钱，</p>
        <p>痴嗔贪惘慧各有分量。</p>
        <p>铺中物事，皆以此称量。</p>
      </div>
      <motion.div
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
        className="guidance-choice-body"
        initial={false}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h2>客官初临此地，还是旧识老朽？</h2>
        <div className="guidance-choice-grid">
          <button
            className="guidance-choice-button"
            disabled={!ready}
            type="button"
            onClick={() => choose("novice")}
            onMouseEnter={() => audioEngine.playHover()}
          >
            初临此地
          </button>
          <button
            className="guidance-choice-button"
            disabled={!ready}
            type="button"
            onClick={() => choose("veteran")}
            onMouseEnter={() => audioEngine.playHover()}
          >
            旧识掌柜
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
