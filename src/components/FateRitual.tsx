import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { audioEngine } from "../services/audioEngine";
import { CinnabarSeal } from "./CinnabarSeal";
import { FateStick, LotTube } from "./LotTube";
import { SceneImage } from "./SceneImage";

type FateRitualProps = {
  onComplete: () => void;
};

type RitualStep = "ready" | "shaking" | "stick" | "seal";

export function FateRitual({ onComplete }: FateRitualProps) {
  const [step, setStep] = useState<RitualStep>("ready");

  function startShake() {
    if (step !== "ready") return;
    setStep("shaking");
    audioEngine.playShake();
    window.setTimeout(() => setStep("stick"), 1500);
  }

  function reveal() {
    if (step !== "stick") return;
    audioEngine.playPaper();
    setStep("seal");
    window.setTimeout(onComplete, 1100);
  }

  function skip() {
    audioEngine.playPaper();
    onComplete();
  }

  return (
    <section className="ritual-scene" onDoubleClick={skip}>
      <SceneImage
        alt="罗刹当铺店内"
        className="ritual-bg"
        fallbackClass="interior-fallback"
        src="/images/shop-interior-main.jpg"
      />
      <div className="ritual-vignette" />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="ritual-copy"
        initial={{ opacity: 0, y: 16 }}
      >
        <p>桌上一只签筒，风里自响。</p>
        <h2 className="title-brush">摇签问命</h2>
      </motion.div>
      <button className="ritual-lot-button" type="button" onClick={startShake}>
        <LotTube raised={step === "stick" || step === "seal"} shaking={step === "shaking"} />
      </button>
      <AnimatePresence>
        {step === "stick" ? (
          <motion.button
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            className="fate-stick-button"
            exit={{ opacity: 0, scale: 1.3, rotate: 18 }}
            initial={{ y: 80, opacity: 0, rotate: -10 }}
            transition={{ type: "spring", stiffness: 100 }}
            type="button"
            onClick={reveal}
          >
            <FateStick />
            <span className="fate-stick-label">取签</span>
          </motion.button>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {step === "seal" ? (
          <motion.div
            animate={{ y: 0, scale: 1, rotate: -2, opacity: 1 }}
            className="seal-drop"
            exit={{ opacity: 0 }}
            initial={{ y: -220, scale: 4, rotate: -20, opacity: 0 }}
            transition={{ duration: 0.42, type: "spring", stiffness: 200 }}
          >
            <CinnabarSeal text="命" />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button className="skip-link" type="button" onClick={skip}>
        跳过
      </button>
    </section>
  );
}
