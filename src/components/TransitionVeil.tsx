import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type TransitionVeilProps = {
  text?: string;
  stamp: string;
};

export function TransitionVeil({ text, stamp }: TransitionVeilProps) {
  const [visible, setVisible] = useState(Boolean(text));

  useEffect(() => {
    if (!text) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1180);
    return () => window.clearTimeout(timer);
  }, [stamp, text]);

  return (
    <AnimatePresence>
      {visible && text ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="transition-veil"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            animate={{ x: "110%", opacity: [0, 1, 1, 0] }}
            className="transition-ink"
            initial={{ x: "-110%", opacity: 0 }}
            transition={{ duration: 1.08, ease: "easeInOut" }}
          />
          <motion.span
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -8] }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 1.02, ease: "easeOut" }}
          >
            {text}
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
