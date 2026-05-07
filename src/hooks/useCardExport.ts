import html2canvas from "html2canvas";
import type { RefObject } from "react";

export function useCardExport() {
  return async function exportCard(ref: RefObject<HTMLElement | null>, filename: string) {
    try {
      if (!ref.current) return;
      const canvas = await html2canvas(ref.current, {
        backgroundColor: null,
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.alert("导出失败。客官可截图保存，亦可扫码查看网页版。");
    }
  };
}
