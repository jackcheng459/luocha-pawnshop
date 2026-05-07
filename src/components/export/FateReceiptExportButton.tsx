import { Download, X } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import { resourceLabels, resourceOrder } from "../../data/fates";
import type { PlayerState, ResourceKey, ResourceMap } from "../../data/types";
import { sanitizeShareText } from "../../game/compliance";
import { formatLotEntryLine, formatTradeLine } from "../../game/receipt";
import { formatMoney } from "../../game/rules";
import { audioEngine } from "../../services/audioEngine";

type FateReceiptExportButtonProps = {
  label: string;
  player: PlayerState;
  type: "fate" | "receipt";
};

const CARD_WIDTH = 750;
const CARD_HEIGHT = 1000;
const PAPER_TOP = "#dbc48f";
const PAPER_MID = "#c69a65";
const PAPER_BOTTOM = "#ad754c";
const INK = "#24160f";
const RED = "#9b2a21";

export function FateReceiptExportButton({ label, player, type }: FateReceiptExportButtonProps) {
  const [preview, setPreview] = useState<string>();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    audioEngine.playPaper();
    setExporting(true);
    try {
      const dataUrl = type === "fate" ? await renderFateCard(player) : await renderReceiptCard(player);
      setPreview(dataUrl);
      triggerDownload(dataUrl, type === "fate" ? "罗刹当铺-命格卡.png" : "罗刹当铺-当票卡.png");
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
        <div className="story-export-preview" role="dialog" aria-modal="true" aria-label={`${label}预览`}>
          <div className="story-export-panel">
            <button className="story-export-close" type="button" aria-label="关闭预览" onClick={() => setPreview(undefined)}>
              <X size={18} strokeWidth={1.8} />
            </button>
            <img src={preview} alt={label} />
            <p>若浏览器未自动下载，可长按图片保存。</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

async function renderFateCard(player: PlayerState): Promise<string> {
  const canvas = createCanvas();
  const ctx = getContext(canvas);
  drawPaper(ctx);
  drawBorder(ctx, true);
  drawCorners(ctx);

  drawCentered(ctx, `罗刹当铺命牌 · ${player.seasonTerm}`, CARD_WIDTH / 2, 92, 25, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  drawCentered(ctx, sanitizeShareText(player.fateName, "无名命牌"), CARD_WIDTH / 2, 198, 78, INK, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  if (player.changedFate) drawChangedMark(ctx);

  drawWrappedCentered(ctx, sanitizeShareText(player.fateText, "此命无批，账上有风。"), 94, 276, 562, 35, 30, INK, true);
  drawRule(ctx, 96, 340, CARD_WIDTH - 96);
  drawWrapped(ctx, sanitizeShareText(player.fateDetail, "命背无字，灯下有尘。"), 96, 382, 558, 32, 18, "rgba(36, 22, 15, 0.78)");

  drawTextBox(ctx, 88, 462, 574, 142, "命签小传", sanitizeShareText(player.fateStory, "客官来时，灯花一跳，账上便多一笔。"));
  drawWrappedCentered(ctx, sanitizeShareText(player.fateHook, "今夜有风，铺子里有件物事，像是等过你。"), 100, 650, 550, 32, 22, "rgba(72, 41, 24, 0.82)", false);
  drawWrappedCentered(ctx, sanitizeShareText(player.seasonHint, "夜色正深。"), 100, 710, 550, 28, 18, "rgba(92, 45, 24, 0.68)", false);
  drawResourceBars(ctx, player.resources, 86, 770);

  drawSeal(ctx, "九两九钱", 414, 892, 196, 62, -8, 28);
  await drawQr(ctx, player.storyQrUrl ?? player.storyUrl, CARD_WIDTH - 142, CARD_HEIGHT - 142, 82, "扫读一夜笔记");
  return canvas.toDataURL("image/png", 0.95);
}

async function renderReceiptCard(player: PlayerState): Promise<string> {
  const canvas = createCanvas();
  const ctx = getContext(canvas);
  drawPaper(ctx);
  drawBorder(ctx, true);

  drawCentered(ctx, "罗刹当铺", CARD_WIDTH / 2, 132, 72, INK, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  drawText(ctx, "当票 · 丙午年某月某夜", 72, 190, 26, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  drawRule(ctx, 72, 222, CARD_WIDTH - 72);
  drawText(ctx, `命格：${sanitizeShareText(player.fateName, "无名客")}`, 72, 274, 30, INK, "Noto Serif SC", "serif");
  drawRule(ctx, 72, 308, CARD_WIDTH - 72);

  const storyTitle = sanitizeShareText(player.receiptStoryTitle ?? "夜账小记", "夜账小记");
  const story = sanitizeShareText(player.receiptStory ?? "掌柜收了账，也收了你今夜没说完的那句话。", "掌柜收了账，也收了你今夜没说完的那句话。");
  drawTextBox(ctx, 66, 348, 618, 150, storyTitle, story);

  let y = 540;
  player.trades.slice(0, 4).forEach((trade) => {
    const line = sanitizeShareText(formatTradeLine(trade), "以一念，换一夜");
    drawWrapped(ctx, line, 82, y, 560, 32, 22, INK, 2);
    y += 58;
  });

  if (player.lotEntry) {
    drawText(ctx, "签落", 82, y + 10, 24, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
    drawWrapped(ctx, sanitizeShareText(formatLotEntryLine(player.lotEntry), "签落，命已入账"), 150, y + 10, 500, 30, 21, "rgba(36, 22, 15, 0.82)", 2);
    y += 74;
  }

  drawReceiptLedger(ctx, player.resources, player.originalResources, 76, Math.max(y, 720));
  drawWrapped(ctx, sanitizeShareText(player.farewell ?? "来日再来。", "来日再来。"), 72, 914, 410, 30, 22, "rgba(92, 45, 24, 0.88)", 2);
  drawSeal(ctx, "当", 508, 786, 88, 88, -8, 50);
  await drawQr(ctx, player.storyQrUrl ?? player.storyUrl, CARD_WIDTH - 154, CARD_HEIGHT - 154, 92, "扫读命主故事");
  return canvas.toDataURL("image/png", 0.95);
}

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_context_unavailable");
  return ctx;
}

function drawPaper(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  gradient.addColorStop(0, PAPER_TOP);
  gradient.addColorStop(0.58, PAPER_MID);
  gradient.addColorStop(1, PAPER_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.globalAlpha = 0.075;
  for (let y = 24; y < CARD_HEIGHT; y += 18) {
    ctx.fillStyle = y % 36 === 0 ? "#fff1c8" : "#6f3d22";
    ctx.fillRect(34, y, CARD_WIDTH - 68, 1);
  }
  ctx.globalAlpha = 1;
}

function drawBorder(ctx: CanvasRenderingContext2D, red = false) {
  ctx.strokeStyle = red ? "#b91c1c" : "rgba(94, 51, 24, 0.42)";
  ctx.lineWidth = red ? 3 : 1;
  ctx.strokeRect(14, 14, CARD_WIDTH - 28, CARD_HEIGHT - 28);
  ctx.strokeStyle = "rgba(94, 51, 24, 0.34)";
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, CARD_WIDTH - 56, CARD_HEIGHT - 56);
}

function drawCorners(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(74, 48, 29, 0.76)";
  ctx.lineWidth = 4;
  const size = 50;
  const points = [
    [46, 46, 46 + size, 46, 46, 46 + size],
    [CARD_WIDTH - 46, 46, CARD_WIDTH - 46 - size, 46, CARD_WIDTH - 46, 46 + size],
    [46, CARD_HEIGHT - 46, 46 + size, CARD_HEIGHT - 46, 46, CARD_HEIGHT - 46 - size],
    [CARD_WIDTH - 46, CARD_HEIGHT - 46, CARD_WIDTH - 46 - size, CARD_HEIGHT - 46, CARD_WIDTH - 46, CARD_HEIGHT - 46 - size]
  ];
  points.forEach(([x1, y1, x2, y2, x3, y3]) => {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  });
}

function drawChangedMark(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(CARD_WIDTH - 176, 226);
  ctx.rotate(-8 * Math.PI / 180);
  ctx.strokeStyle = "rgba(185, 28, 28, 0.74)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-62, -24, 124, 48);
  drawCentered(ctx, "此命已改", 0, 9, 22, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  ctx.restore();
}

function drawTextBox(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, title: string, body: string) {
  ctx.strokeStyle = "rgba(185, 28, 28, 0.35)";
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]);
  drawText(ctx, title, x + 28, y + 44, 25, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
  drawWrapped(ctx, body, x + 28, y + 86, width - 56, 30, 21, "rgba(36, 22, 15, 0.84)", 2);
}

function drawResourceBars(ctx: CanvasRenderingContext2D, resources: ResourceMap, x: number, y: number) {
  resourceOrder.forEach((key, index) => {
    const rowY = y + index * 38;
    drawText(ctx, resourceLabels[key], x, rowY, 24, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
    ctx.fillStyle = "rgba(88, 43, 22, 0.25)";
    ctx.fillRect(x + 48, rowY - 11, 440, 12);
    const barWidth = Math.max(18, Math.min(440, resources[key] * 4.4));
    const gradient = ctx.createLinearGradient(x + 48, rowY - 11, x + 48 + barWidth, rowY - 11);
    gradient.addColorStop(0, "#b9342b");
    gradient.addColorStop(1, "#f3c978");
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 48, rowY - 11, barWidth, 12);
    ctx.textAlign = "right";
    ctx.fillStyle = INK;
    ctx.font = font(22, "Noto Serif SC", "serif");
    ctx.fillText(formatMoney(resources[key]), CARD_WIDTH - 84, rowY);
  });
}

function drawReceiptLedger(ctx: CanvasRenderingContext2D, resources: ResourceMap, original: ResourceMap, x: number, y: number) {
  const rowGap = 36;
  resourceOrder.forEach((key, index) => {
    const rowY = y + index * rowGap;
    drawText(ctx, resourceLabels[key], x, rowY, 24, RED, "Kaiti SC", "STKaiti", "KaiTi", "serif");
    ctx.strokeStyle = "rgba(88, 43, 22, 0.24)";
    ctx.beginPath();
    ctx.moveTo(x + 44, rowY - 8);
    ctx.lineTo(CARD_WIDTH - 88, rowY - 8);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillStyle = INK;
    ctx.font = font(22, "Noto Serif SC", "serif");
    ctx.fillText(formatMoney(resources[key]), CARD_WIDTH - 168, rowY);
    drawDelta(ctx, key, resources[key] - original[key], CARD_WIDTH - 84, rowY);
  });
}

function drawDelta(ctx: CanvasRenderingContext2D, key: ResourceKey, value: number, x: number, y: number) {
  if (value === 0) {
    drawText(ctx, "平", x - 12, y, 18, "rgba(232, 197, 118, 0.72)", "Noto Serif SC", "serif");
    return;
  }
  const sign = value > 0 ? "+" : "-";
  const color = value > 0 ? "rgba(232, 197, 118, 0.76)" : "rgba(191, 80, 62, 0.74)";
  drawText(ctx, `${sign}${formatMoney(Math.abs(value))}${resourceLabels[key]}`, x - 70, y, 18, color, "Noto Serif SC", "serif");
}

function drawSeal(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number, rotate: number, size: number) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotate * Math.PI / 180);
  ctx.strokeStyle = "rgba(185, 28, 28, 0.72)";
  ctx.lineWidth = 4;
  ctx.strokeRect(-width / 2, -height / 2, width, height);
  drawCentered(ctx, text, 0, size / 3, size, "#c91f1a", "Kaiti SC", "STKaiti", "KaiTi", "serif");
  ctx.restore();
}

async function drawQr(ctx: CanvasRenderingContext2D, url: string | undefined, x: number, y: number, size: number, caption: string) {
  if (!url) return;
  const qrData = await QRCode.toDataURL(buildAbsoluteUrl(url), {
    width: 220,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#1f140d", light: "#fff7df" }
  });
  ctx.fillStyle = "#fff7df";
  ctx.fillRect(x - 8, y - 8, size + 16, size + 34);
  const image = await loadImage(qrData);
  ctx.drawImage(image, x, y, size, size);
  drawCentered(ctx, caption, x + size / 2, y + size + 20, 13, "rgba(58, 40, 24, 0.86)", "Noto Serif SC", "serif");
}

function drawRule(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number) {
  ctx.strokeStyle = "rgba(88, 43, 22, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
}

function drawWrappedCentered(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, size: number, color: string, bold: boolean) {
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = `${bold ? "700 " : ""}${font(size, "Noto Serif SC", "Kaiti SC", "serif")}`;
  wrapText(ctx, text, maxWidth).slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, x + maxWidth / 2, y + index * lineHeight);
  });
}

function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, size: number, color: string, maxLines = 4) {
  ctx.textAlign = "left";
  ctx.fillStyle = color;
  ctx.font = font(size, "Noto Serif SC", "Kaiti SC", "serif");
  const lines = wrapText(ctx, text, maxWidth);
  lines.slice(0, maxLines).forEach((line, index) => {
    const clipped = index === maxLines - 1 && lines.length > maxLines ? `${line.slice(0, -1)}…` : line;
    ctx.fillText(clipped, x, y + index * lineHeight);
  });
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, ...families: string[]) {
  ctx.textAlign = "left";
  ctx.fillStyle = color;
  ctx.font = font(size, ...families);
  ctx.fillText(text, x, y);
}

function drawCentered(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, ...families: string[]) {
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = font(size, ...families);
  ctx.fillText(text, x, y);
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

function buildAbsoluteUrl(url: string): string {
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
