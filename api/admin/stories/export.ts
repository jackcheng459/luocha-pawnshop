import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../_admin.js";
import { getStoryStorage } from "../../_storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const stories = await getStoryStorage().exportAll();
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=\"luocha-stories-v1.5.json\"");
  res.status(200).json({
    version: "v1.5.0",
    exportedAt: new Date().toISOString(),
    stories
  });
}
