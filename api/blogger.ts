import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchPlants } from "../shared/blogger";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.BLOGGER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      message: "BLOGGER_API_KEY is not set for this deployment. Add it in Vercel (Settings → Environment Variables, Production) and redeploy.",
    });
  }
  try {
    const plants = await fetchPlants(apiKey);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(plants);
  } catch (e) {
    console.error(e);
    // Google's reason never contains the key itself, so it is safe to show.
    return res.status(502).json({ message: (e as Error).message || "Failed to fetch posts from Blogger" });
  }
}
