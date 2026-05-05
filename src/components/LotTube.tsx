type LotTubeProps = {
  shaking?: boolean;
  raised?: boolean;
};

export function LotTube({ shaking = false, raised = false }: LotTubeProps) {
  const className = ["lot-tube", shaking ? "shaking" : "", raised ? "raised" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} aria-hidden="true">
      <img className="lot-tube-image" src="/images/lot-tube-generated.png" alt="" draggable={false} />
      <span className="lot-tube-shadow" />
    </div>
  );
}

export function FateStick() {
  return (
    <div className="fate-stick" aria-hidden="true">
      <img src="/images/lot-stick-generated.png" alt="" draggable={false} />
    </div>
  );
}
