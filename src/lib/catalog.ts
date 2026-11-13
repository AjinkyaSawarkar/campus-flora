import { useMemo } from "react";
import { inventory, type CollectionId, type Species } from "../content/inventory";
import { categories } from "../content/site";
import { labelHasTag, usePlants, type Plant } from "./plants";
import { monthsIn, plantProfile, postField, seededRandom } from "./flora";
import { drivePhoto, useContributions, type Contribution } from "./contributions";
import { onCampus } from "./geo";

/** One plant on the site: a species from the inventory (with its Blogger post, if any) or a post on its own. */
export interface Entry {
  slug: string;
  /** Permanent QR tag ID ("P016"): built in for listed plants, from a "Tag ID:" line for plants added in Blogger. */
  tag?: string;
  /** Why a "Tag ID:" line in this plant's post was ignored (shown next to its QR code). */
  tagProblem?: string;
  name: string;
  scientific?: string;
  aka: string[];
  collections: CollectionId[];
  group?: string;
  varieties?: string;
  /** The Blogger post with the most text, used for the profile. */
  post?: Plant;
  /** Photos from every matching post. */
  images: string[];
  /** Blogger labels worth showing as filters. */
  features: string[];
  location?: string;
  flowering?: string;
  floweringMonths: number[];
  /** Date of the newest matching post. */
  published?: string;
  inInventory: boolean;
  /** Scientific names this plant goes by ("genus species", lower case), for matching photo suggestions. */
  sciKeys: string[];
  /** Photographer of each community photo: image address -> name. */
  credits: Record<string, string>;
  /** Places on campus where approved photos of this plant were taken. */
  sightings: { lat: number; lng: number; by: string; src: string }[];
}

/** How a Blogger post was connected to a plant on the built-in list. */
export type MatchedBy = "title" | "scientific name on line 1" | "scientific name in the text";

/** Problems found while building the catalogue, for the content check page. */
export interface CatalogReport {
  /** Every post: which plant it went to, how, and what is missing from its layout. */
  posts: { post: Plant; plant: string; slug: string; matchedBy?: MatchedBy; problems: string[] }[];
  /** Plants with more than one post: only `used` supplies the text. */
  duplicates: { name: string; slug: string; used: Plant; others: Plant[] }[];
  /** Posts titled with a name that several plants share (e.g. "Jasmine"). */
  ambiguous: { post: Plant; title: string; candidates: string[]; endedUpAs: string; slug: string }[];
  /** Plants that exist only as Blogger posts (not on the built-in list). */
  newPlants: { name: string; slug: string; problems: string[] }[];
  /** Approved photos whose plant name matches no plant. */
  unmatchedPhotos: Contribution[];
}

const LANGUAGE_HEADINGS: [string, RegExp][] = [
  ["English", /^english$/i],
  ["తెలుగు (Telugu)", /^(తెలుగు|telugu)$/i],
  ["हिन्दी (Hindi)", /^(हिन्दी|हिंदी|hindi)$/i],
];

/**
 * Whether a line looks like a scientific name: "Genus species", optionally "×" for a hybrid and an author
 * ("Azadirachta indica A. Juss.", "Bauhinia × blakeana"), and not an ordinary sentence ("Yellow flowers along the road.").
 */
const EVERYDAY_WORDS = new Set(
  ("a an the and or of in on at near by for with from to is are was has have this that our its it very " +
    "tree trees plant plants shrub flower flowers leaf leaves fruit big small tall yellow red white pink blue green " +
    "grows found planted along beautiful campus road lake garden").split(" "),
);

export function looksScientific(s?: string): boolean {
  if (!s) return false;
  const t = s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const words = t.split(" ");
  return (
    /^[A-Z][a-z]+ (× ?)?[a-z][a-z-]+\b/.test(t) &&
    words.length <= 5 &&
    // Abbreviations ("A." in "A. Juss.") are authors' initials, not English words.
    !words.some((w) => !w.endsWith(".") && EVERYDAY_WORDS.has(w.toLowerCase().replace(/,/g, ""))) &&
    !/[.!?]$/.test(t.replace(/\b[A-Z][a-z]{0,3}\.$/, ""))
  );
}

