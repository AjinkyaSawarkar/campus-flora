import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fetchPlants, type Plant } from "./shared/blogger";
import { fetchPages, type SitePages } from "./shared/pages";
import { identifyPlant } from "./shared/identify";

// Serves /api/* during `npm run dev` using the same code as the Vercel functions.
function devApi(env: Record<string, string>): Plugin {
  let plants: { at: number; data: Plant[] } | null = null;
  let pages: { at: number; data: SitePages } | null = null;
  const fresh = (c: { at: number } | null) => !!c && Date.now() - c.at < 5 * 60_000;
  return {
    name: "dev-api",
    configureServer(server) {
      const json = (res: import("http").ServerResponse, status: number, body: unknown) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(body));
      };

      server.middlewares.use("/api/blogger", async (_req, res) => {
        if (!env.BLOGGER_API_KEY) return json(res, 500, { message: "BLOGGER_API_KEY is not set in .env" });
        try {
          if (!fresh(plants)) plants = { at: Date.now(), data: await fetchPlants(env.BLOGGER_API_KEY) };
          json(res, 200, plants!.data);
        } catch (e) {
          json(res, 502, { message: (e as Error).message });
        }
      });

      server.middlewares.use("/api/pages", async (_req, res) => {
        if (!env.BLOGGER_API_KEY) return json(res, 500, { message: "BLOGGER_API_KEY is not set in .env" });
        try {
          if (!fresh(pages)) pages = { at: Date.now(), data: await fetchPages(env.BLOGGER_API_KEY) };
          json(res, 200, pages!.data);
        } catch (e) {
          json(res, 502, { message: (e as Error).message });
        }
      });

      server.middlewares.use("/api/identify", (req, res) => {
        if (req.method !== "POST") return json(res, 405, { message: "POST only" });
        if (!env.PLANTNET_API_KEY) return json(res, 503, { message: "PLANTNET_API_KEY is not set in .env" });
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            json(res, 200, { suggestions: await identifyPlant(env.PLANTNET_API_KEY, String(body.image ?? ""), String(body.mime ?? "image/jpeg")) });
          } catch (e) {
            json(res, 502, { message: (e as Error).message });
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [react(), devApi(env)] };
});
