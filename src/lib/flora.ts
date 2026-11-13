import type { Plant } from "./plants";

export const pad = (n: number) => String(n).padStart(2, "0");

const SYMBOL_START = /^[^\p{L}\p{N}'"(]+/u; // emoji / bullets at the start of a line
const PAIR = /^([^:]{2,30}):\s*(\S.*)$/; // "Family: Malvaceae"

export interface ProfileSection {
  heading?: string;
  pairs: [string, string][];
  lines: string[];
}

/**
 * A Blogger post as a structured profile: scientific name, then sections.
 * Lines that start with an emoji ("🌿 Quick Profile") become headings, "Key: value" lines become pairs.
 */
export function plantProfile(p: Plant): { scientific?: string; sections: ProfileSection[] } {
  const title = p.title.trim().toLowerCase();
  const rows = p.text
    .split("\n")
    .map((raw) => ({ raw: raw.trim(), text: raw.replace(SYMBOL_START, "").trim() }))
    .filter((r) => r.text && r.text.toLowerCase() !== title);

  let scientific: string | undefined;
  const first = rows[0];
  if (first && !SYMBOL_START.test(first.raw) && !PAIR.test(first.text) && first.text.length >= 8 && first.text.length <= 100) {
    scientific = first.text;
    rows.shift();
  }

  const sections: ProfileSection[] = [];
  let cur: ProfileSection = { pairs: [], lines: [] };
  const flush = () => {
    if (cur.heading || cur.pairs.length || cur.lines.length) sections.push(cur);
  };

  for (const r of rows) {
    const pair = r.text.match(PAIR);
    const symbolLed = SYMBOL_START.test(r.raw);
    if (symbolLed && !pair) {
      flush();
      cur = { heading: r.text, pairs: [], lines: [] };
    } else if (pair) {
      cur.pairs.push([pair[1].trim(), pair[2].trim()]);
    } else {
      cur.lines.push(r.text);
    }
  }
  flush();
  return { scientific, sections };
}

const shorten = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/** Up to `max` short facts from a post: one descriptive sentence, then "Family: Malvaceae"-style lines. */
export function postFacts(p: Plant, max = 3): string[] {
  const { sections } = plantProfile(p);
  const lines = sections.flatMap((s) => s.lines);
  const pairs = sections.flatMap((s) => s.pairs.map(([k, v]) => `${k}: ${v}`));
  const sentence = lines.find((l) => l.length >= 45 && /\s/.test(l));
  return [...(sentence ? [sentence] : []), ...pairs].slice(0, max).map((f) => shorten(f, 110));
}

/** Value of the first "Key: value" line whose key matches. */
export function postField(p: Plant | undefined, key: RegExp): string | undefined {
  if (!p) return undefined;
  for (const s of plantProfile(p).sections) for (const [k, v] of s.pairs) if (key.test(k)) return v;
  return undefined;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * Months named in a text such as "March–May", "Feb to Apr", "all year" or "Oct, Nov".
 * Ranges are filled in (wrapping past December). Returns month numbers 0–11.
 */
export function monthsIn(text?: string): number[] {
  if (!text) return [];
  const t = text.toLowerCase();
  if (/all\s*(the\s*)?year|year[\s-]*round|throughout the year/.test(t)) return MONTHS.map((_, i) => i);
  const found: { m: number; at: number }[] = [];
  const re = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/g;
  for (let m = re.exec(t); m; m = re.exec(t)) found.push({ m: MONTHS.indexOf(m[1]), at: m.index });
  const out = new Set<number>();
  for (let i = 0; i < found.length; i++) {
    const a = found[i];
    const b = found[i + 1];
    const between = b ? t.slice(a.at, b.at) : "";
    if (b && /[–—-]|\bto\b|\btill\b|\buntil\b/.test(between)) {
      for (let k = a.m; ; k = (k + 1) % 12) {
        out.add(k);
        if (k === b.m) break;
      }
      i++;
    } else out.add(a.m);
  }
  return [...out].sort((x, y) => x - y);
}

export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Small seeded random generator so "today's picks" stay the same all day for every visitor.
export function seededRandom(now = new Date()) {
  let a = (now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
