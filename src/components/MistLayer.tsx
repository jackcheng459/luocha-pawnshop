type MistLayerProps = {
  active?: boolean;
};

export function MistLayer({ active = true }: MistLayerProps) {
  return (
    <div aria-hidden="true" className={active ? "mist-layer active" : "mist-layer"}>
      <span className="mist mist-a" />
      <span className="mist mist-b" />
      <span className="mist mist-c" />
    </div>
  );
}
