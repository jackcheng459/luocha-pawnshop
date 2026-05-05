import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { PhraseStatus } from "../../src/data/types.js";
import { requireAdmin } from "../_admin.js";
import { getPhraseStorage } from "../_storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const id = typeof req.query.id === "string" ? req.query.id : "";
  const { status } = req.body as { status?: PhraseStatus };
  if (!id || !isPhraseStatus(status)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  const phrase = await getPhraseStorage().update(id, {
    status,
    reviewedAt: Date.now(),
    reviewedBy: "author"
  });
  if (!phrase) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ phrase });
}

function isPhraseStatus(value: unknown): value is PhraseStatus {
  return value === "pending_review" || value === "approved" || value === "rejected" || value === "archived";
}
