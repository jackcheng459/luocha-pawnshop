import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { PhraseStatus, PhraseType } from "../../src/data/types.js";
import { requireAdmin } from "../_admin.js";
import { getPhraseStorage } from "../_storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const status = parseStatus(req.query.status);
  const type = typeof req.query.type === "string" ? (req.query.type as PhraseType) : undefined;
  const phrases = await getPhraseStorage().list({ status, type });
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ phrases });
}

function parseStatus(value: unknown): PhraseStatus | "all" {
  if (value === "approved" || value === "rejected" || value === "archived") return value;
  if (value === "all") return "all";
  return "pending_review";
}
