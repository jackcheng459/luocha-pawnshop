import { Volume2, VolumeX } from "lucide-react";

type SoundToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  const Icon = enabled ? Volume2 : VolumeX;
  return (
    <button
      aria-label={enabled ? "关闭声音" : "开启声音"}
      className={enabled ? "sound-toggle active" : "sound-toggle"}
      title={enabled ? "关闭声音" : "开启声音"}
      type="button"
      onClick={onToggle}
    >
      <Icon size={17} strokeWidth={1.8} />
    </button>
  );
}
