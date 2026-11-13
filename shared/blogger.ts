export interface Plant {
  id: string;
  title: string;
  url: string;
  published: string;
  labels: string[];
  images: string[]; // full-size (s1600) image URLs, de-duplicated
  text: string; // plain-text body, newline separated
}

interface RawPost {
  id: string;
  title: string;
  url: string;
  published: string;
  content?: string;
  images?: { url: string }[];
  labels?: string[];
}
interface RawResponse {
  items?: RawPost[];
  nextPageToken?: string;
}

export const DEFAULT_BLOG_ID = "4965945072048572230";

const SIZE_RE = /\/(s\d+(-[ch])?|w\d+-h\d+(-[ch])?)\//;
const GOOGLE_RE = /(?:blogger\.googleusercontent\.com|lh\d+\.googleusercontent\.com|\d+\.bp\.blogspot\.com)/i;
const ANCHOR_RE =
  /<a[^>]+href=["']([^"']+\.(?:jpe?g|png|webp|gif|bmp)(?:\?[^"']*)?|https?:\/\/(?:blogger\.googleusercontent\.com|\w+\.bp\.blogspot\.com)\/[^"']+)["']/gi;
const IMG_RE = /<img[^>]+src=["']([^"']+)["']/gi;

/** All image URLs of a post (API images + anchors + <img>), upgraded to s1600 and de-duplicated. */
export function extractImageUrls(html?: string, apiImages?: { url: string }[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (raw?: string) => {
    if (!raw) return;
    let url = raw.trim().replace(/&amp;/g, "&");
    if (!url || url.startsWith("data:") || /spacer\.gif|pixel\.gif/.test(url)) return;
    let key = url;
    if (GOOGLE_RE.test(url)) {
      key = url.replace(SIZE_RE, "/SIZE/");
      url = url.replace(SIZE_RE, "/s1600/");
    }
    if (!seen.has(key)) {
      seen.add(key);
      out.push(url);
    }
  };
  apiImages?.forEach((i) => add(i?.url));
  if (html) {
    for (const m of html.matchAll(ANCHOR_RE)) add(m[1]);
    for (const m of html.matchAll(IMG_RE)) add(m[1]);
  }
  return out;
}

export function htmlToText(html = ""): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 8000); // room for paragraphs in three languages plus the details
}

/** Google's own explanation of a failed request ("API key not valid", "Requests from referer … are blocked", …). */
export async function googleError(res: Response): Promise<string> {
  let reason = "";
  try {
    const body = (await res.json()) as { error?: { message?: string; status?: string } };
    reason = body.error?.message || body.error?.status || "";
  } catch {
    /* not JSON */
  }
  return `Blogger API responded with ${res.status}${reason ? `: ${reason}` : ""}`;
}

export async function fetchPlants(apiKey: string, blogId = process.env.BLOGGER_BLOG_ID || DEFAULT_BLOG_ID): Promise<Plant[]> {
  const plants: Plant[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 5; page++) {
    const params = new URLSearchParams({ key: apiKey, maxResults: "100", fetchImages: "true" });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?${params}`);
    if (!res.ok) throw new Error(await googleError(res));
    const data = (await res.json()) as RawResponse;
    for (const p of data.items ?? []) {
      plants.push({
        id: p.id,
        title: p.title,
        url: p.url,
        published: p.published,
        labels: p.labels ?? [],
        images: extractImageUrls(p.content, p.images),
        text: htmlToText(p.content),
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return plants;
}
