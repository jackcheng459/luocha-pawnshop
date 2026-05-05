import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ContributionRecord, EntryIntent, PawnAmount, ResourceKey } from "../../src/data/types.js";
import { getContributionStorage } from "../_storage.js";

const resourceKeys: ResourceKey[] = ["chi", "chen", "tan", "wang", "hui"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = req.body as Partial<ContributionRecord>;
  if (!isValidContribution(body)) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  const contribution: ContributionRecord = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    entryIntent: body.entryIntent,
    fateName: cleanRequired(body.fateName, 20),
    seasonTerm: cleanOptional(body.seasonTerm, 8),
    resourceFrom: body.resourceFrom,
    resourceTo: body.resourceTo,
    amountFrom: body.amountFrom,
    rawName: cleanRequired(body.rawName, 40),
    rawStory: cleanRequired(body.rawStory, 240),
    renamedItem: cleanOptional(body.renamedItem, 20),
    ledgerLine: cleanOptional(body.ledgerLine, 120),
    status: "pending_review",
    promptVersion: body.promptVersion ?? "v1.5.0"
  };

  try {
    await getContributionStorage().save(contribution);
  } catch {
    res.status(200).json({ ok: false, fallback: true });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true });
}

function isValidContribution(body: Partial<ContributionRecord>): body is ContributionRecord {
  return Boolean(
    (body.entryIntent === "wander" || body.entryIntent === "relief") &&
      body.fateName &&
      body.rawName &&
      body.rawStory &&
      body.resourceFrom &&
      resourceKeys.includes(body.resourceFrom) &&
      typeof body.amountFrom === "number" &&
      [3, 7, 10].includes(body.amountFrom as PawnAmount)
  );
}

function cleanRequired(value: unknown, maxLength: number): string {
  return cleanOptional(value, maxLength) ?? "";
}

function cleanOptional(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}
