import { useQuery } from "@tanstack/react-query";
import type { SitePages } from "../../shared/pages";
import { plantingStats } from "../content/site";

/**
 * About / Team / Contact text written as Blogger *Pages*, and the simple formats the site recognises in them.
 * Anything that does not follow a format is still shown, as ordinary text.
 */

export function useSitePages() {
  return useQuery<SitePages>({
    queryKey: ["pages"],
    retry: 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const res = await fetch("/api/pages");
      return res.ok ? ((await res.json()) as SitePages) : {};
    },
  });
}

const IMG = /^\[\[img:(https:\/\/[^\]\s]+)\]\]$/;
/** Picture address from a "[[img:…]]" line; Blogger's small versions are swapped for a sharper size. */
export const imageOf = (line: string) =>
  line.match(IMG)?.[1].replace(/\/s\d{2,4}(-[a-z]+)?\//, "/s600/").replace(/=s\d{2,4}(-[a-z]+)?$/, "=s600");
const pair = (line: string) => line.match(/^([^:]{1,40}):\s*(.*)$/);

// ---- About -------------------------------------------------------------------------------

export interface Stat { value: string; label: string }

/**
 * About page. A line "Some label: 1,234" (a number after the colon) becomes a number box,
 * e.g. "Native tree saplings planted: 5,200". Every other line is a paragraph.
 */
export function parseAbout(lines: string[] = []) {
  const stats: Stat[] = [];
  const paragraphs: string[] = [];
  for (const l of lines) {
    const m = l.match(/^(.{2,60}?)\s*:\s*([\d][\d,.\s]*\+?)$/);
    if (m && !imageOf(l)) stats.push({ label: m[1].trim(), value: m[2].trim() });
    else paragraphs.push(l);
  }
  return { stats, paragraphs };
}

/** Planting numbers: from the Blogger "About" page when it has any, otherwise the built-in ones. */
export function usePlantingStats(): Stat[] {
  const { data } = useSitePages();
  const fromBlogger = parseAbout(data?.about?.lines).stats;
  return fromBlogger.length ? fromBlogger : plantingStats;
}

// ---- Team --------------------------------------------------------------------------------

export interface Member { name: string; role?: string; photo?: string }
export interface Head extends Member { email?: string; phone?: string; details: [string, string][] }

const SECTIONS: [RegExp, "head" | "gardeners" | "web"][] = [
  [/^(horticulture head|head of horticulture|horticulture in-?charge)$/i, "head"],
  [/^(gardeners?|garden staff|horticulture team)$/i, "gardeners"],
  [/^(website team|web team|website|developers?|built by)$/i, "web"],
];

/**
 * Team page, in three parts that start with a heading line:
 *   Horticulture head   then lines like "Name: …", "Designation: …", "Email: …", "Phone: …" and a photo
 *   Gardeners           then one person per line: "Name – what they look after" (the part after – is optional)
 *   Website team        then one person per line: "Name – role"
 * A photo placed just above a person's line belongs to that person.
 */
export function parseTeam(lines: string[] = []) {
  const head: Head = { name: "", details: [] };
  const lists: Record<"gardeners" | "web", Member[]> = { gardeners: [], web: [] };
  const intro: string[] = [];
  let section: "head" | "gardeners" | "web" | null = null;
  let pendingPhoto: string | undefined;
  let found = false;

  for (const l of lines) {
    const title = l.replace(/:$/, "").trim();
    const sec = SECTIONS.find(([re]) => re.test(title))?.[1];
    if (sec) {
      section = sec;
      pendingPhoto = undefined;
      found = true;
      continue;
    }
    const img = imageOf(l);
    if (section === "head") {
      if (img) head.photo ??= img;
      else {
        const m = pair(l);
        const k = m?.[1].trim().toLowerCase();
        if (!m) head.name ||= l;
        else if (k === "name") head.name = m[2];
        else if (k === "designation" || k === "role" || k === "position") head.role = m[2];
        else if (k === "email" || k === "e-mail" || k === "mail") head.email = m[2];
        else if (k === "phone" || k === "mobile" || k === "contact") head.phone = m[2];
        else if (k === "photo") head.photo ??= m[2].startsWith("https://") ? m[2] : undefined;
        else head.details.push([m[1].trim(), m[2]]);
      }
    } else if (section === "gardeners" || section === "web") {
      const list = lists[section];
      if (img) {
        pendingPhoto = img;
        continue;
      }
      const [name, ...rest] = l.split(/\s+[–—-]\s+|\s*:\s+/);
      list.push({ name: name.trim(), role: rest.join(" – ").trim() || undefined, photo: pendingPhoto });
      pendingPhoto = undefined;
    } else if (!img) {
      intro.push(l);
    }
  }
  // A photo left at the end of a list belongs to its last person.
  return { found, intro, head: head.name ? head : null, gardeners: lists.gardeners, web: lists.web };
}

// ---- Contact -----------------------------------------------------------------------------

export interface ContactBox { title: string; lines: string[] }

/**
 * Contact page. A line starting with "Box:" opens a white box titled with the rest of the line;
 * every line after it goes in that box, until the next "Box:" line. Text before the first box is shown above them.
 */
export function parseContact(lines: string[] = []) {
  const intro: string[] = [];
  const boxes: ContactBox[] = [];
  for (const l of lines) {
    if (imageOf(l)) continue;
    const m = l.match(/^box\s*:\s*(.*)$/i);
    if (m) boxes.push({ title: m[1].trim(), lines: [] });
    else if (boxes.length) boxes[boxes.length - 1].lines.push(l);
    else intro.push(l);
  }
  return { intro, boxes };
}