/** What a post is missing compared with the standard layout. */
function layoutProblems(p: Plant): string[] {
  const out: string[] = [];
  const { scientific, sections } = plantProfile(p);
  if (!looksScientific(scientific)) out.push("The first line is not a scientific name.");
  const headings = sections.map((s) => (s.heading ?? "").trim());
  const missing = LANGUAGE_HEADINGS.filter(([, re]) => !headings.some((h) => re.test(h))).map(([label]) => label);
  if (missing.length === 3) out.push("No language paragraphs (🌿 English, 🌿 తెలుగు, 🌿 हिन्दी).");
  else if (missing.length) out.push(`Missing paragraph: ${missing.join(", ")}.`);
  const flowering = postField(p, /^(flowering( season)?|blooming)$/i);
  if (flowering && !monthsIn(flowering).length) out.push(`"Flowering: ${flowering}" has no month names the site can read.`);
  if (!p.images.length) out.push("No photos in the post.");
  return out;
}

/**
 * Plants the horticulture team wants to show first on the hero cards.
 * Write exact names, e.g. ["Neem", "Banyan"]. Leave empty to let the site pick a different
 * "plant of the day" from several collections every day.
 */
export const PINNED_FEATURED: string[] = [];

// Blogger labels that every post carries; they are useless as filters.
const HIDDEN = new Set(["campus", "flora", "iitt", "tirupati", "iit tirupati", "indian institute of technology tirupati"]);

export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** "Azadirachta indica A. Juss." -> "azadirachta indica" */
const sciKey = (s?: string) => (s ? norm(s).split(" ").slice(0, 2).join(" ") : "");
/** "Neem tree" -> "neem" */
const nameKey = (s: string) => norm(s).replace(/\b(tree|trees|plant|plants|the)\b/g, " ").replace(/\s+/g, " ").trim();

export const slugify = (s: string) => norm(s).replace(/\s+/g, "-") || "plant";

const categoryIdsFromLabels = (labels: string[]): CollectionId[] =>
  categories.filter((c) => labels.some((l) => c.tags.some((t) => labelHasTag(l, t)))).map((c) => c.id);

