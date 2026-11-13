import type { VercelRequest, VercelResponse } from "@vercel/node";
import { identifyPlant } from "../shared/identify.js";

/** POST { image: base64, mime } -> species suggestions from Pl@ntNet. The API key stays on the server. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "POST only" });
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) return res.status(503).json({ message: "PLANTNET_API_KEY is not set" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const suggestions = await identifyPlant(apiKey, String(body?.image ?? ""), String(body?.mime ?? "image/jpeg"));
    return res.status(200).json({ suggestions });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ message: (e as Error).message });
  }
}
