import { motion } from "framer-motion";
import type { RefObject } from "react";
import type { PlayerState } from "../data/types";
import { CinnabarSeal } from "./CinnabarSeal";
import { ReceiptCard } from "./ReceiptCard";

type ReceiptAssembleProps = {
  player: PlayerState;
  cardRef: RefObject<HTMLDivElement | null>;
};

export function ReceiptAssemble({ player, cardRef }: ReceiptAssembleProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="receipt-assemble"
      initial={{ opacity: 0, scale: 0.86 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <ReceiptCard player={player} ref={cardRef} />
      <motion.div
        animate={{ y: 0, scale: 1, rotate: -8, opacity: [0, 1, 0] }}
        className="receipt-assemble-seal"
        initial={{ y: -140, scale: 3.5, rotate: -24, opacity: 0 }}
        transition={{ delay: 0.55, duration: 0.9, ease: "easeOut" }}
      >
        <CinnabarSeal text="当" />
      </motion.div>
    </motion.div>
  );
}