function buildCatalog(posts: Plant[]): { entries: Entry[]; report: Omit<CatalogReport, "unmatchedPhotos"> } {
  // Lookup tables: a name used by two species (e.g. "Jasmine") identifies neither.
  const byName = new Map<string, Species | null>();
  const bySci = new Map<string, Species>();
  for (const sp of inventory) {
    for (const n of [sp.name, ...(sp.aka ?? [])]) {
      const k = nameKey(n);
      if (!k) continue;
      byName.set(k, byName.has(k) && byName.get(k) !== sp ? null : sp);
    }
    for (const s of [sp.scientific, sp.listedAs]) if (s) bySci.set(sciKey(s), sp);
  }

  // Plants sharing each ambiguous name, for the content check page.
  const sharedBy = new Map<string, string[]>();
  for (const sp of inventory)
    for (const n of [sp.name, ...(sp.aka ?? [])]) {
      const k = nameKey(n);
      if (byName.get(k) === null && !sharedBy.get(k)?.includes(sp.name)) sharedBy.set(k, [...(sharedBy.get(k) ?? []), sp.name]);
    }

  const matchPost = (p: Plant): { sp: Species; by: MatchedBy } | undefined => {
    const byTitle = byName.get(nameKey(p.title));
    if (byTitle) return { sp: byTitle, by: "title" };
    const sci = bySci.get(sciKey(plantProfile(p).scientific));
    if (sci) return { sp: sci, by: "scientific name on line 1" };
    // A scientific name in the title or the first lines: the one written first wins.
    const hay = ` ${norm(p.title + " " + p.text.split("\n").slice(0, 6).join(" "))} `;
    let best: { at: number; sp: Species } | undefined;
    for (const [k, sp] of bySci) {
      if (!k.includes(" ")) continue;
      const at = hay.indexOf(` ${k} `);
      if (at >= 0 && (!best || at < best.at)) best = { at, sp };
    }
    return best && { sp: best.sp, by: "scientific name in the text" };
  };

  const postsOf = new Map<Species, Plant[]>();
  const loose: Plant[] = [];
  const how = new Map<Plant, MatchedBy>();
  for (const p of posts) {
    const m = matchPost(p);
    if (m) {
      postsOf.set(m.sp, [...(postsOf.get(m.sp) ?? []), p]);
      how.set(p, m.by);
    } else loose.push(p);
  }

  const used = new Set<string>();
  const uniqueSlug = (name: string) => {
    const base = slugify(name);
    let s = base;
    for (let i = 2; used.has(s); i++) s = `${base}-${i}`;
    used.add(s);
    return s;
  };

  const longest = (ps: Plant[]) => [...ps].sort((a, b) => b.text.length - a.text.length)[0];
  const fromPosts = (ps: Plant[]) => {
    const post = longest(ps);
    // Photos taken on campus first; the Wikimedia Commons stand-in photo last.
    const images = [...new Set(ps.flatMap((p) => p.images))].sort(
      (a, b) => Number(a.includes("wikimedia.org")) - Number(b.includes("wikimedia.org")),
    );
    const features = [...new Set(ps.flatMap((p) => p.labels))].filter((l) => {
      const x = l.toLowerCase();
      return !HIDDEN.has(x) && categoryIdsFromLabels([l]).length === 0;
    });
    const published = ps.map((p) => p.published).sort().slice(-1)[0];
    const flowering = postField(post, /flower|bloom/i);
    return {
      post,
      images,
      features,
      published,
      location: postField(post, /location|where|found|spot/i),
      flowering,
      floweringMonths: monthsIn(flowering),
    };
  };

  const entries: Entry[] = inventory.map((sp) => {
    const ps = postsOf.get(sp) ?? [];
    const extra = ps.length ? fromPosts(ps) : { images: [], features: [], floweringMonths: [] };
    return {
      slug: uniqueSlug(sp.name),
      tag: sp.tag,
      name: sp.name,
      scientific: sp.scientific,
      aka: sp.aka ?? [],
      collections: sp.in,
      group: sp.group,
      varieties: sp.varieties,
      inInventory: true,
      sciKeys: [sp.scientific, sp.listedAs].map(sciKey).filter(Boolean),
      credits: {},
      sightings: [],
      ...extra,
    };
  });

  // Posts about plants that are not in the inventory still get a page (and may carry their own tag ID).
  const usedTags = new Set(inventory.map((sp) => sp.tag));
  const looseByTitle = new Map<string, Plant[]>();
  for (const p of loose) looseByTitle.set(nameKey(p.title), [...(looseByTitle.get(nameKey(p.title)) ?? []), p]);
  for (const ps of looseByTitle.values()) {
    const extra = fromPosts(ps);
    const sci = plantProfile(extra.post).scientific;
    const written = (postField(extra.post, /^(tag|qr)[\s-]*(id|no\.?|number)$/i) ?? "").trim().toUpperCase().replace(/\s+/g, "");
    let tag: string | undefined;
    let tagProblem: string | undefined;
    if (written && !/^P\d{3,}$/.test(written)) tagProblem = `"Tag ID: ${written}" is not in the form P146.`;
    else if (written && usedTags.has(written)) tagProblem = `Tag ID ${written} is already used by another plant.`;
    else if (written) {
      tag = written;
      usedTags.add(written);
    }
    entries.push({
      slug: uniqueSlug(extra.post.title),
      tag,
      tagProblem,
      name: extra.post.title.trim(),
      scientific: looksScientific(sci) ? sci : undefined,
      aka: [],
      collections: categoryIdsFromLabels(ps.flatMap((p) => p.labels)),
      inInventory: false,
      sciKeys: [sciKey(sci)].filter((k) => k.includes(" ")),
      credits: {},
      sightings: [],
      ...extra,
    });
  }

  // ---- report for the content check page ----
  const groups: { entry: Entry; ps: Plant[] }[] = [];
  for (const sp of inventory) {
    const ps = postsOf.get(sp);
    if (ps) groups.push({ entry: entries.find((e) => e.inInventory && e.name === sp.name)!, ps });
  }
  for (const ps of looseByTitle.values()) groups.push({ entry: entries.find((e) => e.post === longest(ps))!, ps });

  const report: Omit<CatalogReport, "unmatchedPhotos"> = {
    posts: groups.flatMap(({ entry, ps }) =>
      ps.map((post) => ({ post, plant: entry.name, slug: entry.slug, matchedBy: how.get(post), problems: layoutProblems(post) })),
    ),
    duplicates: groups
      .filter((g) => g.ps.length > 1)
      .map(({ entry, ps }) => ({ name: entry.name, slug: entry.slug, used: longest(ps), others: ps.filter((p) => p !== longest(ps)) })),
    ambiguous: groups.flatMap(({ entry, ps }) =>
      ps
        .filter((p) => sharedBy.has(nameKey(p.title)))
        .map((post) => ({ post, title: post.title, candidates: sharedBy.get(nameKey(post.title))!, endedUpAs: entry.name, slug: entry.slug })),
    ),
    newPlants: entries
      .filter((e) => !e.inInventory)
      .map((e) => ({
        name: e.name,
        slug: e.slug,
        problems: [
          ...(e.collections.length ? [] : ["No collection label, so it only appears under All plants and in search."]),
          ...(e.tag ? [] : [e.tagProblem ?? "No “Tag ID:” line, so its QR code would break if the post is renamed."]),
          ...(e.scientific ? [] : ["No scientific name on the first line."]),
        ],
      })),
  };
  return { entries: entries.sort((a, b) => a.name.localeCompare(b.name)), report };
}

