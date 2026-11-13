import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "wouter";
import { categories } from "../content/site";
import { useCatalog } from "../lib/catalog";
import { uploadsEnabled } from "../lib/contributions";
import type { Pin } from "../components/CampusMap";

const CampusMap = lazy(() => import("../components/CampusMap"));

// One dot colour per collection (chosen to stay visible on the satellite photo).
export const COLLECTION_COLORS: Record<string, string> = {
  "avenue-trees": "#f59e0b",
  "fruit-trees": "#ef4444",
  "sacred-medicinal": "#a855f7",
  "palms-specimen": "#14b8a6",
  "shrubs-ground-covers": "#ec4899",
  creepers: "#3b82f6",
  "medicinal-aromatic": "#84cc16",
  biodiversity: "#f97316",
};

export default function MapPage() {
  const { entries } = useCatalog();
  const [only, setOnly] = useState("");

  const all = useMemo(
    () =>
      entries.flatMap((e) =>
        e.sightings.map((s) => ({
          collection: e.collections[0] ?? "",
          pin: {
            lat: s.lat,
            lng: s.lng,
            title: e.name,
            subtitle: e.scientific,
            by: s.by,
            src: s.src,
            href: `/plant/${e.slug}`,
            color: COLLECTION_COLORS[e.collections[0] ?? ""] ?? "#1f3a2b",
          } as Pin,
        })),
      ),
    [entries],
  );
  const pins = useMemo(() => all.filter((x) => !only || x.collection === only).map((x) => x.pin), [all, only]);
  const species = new Set(all.filter((x) => !only || x.collection === only).map((x) => x.pin.title)).size;
  const present = categories.filter((c) => all.some((x) => x.collection === c.id));
  const chip = (on: boolean) => `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${on ? "bg-forest text-white" : "bg-white ring-1 ring-ink/10 hover:bg-neutral-100"}`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-10 sm:px-8">
      <h1 className="font-display font-light leading-none [font-size:clamp(2.6rem,7.5vw,6rem)]">Campus map</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink/75">
        Where plants have been photographed on campus. Tap a dot to see the plant.
        {all.length > 0 && <> {species} {species === 1 ? "plant" : "plants"} at {pins.length} {pins.length === 1 ? "spot" : "spots"} so far.</>}
      </p>

      {present.length > 1 && (
        <ul className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Show one collection">
          <li><button type="button" onClick={() => setOnly("")} aria-pressed={!only} className={chip(!only)}>All</button></li>
          {present.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setOnly(c.id)} aria-pressed={only === c.id} className={chip(only === c.id)}>
                <span className="h-3 w-3 rounded-full ring-2 ring-white" style={{ background: COLLECTION_COLORS[c.id] }} aria-hidden="true" />
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <Suspense fallback={<div className="h-[70svh] animate-pulse rounded-xl bg-neutral-200" />}>
          <CampusMap pins={pins} locate className="h-[70svh] min-h-[380px]" />
        </Suspense>
      </div>

      {all.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-ink/25 p-5 text-ink/75">
          No plant positions yet. {uploadsEnabled() ? (
            <>Stand next to a plant, <Link href="/contribute" className="font-medium underline">add a photo</Link> and share your location: it becomes the first dot on this map.</>
          ) : "They will appear here once photo uploads are switched on."}
        </p>
      )}
      <p className="mt-4 text-sm text-ink/55">
        Positions come from contributors' phones and can be off by 5–15 metres. Exact positions of protected trees such as red sanders and sandalwood are not shown.
      </p>
    </div>
  );
}
