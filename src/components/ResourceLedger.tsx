import { resourceLabels, resourceOrder } from "../data/fates";
import type { ResourceMap } from "../data/types";
import { formatMoney } from "../game/rules";

type ResourceLedgerProps = {
  resources: ResourceMap;
  original?: ResourceMap;
  compact?: boolean;
};

export function ResourceLedger({ resources, original, compact = false }: ResourceLedgerProps) {
  return (
    <div className={compact ? "ledger ledger-compact" : "ledger"}>
      {resourceOrder.map((key) => {
        const diff = original ? resources[key] - original[key] : 0;
        return (
          <div className="ledger-row" key={key}>
            <span className="ledger-name">{resourceLabels[key]}</span>
            <span className="ledger-value">{formatMoney(resources[key])}</span>
            {original ? (
            <span className={diff >= 0 ? "ledger-diff positive" : "ledger-diff negative"}>
                {diff === 0 ? "平" : `${diff > 0 ? "+" : "-"}${formatMoney(Math.abs(diff))}`}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
