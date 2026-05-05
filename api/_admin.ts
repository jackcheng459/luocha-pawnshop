import type { VercelRequest, VercelResponse } from "@vercel/node";

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    res.status(503).json({ error: "admin_token_not_configured" });
    return false;
  }
  const token =
    req.headers["x-admin-token"] ??
    req.query.token ??
    "";
  if (token !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}
