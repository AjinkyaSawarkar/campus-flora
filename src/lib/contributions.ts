import { useQuery } from "@tanstack/react-query";
import type { Suggestion } from "../../shared/identify";
import { CONTRIBUTIONS_URL } from "../content/site";
import type { Entry } from "./catalog";

export type { Suggestion };

/** One approved photo from the contributions sheet. */
export interface Contribution {
  plant: string;
  by: string;
  id: string; // Google Drive file id
  date: string;
  lat: number | null;
  lng: number | null;
}

/** Address of an uploaded photo. `sized()` in plants.ts swaps the width. */
export const drivePhoto = (id: string, px = 1600) => `https://lh3.googleusercontent.com/d/${id}=w${px}`;

export const uploadsEnabled = () => /^https:\/\//.test(CONTRIBUTIONS_URL);

/** Approved photos. Returns an empty list when uploads are not set up or the sheet cannot be reached. */
export function useContributions() {
  return useQuery<Contribution[]>({
    queryKey: ["contributions"],
    enabled: uploadsEnabled(),
    staleTime: 2 * 60_000,
    retry: 1,
    queryFn: async () => {
      const res = await fetch(CONTRIBUTIONS_URL);
      if (!res.ok) throw new Error(`The contributions sheet answered ${res.status}.`);
      const data = (await res.json()) as { photos?: Contribution[] };
      return (data.photos ?? []).filter((p) => p && typeof p.id === "string" && /^[\w-]{10,}$/.test(p.id) && typeof p.plant === "string");
    },
  });
}

// ---- preparing a photo -----------------------------------------------------------------

export interface PreparedPhoto {
  base64: string; // JPEG, without the "data:" prefix
  previewUrl: string;
}

/**
 * Shrink a phone photo to at most `max` pixels on its long side and re-encode it as JPEG.
 * Redrawing the picture also removes its hidden data (camera model, GPS position).
 */
export async function preparePhoto(file: File, max = 1600, quality = 0.85): Promise<PreparedPhoto> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This file could not be read as a photo."));
      img.src = URL.createObjectURL(file);
    });
  }
  const scale = Math.min(1, max / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
  if (!blob) throw new Error("This photo could not be prepared.");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("This photo could not be prepared."));
    fr.readAsDataURL(blob);
  });
  return { base64: dataUrl.slice(dataUrl.indexOf(",") + 1), previewUrl: URL.createObjectURL(blob) };
}

// ---- name suggestions ------------------------------------------------------------------

/** Ask the server (Pl@ntNet) what the photo shows. Empty list when the service is off or unsure. */
export async function identify(base64: string): Promise<Suggestion[]> {
  try {
    const res = await fetch("/api/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, mime: "image/jpeg" }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { suggestions?: Suggestion[] };
    return data.suggestions ?? [];
  } catch {
    return [];
  }
}

// Pl@ntNet uses the newest botanical names; our list keeps some older ones. Newer name -> name on our list.
const SYNONYMS: Record<string, string> = {
  "neolamarckia cadamba": "anthocephalus cadamba",
  "magnolia champaca": "michelia champaca",
  "millettia pinnata": "pongamia pinnata",
  "chrysalidocarpus lutescens": "dypsis lutescens",
  "melaleuca citrina": "callistemon lanceolatus",
  "sphagneticola trilobata": "wedelia trilobata",
  "dracaena trifasciata": "sansevieria trifasciata",
  "cenchrus alopecuroides": "pennisetum alopecuroides",
  "albizia saman": "samanea saman",
  "kalanchoe pinnata": "bryophyllum pinnatum",
  "breynia androgyna": "sauropus androgynus",
  "plectranthus scutellarioides": "coleus scutellarioides",
  "volkameria inermis": "clerodendrum inerme",
  "tecomaria capensis": "tecoma capensis",
  "quisqualis indica": "combretum indicum",
  "caesalpinia sappan": "biancaea sappan",
  "terminalia tomentosa": "terminalia elliptica",
  "ocimum sanctum": "ocimum tenuiflorum",
  "peltophorum ferrugineum": "peltophorum pterocarpum",
  "tabebuia impetiginosa": "handroanthus impetiginosus",
  "adhatoda vasica": "justicia adhatoda",
  "emblica officinalis": "phyllanthus emblica",
  "senna fistula": "cassia fistula",
  "cassia siamea": "senna siamea",
  "tabernaemontana coronaria": "tabernaemontana divaricata",
  "russelia juncea": "russelia equisetiformis",
  "citrus aurantifolia": "citrus aurantiifolia",
};

const key2 = (s: string) =>
  s.toLowerCase().replace(/[×x]\s+/g, "").replace(/[^a-z ]/g, " ").trim().split(/\s+/).slice(0, 2).join(" ");

export interface Match {
  suggestion: Suggestion;
  /** The plant on our list, when the suggested species (or at least its genus) is on it. */
  entry?: Entry;
  exact: boolean;
}

/** Line up Pl@ntNet's suggestions with the plants on our list: same species first, same genus as a fallback. */
export function matchSuggestions(suggestions: Suggestion[], entries: Entry[]): Match[] {
  const bySpecies = new Map<string, Entry>();
  const byGenus = new Map<string, Entry[]>();
  for (const e of entries) {
    for (const k of e.sciKeys) {
      if (!bySpecies.has(k)) bySpecies.set(k, e);
      const g = k.split(" ")[0];
      if (!byGenus.get(g)?.includes(e)) byGenus.set(g, [...(byGenus.get(g) ?? []), e]);
    }
  }
  const out: Match[] = [];
  const used = new Set<Entry>();
  for (const s of suggestions) {
    const k = key2(s.scientific);
    const exact = bySpecies.get(k) ?? bySpecies.get(SYNONYMS[k] ?? "");
    if (exact) {
      if (!used.has(exact)) out.push({ suggestion: s, entry: exact, exact: true });
      used.add(exact);
      continue;
    }
    // Same genus, and only one plant of that genus on our list: very likely that one (e.g. a Bougainvillea).
    const sameGenus = byGenus.get((SYNONYMS[k] ?? k).split(" ")[0]) ?? [];
    if (sameGenus.length === 1 && !used.has(sameGenus[0])) {
      out.push({ suggestion: s, entry: sameGenus[0], exact: false });
      used.add(sameGenus[0]);
    } else if (sameGenus.length === 0) {
      out.push({ suggestion: s, exact: false });
    }
  }
  return out;
}

// ---- sending -----------------------------------------------------------------------------

export interface Submission {
  plant: string;
  name: string;
  note: string;
  consent: boolean;
  image: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  aiName?: string;
  aiScore?: number;
  aiMatch: "agrees" | "different" | "unsure" | "none";
}

export async function submitPhoto(s: Submission): Promise<void> {
  // "text/plain" keeps this a simple request, which Google Apps Script accepts from any website.
  const res = await fetch(CONTRIBUTIONS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(s),
  });
  if (!res.ok) throw new Error("The upload service did not answer. Please try again.");
  const data = (await res.json()) as { ok: boolean; error?: string };
  if (!data.ok) throw new Error(data.error || "The photo could not be saved.");
}
