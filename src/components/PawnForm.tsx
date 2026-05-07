import { useEffect, useMemo, useState } from "react";
import { resourceLabels, resourceOrder } from "../data/fates";
import type { PawnAmount, PawnInput, ResourceKey, ResourceMap } from "../data/types";
import { formatMoney, getPawnTarget, resourceName } from "../game/rules";
import { audioEngine } from "../services/audioEngine";

type PawnFormProps = {
  resources: ResourceMap;
  canSellAgain: boolean;
  isEntry: boolean;
  onSubmit: (input: PawnInput) => void;
  onCancel?: () => void;
  showGuidance?: boolean;
  onGuidanceVisible?: () => void;
  pawnRate?: number;
};

const pawnAmounts: PawnAmount[] = [3, 7, 10];

export function PawnForm({
  resources,
  canSellAgain,
  isEntry,
  onSubmit,
  onCancel,
  showGuidance = false,
  onGuidanceVisible,
  pawnRate = 0.7
}: PawnFormProps) {
  const [resourceFrom, setResourceFrom] = useState<ResourceKey>("chi");
  const [resourceTo, setResourceTo] = useState<ResourceKey>("chi");
  const [amountFrom, setAmountFrom] = useState<PawnAmount>(3);
  const [itemName, setItemName] = useState("");
  const [itemStory, setItemStory] = useState("");

  const target = getPawnTarget({ resourceFrom, resourceTo, amountFrom, itemName, itemStory });
  const canSubmit = useMemo(
    () =>
      resources[resourceFrom] >= amountFrom &&
      itemName.trim().length > 0 &&
      itemName.length <= 12 &&
      itemStory.length <= 30 &&
      (isEntry || canSellAgain),
    [amountFrom, canSellAgain, isEntry, itemName, itemStory, resourceFrom, resources]
  );

  useEffect(() => {
    if (showGuidance) onGuidanceVisible?.();
  }, [onGuidanceVisible, showGuidance]);

  return (
    <section className="paper-panel pawn-panel">
      <div className="section-heading">
        <span>{isEntry ? "入门典当" : "再典一物"}</span>
        <small>一两入柜，七钱出门。罗刹海市从不做足秤买卖。</small>
      </div>

      {showGuidance ? (
        <div className="guidance-inline">
          <p>客官身上哪一份最重？</p>
          <p>取出一份，老朽给你称一称，换些别的。</p>
        </div>
      ) : null}

      <div className="choice-grid">
        {resourceOrder.map((key) => (
          <button
            className={resourceFrom === key ? "choice selected" : "choice"}
            key={key}
            type="button"
            onClick={() => {
              audioEngine.playChoice();
              setResourceFrom(key);
            }}
          >
            <span>{resourceLabels[key]}</span>
            <small>{formatMoney(resources[key])}</small>
          </button>
        ))}
      </div>

      <div className="segmented">
        {pawnAmounts.map((amount) => (
          <button
            className={amountFrom === amount ? "selected" : ""}
            key={amount}
            type="button"
            onClick={() => {
              audioEngine.playChoice();
              setAmountFrom(amount);
            }}
          >
            {amount === 3 ? "轻当三钱" : amount === 7 ? "中当七钱" : "重当一两"}
          </button>
        ))}
      </div>

      {resourceFrom === "hui" ? (
        <label className="field">
          <span>换作</span>
          <select value={resourceTo} onChange={(event) => setResourceTo(event.target.value as ResourceKey)}>
            {resourceOrder
              .filter((key) => key !== "hui")
              .map((key) => (
                <option key={key} value={key}>
                  {resourceLabels[key]}
                </option>
              ))}
          </select>
        </label>
      ) : null}

      <label className="field">
        <span>物名</span>
        <input
          maxLength={12}
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="如：一口旧气、半句不甘"
        />
      </label>

      <label className="field">
        <span>来历</span>
        <textarea
          maxLength={30}
          value={itemStory}
          onChange={(event) => setItemStory(event.target.value)}
          placeholder="写一句你还没放过自己的事"
        />
      </label>

      <div className="pawn-summary">
        典出 {formatMoney(amountFrom)}{resourceName(resourceFrom)}，得 {formatMoney(Math.floor(amountFrom * pawnRate))}
        {resourceName(target)}
      </div>

      <div className="action-row">
        {onCancel ? (
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              audioEngine.playPaper();
              onCancel();
            }}
          >
            作罢
          </button>
        ) : null}
        <button
          className="seal-button"
          disabled={!canSubmit}
          type="button"
          onClick={() =>
            onSubmit({
              resourceFrom,
              resourceTo,
              amountFrom,
              itemName: itemName.trim(),
              itemStory: itemStory.trim()
            })
          }
        >
          此物入柜
        </button>
      </div>
    </section>
  );
}
