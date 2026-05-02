import { AnimatePresence, motion } from "framer-motion";
import CountUp from "react-countup";
import { resourceLabels, resourceOrder } from "../data/fates";
import type { Item, ResourceMap } from "../data/types";
import { formatMoney } from "../game/rules";
import { CinnabarSeal } from "./CinnabarSeal";

type ItemObtainOverlayProps = {
  item?: Item;
  before?: ResourceMap;
  after?: ResourceMap;
  onDone: () => void;
};

export function ItemObtainOverlay({ item, before, after, onDone }: ItemObtainOverlayProps) {
  return (
    <AnimatePresence>
      {item && before && after ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="obtain-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onDone}
        >
          <motion.article
            animate={{ scale: 1, y: 0 }}
            className="obtain-card"
            initial={{ scale: 0.92, y: 40 }}
            transition={{ duration: 0.35 }}
          >
            <p>已得</p>
            <h2 className="title-brush">{item.name}</h2>
            <span>{item.hiddenFlavor}</span>
            <small>{item.lore}</small>
          </motion.article>
          <motion.div
            animate={{ y: 0, scale: 1, rotate: -5, opacity: 1 }}
            className="obtain-seal"
            initial={{ y: -140, scale: 3, rotate: -22, opacity: 0 }}
            transition={{ delay: 0.22, duration: 0.36, type: "spring", stiffness: 180 }}
          >
            <CinnabarSeal text="已得" />
          </motion.div>
          <div className="obtain-deltas">
            {resourceOrder.map((key, index) => {
              const diff = after[key] - before[key];
              if (diff === 0) return null;
              return (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className={diff > 0 ? "delta positive" : "delta negative"}
                  initial={{ opacity: 0, y: 12 }}
                  key={key}
                  transition={{ delay: 0.38 + index * 0.08 }}
                >
                  <span>{resourceLabels[key]}</span>
                  <strong>
                    {diff > 0 ? "+" : "-"}
                    <CountUp end={Math.abs(diff)} duration={0.55} /> 钱
                  </strong>
                  <small>
                    {formatMoney(before[key])} → {formatMoney(after[key])}
                  </small>
                </motion.div>
              );
            })}
          </div>
          <button className="skip-link" type="button" onClick={onDone}>
            收下
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
