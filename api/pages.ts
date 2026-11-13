import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchPages } from "../shared/pages";

/** About / Team / Contact text written as Blogger "Pages". */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.BLOGGER_API_KEY;
  if (!apiKey) return res.status(500).json({ message: "BLOGGER_API_KEY is not set for this deployment" });
  try {
    const pages = await fetchPages(apiKey);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(pages);
  } catch (e) {
    console.error(e);
    return res.status(502).json({ message: (e as Error).message || "Failed to fetch pages from Blogger" });
  }
}
