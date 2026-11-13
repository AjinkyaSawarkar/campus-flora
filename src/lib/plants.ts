import { useQuery } from "@tanstack/react-query";
import type { Plant } from "../../shared/blogger";
import type { Category } from "../content/site";

export type { Plant };


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(raw: any): Plant {
  const html = typeof raw?.content === "string" ? raw.content : "";
  const images: string[] = Array.isArray(raw?.images)
    ? raw.images.filter((x: unknown) => typeof x === "string")
    : raw?.image ? [String(raw.image)] : [];
  return {
    id: String(raw?.id ?? Math.random()),
    title: String(raw?.title ?? "Untitled"),
    url: String(raw?.url ?? "#"),
    published: String(raw?.published ?? ""),
    labels: Array.isArray(raw?.labels) ? raw.labels.map(String) : [],
    images,
    text: typeof raw?.text === "string" ? raw.text : html.replace(/<[^>]+>/g, "\n"),
  };
}

export function usePlants() {
  return useQuery<Plant[]>({
    queryKey: ["plants"],
    queryFn: async () => {
      const res = await fetch("/api/blogger");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(
          body.message ||
            `The plant API answered ${res.status} without an explanation, which usually means the server function crashed (Vercel → Logs shows why).`,
        );
      }
      const data: unknown = await res.json();
      return Array.isArray(data) ? data.map(normalize) : [];
    },
  });
}

const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True if a Blogger label contains the tag as a whole word (plural allowed), case-insensitive. */
export function labelHasTag(label: string, tag: string): boolean {
  return new RegExp(`\\b${escapeRe(tag)}(?:s|es)?\\b`, "i").test(label);
}

export function inCategory(plants: Plant[], cat: Category): Plant[] {
  return plants.filter((p) => p.labels.some((l) => cat.tags.some((t) => labelHasTag(l, t))));
}

/** Blogger-hosted images accept a size segment: use small ones for tiles, large ones for the viewer. */
// Wikimedia only serves thumbnails in these widths.
const WIKIMEDIA_WIDTHS = [120, 250, 330, 500, 960, 1280, 1920];

/** The photo at roughly `px` wide: Blogger photos are resized by URL, Wikimedia Commons thumbnails too. */
export const sized = (url: string, px: number) => {
  // Commons thumbnails: upload.wikimedia.org/…/thumb/…/1280px-Name.jpg or thumb.wikimedia.org/…/1280px-Name.jpg?utm_…
  if (/(upload|thumb)\.wikimedia\.org\/.+\/thumb\//.test(url)) {
    const w = WIKIMEDIA_WIDTHS.find((x) => x >= px) ?? 1920;
    return url.replace(/\/\d+px-([^/?]+)(\?.*)?$/, `/${w}px-$1$2`);
  }
  // Community uploads stored in Google Drive: …/d/<file id>=w1600
  if (/googleusercontent\.com\/d\/[\w-]+=w\d+$/.test(url)) return url.replace(/=w\d+$/, `=w${px}`);
  return url.replace("/s1600/", `/s${px}/`);
};

/** First few non-empty lines of a post, shown as short facts under the picture. */
export function factLines(p: Plant, max = 3): string[] {
  return p.text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && l.toLowerCase() !== p.title.trim().toLowerCase())
    .slice(0, max)
    .map((l) => (l.length > 120 ? l.slice(0, 117) + "…" : l));
}
