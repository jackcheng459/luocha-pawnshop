import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SceneImage } from "./SceneImage";

type ShopkeeperDialogProps = {
  text?: string;
  onDone?: () => void;
};

export function ShopkeeperDialog({ text, onDone }: ShopkeeperDialogProps) {
  const [shown, setShown] = useState("");
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (!text) {
      setShown("");
      return;
    }
    setShown("");
    let index = 0;
    timerRef.current = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length && timerRef.current) window.clearInterval(timerRef.current);
    }, 62);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [text]);

  if (!text) return null;

  function finish() {
    if (shown.length < (text?.length ?? 0)) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setShown(text ?? "");
      return;
    }
    onDone?.();
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="shopkeeper-dialog"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={finish}
      >
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className="shopkeeper-figure"
          initial={{ y: 180, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <SceneImage
            alt="罗刹当铺掌柜剪影"
            className="shopkeeper-img"
            fallbackClass="shopkeeper-fallback"
            src="/images/shopkeeper-silhouette.webp"
          />
        </motion.div>
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className="dialog-bubble"
          initial={{ y: 18, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <p>{shown}{shown.length < (text?.length ?? 0) ? <span className="typing-cursor">│</span> : null}</p>
          <span>点击继续</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
