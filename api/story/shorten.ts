import type { VercelRequest, VercelResponse } from "@vercel/node";

const SHORTENER_ENDPOINT = "https://tinyurl.com/api-create.php";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const { url } = req.body as { url?: string };
  if (!url || !isAllowedStoryUrl(url, req.headers.host)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  try {
    const response = await fetch(`${SHORTENER_ENDPOINT}?url=${encodeURIComponent(url)}`, {
      headers: { "User-Agent": "luocha-pawnshop/1.0" }
    });
    const shortUrl = (await response.text()).trim();
    if (!response.ok || !/^https:\/\/tinyurl\.com\/[A-Za-z0-9]+/.test(shortUrl)) {
      throw new Error("shorten_failed");
    }
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ shortUrl });
  } catch {
    res.status(502).json({ error: "shorten_failed" });
  }
}

function isAllowedStoryUrl(value: string, requestHost?: string): boolean {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (url.pathname.startsWith("/story/") === false) return false;
    const configuredSite = process.env.SITE_URL ?? process.env.VITE_SITE_URL;
    const configuredHost = configuredSite ? new URL(configuredSite).host : "";
    if (configuredHost && url.host === configuredHost) return true;
    if (requestHost && url.host === requestHost) return true;
    return (
      url.hostname === "luocha-pawnshop.vercel.app" ||
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}
