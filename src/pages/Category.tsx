import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { categories, GROUPS } from "../content/site";
import { inCollection, matches, newestFirst, useCatalog, withPhotos, type Entry } from "../lib/catalog";
import PlantCard from "../components/PlantCard";
import NotFound from "./NotFound";

const STEP = 24; // cards shown per "Show more"

type Sort = "az" | "new" | "photos";
const SORTS: { id: Sort; label: string }[] = [
  { id: "az", label: "Name A–Z" },
  { id: "photos", label: "Most photos" },
  { id: "new", label: "Newest posts" },
];
const sorters: Record<Sort, (a: Entry, b: Entry) => number> = {
  az: (a, b) => a.name.localeCompare(b.name),
  photos: (a, b) => b.images.length - a.images.length || a.name.localeCompare(b.name),
  new: newestFirst,
};

const control = "h-11 rounded-full bg-white px-4 text-sm ring-1 ring-ink/15 outline-none focus:ring-2 focus:ring-forest";

function Grid({ items }: { items: Entry[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((e) => <PlantCard key={e.slug} entry={e} />)}
    </div>
  );
}

export default function Category({ id }: { id: string }) {
  const isAll = id === "all";
  const cat = categories.find((c) => c.id === id);
  const { entries, isLoading, error, refetch } = useCatalog();
  const search = useSearch();
  const [location, navigate] = useLocation();

  const urlQ = new URLSearchParams(search).get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [feature, setFeature] = useState("");
  const [sort, setSort] = useState<Sort>("az");
  const [photosOnly, setPhotosOnly] = useState(false);
  const [limit, setLimit] = useState(STEP);

  useEffect(() => setQ(urlQ), [urlQ]);
  useEffect(() => {
    setFeature("");
    setLimit(STEP);
    document.querySelector('[data-active-pill="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [id]);
  useEffect(() => setLimit(STEP), [q, feature, sort, photosOnly]);

  const onQuery = (v: string) => {
    setQ(v);
    navigate(`${location}${v.trim() ? `?q=${encodeURIComponent(v.trim())}` : ""}`, { replace: true });
  };

  const base = useMemo(() => (isAll ? entries : inCollection(entries, id)), [entries, id, isAll]);
  const features = useMemo(() => {
    const m = new Map<string, number>();
    base.forEach((e) => e.features.forEach((f) => m.set(f, (m.get(f) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 40);
  }, [base]);
  const items = useMemo(
    () => base.filter((e) => matches(e, q) && (!feature || e.features.includes(feature)) && (!photosOnly || e.images.length > 0)).sort(sorters[sort]),
    [base, q, feature, photosOnly, sort],
  );

  if (!isAll && !cat) return <NotFound />;

  const photographed = withPhotos(base).length;
  const filtered = q.trim() || feature || photosOnly;
  // The biodiversity plantation is shown in its two sub-lists, as in the horticulture plan.
  const grouped = cat?.id === "biodiversity" && !filtered && sort === "az";
  const pill = (on: boolean) => `block whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${on ? "bg-forest text-white" : "bg-white ring-1 ring-ink/10 hover:bg-neutral-100"}`;

  return (
    <div className="min-h-screen pb-24 pt-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <h1 className="text-center font-display font-light leading-none tracking-tight [font-size:clamp(2.6rem,7.5vw,6.5rem)]">{isAll ? "All plants" : cat!.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink/70">{isAll ? "Every species planted on the IIT Tirupati campus." : cat!.blurb}</p>
        <p className="mt-2 text-center text-sm text-ink/60">
          {base.length} species{!isLoading && ` · ${photographed} photographed`}
        </p>
      </div>

      <nav aria-label="Collections" className="mx-auto mt-7 max-w-[1400px] px-4 sm:px-8">
        <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0">
          <li>
            <Link href="/flora/all" aria-current={isAll ? "page" : undefined} data-active-pill={isAll} className={pill(isAll)}>All</Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/flora/${c.id}`} aria-current={c.id === id ? "page" : undefined} data-active-pill={c.id === id} className={pill(c.id === id)}>
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Filters stay at the top of the screen while scrolling */}
      <div className="sticky top-0 z-20 mt-4 border-y border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 py-3 sm:px-8">
          <label className="min-w-[12rem] flex-1 sm:max-w-sm">
            <span className="sr-only">Search {isAll ? "all plants" : `in ${cat!.title}`}</span>
            <input type="search" value={q} onChange={(e) => onQuery(e.target.value)} placeholder="Search by any name" className={`${control} w-full`} />
          </label>
          {features.length > 0 && (
            <label>
              <span className="sr-only">Feature</span>
              <select value={feature} onChange={(e) => setFeature(e.target.value)} className={control}>
                <option value="">All features</option>
                {features.map(([f, n]) => <option key={f} value={f}>{f} ({n})</option>)}
              </select>
            </label>
          )}
          <label>
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={control}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className={`${control} flex cursor-pointer items-center gap-2`}>
            <input type="checkbox" checked={photosOnly} onChange={(e) => setPhotosOnly(e.target.checked)} className="accent-forest" />
            With photos
          </label>
          <p className="ml-auto text-sm text-ink/60" aria-live="polite">{items.length} {items.length === 1 ? "plant" : "plants"}</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-8">
        {error && (
          <p role="alert" className="mb-6 text-clay">
            Photos could not be loaded from Blogger. <button type="button" className="underline" onClick={() => refetch()}>Try again</button>
          </p>
        )}
        {items.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-2xl">No plants match{q && <> “{q}”</>}.</p>
            {!isAll && q && <Link href={`/flora/all?q=${encodeURIComponent(q)}`} className="mt-3 inline-block underline">Search all plants instead</Link>}
          </div>
        )}

        {grouped ? (
          Object.entries(GROUPS).map(([g, label]) => {
            const list = items.filter((e) => e.group === g);
            return list.length ? (
              <section key={g} className="mb-14" aria-labelledby={`g-${g}`}>
                <h2 id={`g-${g}`} className="mb-5 border-b border-ink/15 pb-2 font-display text-3xl font-semibold">
                  {label} <span className="font-sans text-sm font-normal text-ink/60">{list.length}</span>
                </h2>
                <Grid items={list} />
              </section>
            ) : null;
          }).concat(
            items.some((e) => !e.group) ? [
              <section key="other" aria-labelledby="g-other">
                <h2 id="g-other" className="mb-5 border-b border-ink/15 pb-2 font-display text-3xl font-semibold">Other plants</h2>
                <Grid items={items.filter((e) => !e.group)} />
              </section>,
            ] : [],
          )
        ) : (
          <>
            <Grid items={items.slice(0, limit)} />
            {items.length > limit && (
              <div className="mt-12 text-center">
                <button type="button" onClick={() => setLimit((l) => l + STEP)} className="btn-dark">
                  Show more ({items.length - limit} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
