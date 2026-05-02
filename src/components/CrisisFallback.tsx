type CrisisFallbackProps = {
  message?: string;
  onClose: () => void;
};

export function CrisisFallback({ message, onClose }: CrisisFallbackProps) {
  if (!message) return null;
  return (
    <div className="safety-panel">
      <p>{message}</p>
      <button className="ghost-button" type="button" onClick={onClose}>
        换一个轻一点的念头
      </button>
    </div>
  );
}
