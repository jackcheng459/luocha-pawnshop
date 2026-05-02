import { useState } from "react";

type SceneImageProps = {
  src: string;
  fallbackClass: string;
  alt?: string;
  className?: string;
};

export function SceneImage({ src, fallbackClass, alt = "", className = "" }: SceneImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div aria-hidden="true" className={`${fallbackClass} ${className}`} />;
  }

  return (
    <img
      alt={alt}
      className={className}
      draggable={false}
      src={src}
      onError={() => setFailed(true)}
    />
  );
}