/** True when every word of the query appears in the plant's names, scientific name or features. */
export function matches(e: Entry, q: string): boolean {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return true;
  const hay = ` ${norm([e.name, e.scientific ?? "", ...e.aka, ...e.features].join(" "))}`;
  return words.every((w) => hay.includes(` ${w}`));
}

/** Add approved community photos: after photos from Blogger posts, before the Wikimedia stand-in photo. */
function withContributions(entries: Entry[], photos: Contribution[]): { entries: Entry[]; unmatched: Contribution[] } {
  if (!photos.length) return { entries, unmatched: [] };
  const byName = new Map<string, Entry | null>();
  for (const e of entries)
    for (const n of [e.name, ...e.aka]) {
      const k = nameKey(n);
      if (k) byName.set(k, byName.has(k) && byName.get(k) !== e ? null : e);
    }
  const extra = new Map<Entry, Contribution[]>();
  const unmatched: Contribution[] = [];
  for (const p of photos) {
    const e = byName.get(nameKey(p.plant));
    if (e) extra.set(e, [...(extra.get(e) ?? []), p]);
    else unmatched.push(p);
  }
  const updated = entries.map((e) => {
    const mine = extra.get(e);
    if (!mine) return e;
    mine.sort((a, b) => b.date.localeCompare(a.date));
    const community = mine.map((p) => drivePhoto(p.id));
    const isStandIn = (u: string) => u.includes("wikimedia.org");
    return {
      ...e,
      images: [...e.images.filter((u) => !isStandIn(u)), ...community, ...e.images.filter(isStandIn)],
      credits: Object.fromEntries(mine.map((p) => [drivePhoto(p.id), p.by])),
      sightings: mine
        .filter((p) => p.lat != null && p.lng != null && onCampus(p.lat, p.lng))
        .map((p) => ({ lat: p.lat!, lng: p.lng!, by: p.by, src: drivePhoto(p.id) })),
      published: e.published ?? mine[0].date,
    };
  });
  return { entries: updated, unmatched };
}

export function useCatalog() {
  const { data, isLoading, error, refetch } = usePlants();
  const { data: photos } = useContributions();
  const base = useMemo(() => buildCatalog(data ?? []), [data]);
  const merged = useMemo(() => withContributions(base.entries, photos ?? []), [base, photos]);
  const entries = merged.entries;
  const report: CatalogReport = useMemo(() => ({ ...base.report, unmatchedPhotos: merged.unmatched }), [base, merged]);
  const bySlug = useMemo(() => new Map(entries.map((e) => [e.slug, e])), [entries]);
  return { entries, bySlug, report, isLoading, error, refetch };
}

/** The tag ID to give the next new plant: one more than the highest in use (P146, P147, …). */
export function nextTag(entries: Entry[]): string {
  const max = Math.max(0, ...entries.map((e) => Number(e.tag?.slice(1)) || 0));
  return `P${String(max + 1).padStart(3, "0")}`;
}

export const findByTag = (entries: Entry[], tag: string) => {
  const t = tag.trim().toUpperCase();
  return entries.find((e) => e.tag === t);
};

export const inCollection = (entries: Entry[], id: string) => entries.filter((e) => e.collections.includes(id as CollectionId));
export const withPhotos = (entries: Entry[]) => entries.filter((e) => e.images.length > 0);
export const newestFirst = (a: Entry, b: Entry) => (Date.parse(b.published ?? "") || 0) - (Date.parse(a.published ?? "") || 0);

/** Featured plants for the hero: pinned names first, then one plant from each of several collections, chosen by date. */
export function featured(entries: Entry[], count = 4, now = new Date()): Entry[] {
  const pool = withPhotos(entries);
  const out: Entry[] = [];
  for (const name of PINNED_FEATURED) {
    const hit = pool.find((e) => norm(e.name) === norm(name));
    if (hit && !out.includes(hit)) out.push(hit);
  }
  const rand = seededRandom(now);
  const shuffled = [...categories].sort(() => rand() - 0.5);
  for (const c of shuffled) {
    if (out.length >= count) break;
    const inCat = pool.filter((e) => !out.includes(e) && e.collections[0] === c.id);
    if (!inCat.length) continue;
    const rich = inCat.filter((e) => e.images.length > 1);
    const list = rich.length ? rich : inCat;
    out.push(list[Math.floor(rand() * list.length)]);
  }
  for (const e of pool) {
    if (out.length >= count) break;
    if (!out.includes(e)) out.push(e);
  }
  return out.slice(0, count);
}

export const floweringIn = (entries: Entry[], month: number) => entries.filter((e) => e.floweringMonths.includes(month));
