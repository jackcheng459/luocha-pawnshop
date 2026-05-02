import { useRef } from "react";
import { Download } from "lucide-react";
import { useCardExport } from "../hooks/useCardExport";
import { SceneImage } from "./SceneImage";

export function ShowcasePoster() {
  const posterRef = useRef<HTMLDivElement>(null);
  const exportCard = useCardExport();

  return (
    <main className="showcase-page">
      <div className="showcase-poster" ref={posterRef}>
        <div className="poster-scene">
          <SceneImage
            alt="罗刹当铺比赛展示图"
            className="poster-image"
            fallbackClass="poster-fallback"
            src="/images/luocha-pawnshop-poster-4x3.jpg"
          />
          <div className="poster-inkwash" />
          <div className="poster-copy">
            <h1>罗刹当铺</h1>
            <p>不收金银，只当你的痴嗔贪惘。</p>
          </div>
        </div>
      </div>
      <button
        className="seal-button"
        type="button"
        onClick={() => exportCard(posterRef, "罗刹当铺-比赛展示图-4x3.png")}
      >
        <Download size={16} strokeWidth={1.8} />
        <span>导出展示图</span>
      </button>
    </main>
  );
}
