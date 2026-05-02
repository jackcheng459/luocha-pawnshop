import { motion } from "framer-motion";
import { DoorOpen } from "lucide-react";
import { MistLayer } from "./MistLayer";
import { SceneImage } from "./SceneImage";

type OpeningSceneProps = {
  onEnter: () => void;
};

export function OpeningScene({ onEnter }: OpeningSceneProps) {
  return (
    <section className="opening-scene" onClick={(event) => event.detail > 1 && onEnter()}>
      <SceneImage
        alt="雾夜中的罗刹当铺"
        className="opening-bg"
        fallbackClass="facade-fallback"
        src="/images/shop-facade-mist.jpg"
      />
      <MistLayer />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="opening-copy"
        initial={{ opacity: 0, y: 24 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p>罗刹海市 · 雾夜开张</p>
        <h1 className="title-brush">罗刹当铺</h1>
        <span>夜深了，进来坐坐。</span>
        <button className="seal-button large" type="button" onClick={onEnter}>
          <DoorOpen size={18} strokeWidth={1.8} />
          <span>推门入店</span>
        </button>
      </motion.div>
    </section>
  );
}
