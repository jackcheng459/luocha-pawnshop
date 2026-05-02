type CinnabarSealProps = {
  text: string;
  className?: string;
};

export function CinnabarSeal({ text, className = "" }: CinnabarSealProps) {
  return (
    <div className={`cinnabar-seal ${className}`} aria-label={text}>
      <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
        <path d="M18 14 102 18 108 98 24 106 12 32Z" />
        <path d="M27 27 95 29 96 88 32 94 25 40Z" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
