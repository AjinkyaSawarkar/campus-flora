import { Link } from "wouter";
import { categories } from "../content/site";
import { inCollection, withPhotos, type Entry } from "../lib/catalog";

/** The 8 collections as photo tiles, each with its size and how much of it has been photographed. */
export default function CollectionTiles({ entries, loading }: { entries: Entry[]; loading?: boolean }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((c) => {
        const items = inCollection(entries, c.id);
        const done = withPhotos(items).length;
        const pct = items.length ? Math.round((done / items.length) * 100) : 0;
        return (
          <li key={c.id}>
            <Link href={`/flora/${c.id}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-300">
                <img src={c.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-3 py-1 text-xs font-medium">{items.length} species</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{c.title}</h3>
              <p className="mt-1 text-sm text-ink/70">{c.blurb}</p>
              <div className="mt-3" aria-label={loading ? "Loading photos" : `${done} of ${items.length} photographed`}>
                <div className="h-1 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-moss transition-[width] duration-700" style={{ width: loading ? "0%" : `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-ink/60">{loading ? "Counting photos…" : `${done} of ${items.length} photographed`}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
