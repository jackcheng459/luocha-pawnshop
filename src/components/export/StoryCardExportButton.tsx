import { Download, X } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import type { FateStoryRecord } from "../../data/types";
import { sanitizeShareText } from "../../game/compliance";
import { audioEngine } from "../../services/audioEngine";

type StoryCardExportButtonProps = {
  story: FateStoryRecord;
  storyUrl?: string;
  label: string;
};

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1000;

export function StoryCardExportButton({ label, story, storyUrl }: StoryCardExportButtonProps) {
  const [preview, setPreview] = useState<string>();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    audioEngine.playPaper();
    setExporting(true);
    try {
      const dataUrl = await renderStoryCard(story, storyUrl);
      setPreview(dataUrl);
      triggerDownload(dataUrl, `罗刹当铺-${story.fateName}-命主故事.png`);
    } catch {
      window.alert("导出失败。客官可截图保存，亦可扫码查看网页版。");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <button className="seal-button" disabled={exporting} type="button" onClick={handleExport}>
        <Download size={16} strokeWidth={1.8} />
        <span>{exporting ? "正在制卡" : label}</span>
      </button>
      {preview ? (
        <div className="story-export-preview" role="dialog" aria-modal="true" aria-label="命主故事卡预览">
          <div className="story-export-panel">
            <button className="story-export-close" type="button" aria-label="关闭预览" onClick={() => setPreview(undefined)}>
              <X size={18} strokeWidth={1.8} />
            </button>
            <img src={preview} alt="命主故事卡" />
            <p>若浏览器未自动下载，可长按图片保存。</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

async function renderStoryCard(story: FateStoryRecord, storyUrl?: string): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_context_unavailable");

  drawPaper(ctx);
  drawBorder(ctx);

  ctx.textAlign = "center";
  ctx.fillStyle = "#9b2a21";
  ctx.font = font(28, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  ctx.fillText("罗刹当铺 · 一夜笔记", CARD_WIDTH / 2, 86);

  drawStamp(ctx, sanitizeShareText(story.fateName, "无名命牌"));
  drawJudgment(ctx, sanitizeShareText(story.fateJudgment, "此命无批，账上有风。"));

  ctx.strokeStyle = "rgba(88, 43, 22, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(104, 286);
  ctx.lineTo(CARD_WIDTH - 104, 286);
  ctx.stroke();

  const storyText = sanitizeShareText(story.storyText, "这一夜的故事已入账。");
  const [body, closing] = splitClosing(storyText);
  drawBody(ctx, body, 94, 330, 562, closing ? 704 : 780);
  if (closing) drawClosing(ctx, closing);

  ctx.fillStyle = "rgba(58, 40, 24, 0.55)";
  ctx.font = font(18, "Noto Serif SC", "serif");
  ctx.textAlign = "left";
  ctx.fillText("luochapawnshop.top", 74, 930);

  const qrData = await QRCode.toDataURL(buildAbsoluteStoryUrl(story, storyUrl), {
    width: 180,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#3a2818", light: "#d4b896" }
  });
  const qrImage = await loadImage(qrData);
  ctx.drawImage(qrImage, CARD_WIDTH - 158, CARD_HEIGHT - 158, 94, 94);

  return canvas.toDataURL("image/png", 0.95);
}

function drawPaper(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  gradient.addColorStop(0, "#dbc48f");
  gradient.addColorStop(0.55, "#c79a65");
  gradient.addColorStop(1, "#b1764a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.globalAlpha = 0.08;
  for (let y = 26; y < CARD_HEIGHT; y += 18) {
    ctx.fillStyle = y % 36 === 0 ? "#fff1c8" : "#6f3d22";
    ctx.fillRect(34, y, CARD_WIDTH - 68, 1);
  }
  ctx.globalAlpha = 1;
}

function drawBorder(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#b91c1c";
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28);
  ctx.strokeStyle = "rgba(94, 51, 24, 0.34)";
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, CARD_WIDTH - 56, CARD_HEIGHT - 56);
}

function drawStamp(ctx: CanvasRenderingContext2D, fateName: string) {
  ctx.save();
  ctx.translate(CARD_WIDTH / 2, 168);
  ctx.rotate(-2 * Math.PI / 180);
  const width = Math.min(560, Math.max(210, fateName.length * 76));
  ctx.strokeStyle = "rgba(143, 36, 29, 0.74)";
  ctx.lineWidth = 4;
  ctx.strokeRect(-width / 2, -54, width, 92);
  ctx.fillStyle = "#24160f";
  ctx.font = font(64, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(fateName, 0, -8, width - 34);
  ctx.restore();
}

function drawJudgment(ctx: CanvasRenderingContext2D, text: string) {
  ctx.fillStyle = "#9b2a21";
  ctx.font = `italic ${font(25, "Noto Serif SC", "serif")}`;
  ctx.textAlign = "center";
  const lines = wrapText(ctx, text, 530);
  lines.slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, CARD_WIDTH / 2, 245 + index * 38);
  });
}

function drawBody(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, maxY: number) {
  ctx.fillStyle = "rgba(36, 22, 15, 0.92)";
  ctx.font = font(24, "Noto Serif SC", "Kaiti SC", "serif");
  ctx.textAlign = "left";
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  let cursor = y;
  for (const paragraph of paragraphs) {
    const lines = wrapText(ctx, paragraph, maxWidth);
    for (const line of lines) {
      if (cursor > maxY) {
        ctx.fillText("……", x, cursor);
        return;
      }
      ctx.fillText(line, x, cursor);
      cursor += 42;
    }
    cursor += 16;
  }
}

function drawClosing(ctx: CanvasRenderingContext2D, text: string) {
  ctx.fillStyle = "#9b2a21";
  ctx.font = font(22, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  ctx.textAlign = "left";
  const lines = wrapText(ctx, text, 470).slice(0, 3);
  lines.forEach((line, index) => {
    ctx.fillText(line, 94, 770 + index * 34);
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  const lines: string[] = [];
  let line = "";
  for (const char of chars) {
    const next = `${line}${char}`;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function splitClosing(text: string): [string, string?] {
  const parts = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const closingIndex = parts.findIndex((part) => part.includes("夜账末页"));
  if (closingIndex < 0) return [parts.join("\n")];
  const main = parts.slice(0, closingIndex).join("\n");
  const closing = parts.slice(closingIndex).join("\n");
  return [main || parts.join("\n"), closing];
}

function buildAbsoluteStoryUrl(story: FateStoryRecord, storyUrl?: string): string {
  const url = storyUrl ?? `/story/${story.storyId}`;
  if (url.startsWith("http")) return url;
  const configuredSite = import.meta.env.VITE_SITE_URL as string | undefined;
  const siteUrl = configuredSite?.replace(/\/$/, "") || window.location.origin;
  return `${siteUrl}${url}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename.replace(/[\\/:*?"<>|]/g, "");
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function font(size: number, ...families: string[]): string {
  return `${size}px ${families.map((family) => `"${family}"`).join(", ")}`;
}
