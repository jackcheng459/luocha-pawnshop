import { motion } from "framer-motion";
import { Compass, FlameKindling } from "lucide-react";
import type { EntryIntent } from "../data/types";
import { audioEngine } from "../services/audioEngine";
import { MistLayer } from "./MistLayer";
import { SceneImage } from "./SceneImage";

type EntryQuestionProps = {
  onChoose: (intent: EntryIntent) => void;
};

export function EntryQuestion({ onChoose }: EntryQuestionProps) {
  return (
    <section className="entry-question-scene">
      <SceneImage
        alt="罗刹当铺柜前"
        className="ritual-bg"
        fallbackClass="interior-fallback"
        src="/images/shop-interior-main.jpg"
      />
      <div className="ritual-vignette" />
      <MistLayer />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="entry-question-panel"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.62 }}
      >
        <p>掌柜抬眼</p>
        <h2 className="title-brush">客从何处来，到店有何事？</h2>
        <div className="entry-choice-grid">
          <motion.button
            className="entry-choice"
            type="button"
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onChoose("wander")}
            onMouseEnter={() => audioEngine.playHover()}
          >
            <Compass size={22} strokeWidth={1.7} />
            <span>来此逛逛</span>
            <small>雾里灯亮，随手翻一页命牌。</small>
          </motion.button>
          <motion.button
            className="entry-choice"
            type="button"
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onChoose("relief")}
            onMouseEnter={() => audioEngine.playHover()}
          >
            <FlameKindling size={22} strokeWidth={1.7} />
            <span>有烦恼事欲解脱</span>
            <small>把一件放不下的东西，交给柜上称一称。</small>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
