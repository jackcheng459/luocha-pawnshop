import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStoryStorage } from "../_storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const storyId = typeof req.query.storyId === "string" ? req.query.storyId : "";
  if (!storyId) {
    res.status(400).json({ error: "bad_request" });
    return;
  }

  try {
    const story = await getStoryStorage().get(storyId);
    if (!story) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=86400");
    res.status(200).json({ story });
  } catch {
    res.status(500).json({ error: "story_read_failed" });
  }
}
