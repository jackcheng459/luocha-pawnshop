import { Download } from "lucide-react";
import type { RefObject } from "react";
import { useCardExport } from "../hooks/useCardExport";
import { audioEngine } from "../services/audioEngine";

type ShareButtonProps = {
  targetRef: RefObject<HTMLElement | null>;
  filename: string;
  label: string;
};

export function ShareButton({ targetRef, filename, label }: ShareButtonProps) {
  const exportCard = useCardExport();
  return (
    <button
      className="seal-button"
      type="button"
      onClick={() => {
        audioEngine.playPaper();
        exportCard(targetRef, filename);
      }}
    >
      <Download size={16} strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );
}
