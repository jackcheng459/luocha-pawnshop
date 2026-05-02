import { motion } from "framer-motion";
import { useState } from "react";
import { audioEngine } from "../services/audioEngine";
import { MistLayer } from "./MistLayer";
import { SceneImage } from "./SceneImage";

type DoorTransitionProps = {
  onDone: () => void;
};

export function DoorTransition({ onDone }: DoorTransitionProps) {
  const [ready, setReady] = useState(false);

  function enterCounter() {
    if (!ready) return;
    audioEngine.playPaper();
    onDone();
  }

  return (
    <section className="door-transition">
      <motion.div
        animate={{ scale: 1.18, filter: "blur(6px)", opacity: 0 }}
        className="door-transition-image"
        initial={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 1.45, ease: "easeInOut" }}
        onAnimationComplete={() => setReady(true)}
      >
        <SceneImage
          alt="当铺门前雾气"
          className="opening-bg"
          fallbackClass="facade-fallback"
          src="/images/shop-facade-mist.jpg"
        />
      </motion.div>
      <MistLayer />
      <motion.div
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
        className="door-transition-copy"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.46, ease: "easeOut" }}
      >
        <p>门缝里有灯。再往前一步，便要报来意。</p>
        <button className="seal-button" disabled={!ready} type="button" onClick={enterCounter}>
          入内问掌柜
        </button>
      </motion.div>
    </section>
  );
}
