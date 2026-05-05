import { useEffect, useState } from "react";
import QRCode from "qrcode";

type StoryQrProps = {
  url?: string;
  caption?: string;
};

export function StoryQr({ url, caption = "扫读一夜笔记" }: StoryQrProps) {
  const [src, setSrc] = useState<string>();
  const [qrUrl, setQrUrl] = useState<string>();

  useEffect(() => {
    if (!url) {
      setSrc(undefined);
      setQrUrl(undefined);
      return;
    }
    const resolvedUrl = buildQrUrl(url);
    const density = getQrDensity(resolvedUrl);
    let active = true;
    QRCode.toDataURL(resolvedUrl, {
      width: density === "dense" ? 360 : 240,
      margin: density === "dense" ? 3 : 2,
      errorCorrectionLevel: density === "dense" ? "L" : "H",
      color: {
        dark: "#1f140d",
        light: "#fff7df"
      }
    })
      .then((dataUrl) => {
        if (!active) return;
        setQrUrl(resolvedUrl);
        setSrc(dataUrl);
      })
      .catch(() => {
        if (!active) return;
        setQrUrl(undefined);
        setSrc(undefined);
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (!url || !src) return null;
  const dense = (qrUrl?.length ?? 0) > 360;

  return (
    <div className={`story-qr${dense ? " story-qr--dense" : ""}`} aria-label={caption} title={qrUrl}>
      <img src={src} alt={caption} />
      <span>{caption}</span>
    </div>
  );
}

function buildQrUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const configuredSite = import.meta.env.VITE_SITE_URL as string | undefined;
  const siteUrl = configuredSite?.replace(/\/$/, "") || window.location.origin;
  return `${siteUrl}${url}`;
}

function getQrDensity(url: string): "normal" | "dense" {
  return url.length > 260 ? "dense" : "normal";
}
