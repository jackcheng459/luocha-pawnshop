import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? process.env.SERVER_PORT ?? process.env.P_SERVER_PORT ?? 3000);
const apiOrigin = (process.env.API_ORIGIN ?? "https://luocha-pawnshop.vercel.app").replace(/\/$/, "");
const useApiProxy = process.env.USE_VERCEL_API_PROXY === "true" || Boolean(process.env.API_ORIGIN);
const distDir = path.join(__dirname, "dist");
const indexFile = path.join(distDir, "index.html");

app.use(express.json({ limit: "1mb" }));

if (useApiProxy) {
  app.use("/api", async (req, res) => {
    await proxyApi(req, res);
  });
} else {
  await mountLocalApi(app);
}

async function proxyApi(req, res) {
  const targetUrl = new URL(req.originalUrl, apiOrigin);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || ["host", "connection", "content-length"].includes(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
      redirect: "manual"
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) return;
      res.setHeader(key, value);
    });
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("api_proxy_failed", error);
    res.status(502).json({ error: "api_proxy_failed" });
  }
}

async function mountLocalApi(expressApp) {
  const handlers = {
    llm: (await import("./api/llm.ts")).default,
    storyCreate: (await import("./api/story/create.ts")).default,
    storyShorten: (await import("./api/story/shorten.ts")).default,
    storyGet: (await import("./api/story/[storyId].ts")).default,
    contributionCapture: (await import("./api/contribution/capture.ts")).default,
    phraseList: (await import("./api/phrase/list.ts")).default,
    phraseGenerate: (await import("./api/phrase/generate.ts")).default,
    phraseRandom: (await import("./api/phrase/random/[type].ts")).default,
    phraseUpdate: (await import("./api/phrase/[id].ts")).default,
    adminStories: (await import("./api/admin/stories/export.ts")).default,
    adminPhrases: (await import("./api/admin/phrases/export.ts")).default,
    adminContributions: (await import("./api/admin/contributions/export.ts")).default
  };

  const route = (handler, params = {}) => (req, res) => {
    const handlerReq = Object.create(req);
    Object.defineProperty(handlerReq, "query", {
      value: { ...req.query, ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value(req)])) },
      configurable: true
    });
    void handler(handlerReq, res);
  };

  expressApp.all("/api/llm", handlers.llm);
  expressApp.all("/api/story/create", handlers.storyCreate);
  expressApp.all("/api/story/shorten", handlers.storyShorten);
  expressApp.all("/api/story/:storyId", route(handlers.storyGet, { storyId: (req) => req.params.storyId }));
  expressApp.all("/api/contribution/capture", handlers.contributionCapture);
  expressApp.all("/api/phrase/list", handlers.phraseList);
  expressApp.all("/api/phrase/generate", handlers.phraseGenerate);
  expressApp.all("/api/phrase/random/:type", route(handlers.phraseRandom, { type: (req) => req.params.type }));
  expressApp.all("/api/phrase/:id", route(handlers.phraseUpdate, { id: (req) => req.params.id }));
  expressApp.all("/api/admin/stories/export", handlers.adminStories);
  expressApp.all("/api/admin/phrases/export", handlers.adminPhrases);
  expressApp.all("/api/admin/contributions/export", handlers.adminContributions);
}

app.use(express.static(distDir, { maxAge: "1h" }));

app.use((_req, res) => {
  if (!fs.existsSync(indexFile)) {
    res.status(500).send("Build output not found. Run npm run build first.");
    return;
  }
  res.sendFile(indexFile);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Luocha Pawnshop listening on 0.0.0.0:${port}`);
  console.log(useApiProxy ? `API proxy origin: ${apiOrigin}` : "API mode: local Wispbyte server");
});
