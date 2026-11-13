import { DEFAULT_BLOG_ID, htmlToText } from "./blogger";

/**
 * Text of the site's About page, written in Blogger under "Pages" (not "Posts").
 * A Blogger page titled "About", "Team" or "Contact" replaces that section of the website's About page.
 */
export interface SitePage {
  /** Cleaned HTML, shown as-is when the page does not use the site's formats. */
  html: string;
  /** The page as plain-text lines; pictures appear as their own line "[[img:https://…]]". */
  lines: string[];
}
export type SitePages = Partial<Record<"about" | "team" | "contact", SitePage>>;

const WANTED: Record<string, keyof SitePages> = {
  about: "about",
  "about us": "about",
  team: "team",
  "our team": "team",
  contact: "contact",
  "contact us": "contact",
};

const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a", "img", "blockquote",
  "table", "thead", "tbody", "tr", "td", "th", "div", "span", "figure", "figcaption", "hr",
]);

/** Plain-text lines of a page, keeping pictures (https only) as "[[img:URL]]" lines in their place. */
export function pageLines(html = ""): string[] {
  const marked = html.replace(/<img\b[^>]*?\bsrc\s*=\s*("([^"]*)"|'([^']*)')[^>]*>/gi, (_m, _q, a: string, b: string) => {
    const src = (a ?? b ?? "").trim();
    return /^https:\/\//i.test(src) ? `\n[[img:${src.replace(/[\[\]\s]/g, "")}]]\n` : "";
  });
  return htmlToText(marked).split("\n").filter(Boolean);
}

/**
 * Keep simple formatting, drop everything that could run code or break the layout:
 * scripts, styles, iframes, forms, event handlers, inline styles and non-http links.
 */
export function sanitizeHtml(html = ""): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (tag, name: string, attrs: string) => {
      const n = name.toLowerCase();
      const closing = tag.startsWith("</");
      if (n === "h1") return closing ? "</h2>" : "<h2>"; // the page already has its own h1
      if (!ALLOWED_TAGS.has(n)) return "";
      if (closing) return `</${n}>`;
      const pick = (attr: string) => {
        const m = attrs.match(new RegExp(`\\b${attr}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
        return m ? (m[2] ?? m[3] ?? "").trim() : "";
      };
      const safeUrl = (u: string) => (/^(https?:|mailto:|tel:|\/|#)/i.test(u) ? u.replace(/"/g, "&quot;") : "");
      if (n === "a") {
        const href = safeUrl(pick("href"));
        return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : "<a>";
      }
      if (n === "img") {
        const src = safeUrl(pick("src"));
        const alt = pick("alt").replace(/"/g, "&quot;").replace(/</g, "&lt;");
        return src && /^https?:/i.test(src) ? `<img src="${src}" alt="${alt}" loading="lazy">` : "";
      }
      return `<${n}>`;
    })
    .trim();
}

export async function fetchPages(apiKey: string, blogId = process.env.BLOGGER_BLOG_ID || DEFAULT_BLOG_ID): Promise<SitePages> {
  const params = new URLSearchParams({ key: apiKey, fetchBodies: "true", status: "live" });
  const res = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/pages?${params}`);
  if (!res.ok) throw new Error(`Blogger API responded with ${res.status}`);
  const data = (await res.json()) as { items?: { title?: string; content?: string }[] };
  const out: SitePages = {};
  for (const p of data.items ?? []) {
    const key = WANTED[(p.title ?? "").trim().toLowerCase()];
    const html = sanitizeHtml(p.content);
    if (key && html && !out[key]) out[key] = { html, lines: pageLines(p.content) };
  }
  return out;
}
