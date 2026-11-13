import { Fragment, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { categories } from "../content/site";
import { inCollection, useCatalog, withPhotos, nextTag } from "../lib/catalog";
import { MONTH_NAMES, plantProfile } from "../lib/flora";
import { sized } from "../lib/plants";
import Lightbox from "../components/Lightbox";
import PlantViewer from "../components/PlantViewer";
import PlantCard, { PlantPhoto } from "../components/PlantCard";
import TagQR from "../components/TagQR";
import LanguageTabs, { isLanguageSection, languageTexts } from "../components/LanguageTabs";
import NotFound from "./NotFound";

const CampusMap = lazy(() => import("../components/CampusMap"));

// Fields shown in their own boxes, so they are skipped in the post's sections.
const SHOWN_APART = /^(location|where to find( it)?|flowering( season)?|blooming|(tag|qr)[\s-]*(id|no\.?|number))$/i;

export default function PlantPage({ slug }: { slug: string }) {
  const { entries, bySlug, isLoading } = useCatalog();
  const e = bySlug.get(slug);
  const [i, setI] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [qr, setQr] = useState(false);

  useEffect(() => setI(0), [slug]);
  useEffect(() => {
    if (e) document.title = `${e.name}${e.scientific ? ` (${e.scientific})` : ""} · Campus Flora`;
    return () => { document.title = "Campus Flora · IIT Tirupati"; };
  }, [e]);

  const related = useMemo(() => {
    if (!e) return [];
    const same = inCollection(entries, e.collections[0]).filter((x) => x.slug !== e.slug);
    return [...withPhotos(same), ...same.filter((x) => !x.images.length)].slice(0, 5);
  }, [entries, e]);

  if (!e) return isLoading ? <p className="px-8 py-20 text-center text-ink/60">Loading…</p> : <NotFound />;

  const profile = e.post ? plantProfile(e.post) : undefined;
  const texts = languageTexts(profile?.sections ?? []);
  const sections = (profile?.sections ?? [])
    .filter((s) => !isLanguageSection(s))
    .map((s) => ({ ...s, pairs: s.pairs.filter(([k]) => !SHOWN_APART.test(k)) }))
    .filter((s) => s.pairs.length || s.lines.length);
  const cols = e.collections.map((id) => categories.find((c) => c.id === id)!).filter(Boolean);
  const img = e.images[i];
  // QR codes use the permanent tag address when the plant has one, so renaming never breaks a printed tag.
  const pageUrl = e.tag ? `${window.location.origin}/p/${e.tag}` : `${window.location.origin}/plant/${e.slug}`;

  return (
    <article className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/60">
        <Link href="/flora" className="hover:underline">Collections</Link>
        {cols[0] && <> <span aria-hidden="true">/</span> <Link href={`/flora/${cols[0].id}`} className="hover:underline">{cols[0].title}</Link></>}
        <span aria-hidden="true"> / </span><span className="text-ink">{e.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        {/* Photos */}
        <div>
          {img ? (
            <button type="button" onClick={() => setViewer(i)} aria-label={`Open photos of ${e.name}`} className="block aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-200">
              <img src={sized(img, 1200)} alt={e.name} className="h-full w-full object-cover" />
            </button>
          ) : (
            <div className="aspect-[4/3] overflow-hidden rounded-xl"><PlantPhoto entry={e} /></div>
          )}
          {img && e.credits[img] && <p className="mt-2 text-sm text-ink/60">Photo: {e.credits[img]}, taken on campus</p>}
          {e.images.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {e.images.slice(0, 12).map((src, k) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setI(k)}
                    aria-label={`Show photo ${k + 1}`}
                    aria-pressed={k === i}
                    className={`h-16 w-16 overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-paper ${k === i ? "ring-forest" : "ring-transparent"}`}
                  >
                    <img src={sized(src, 128)} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!img && (
            <p className="mt-4 rounded-lg border border-dashed border-ink/25 p-4 text-sm text-ink/70">
              No photos yet. Seen this plant on campus?{" "}
              <Link href={`/contribute?plant=${e.slug}`} className="font-medium underline">Add the first photo</Link>
            </p>
          )}
        </div>

        {/* Names and details */}
        <div>
          <div className="flex flex-wrap gap-2">
            {cols.map((c) => (
              <Link key={c.id} href={`/flora/${c.id}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-ink/10 hover:bg-neutral-100">{c.title}</Link>
            ))}
          </div>
          <h1 className="mt-4 font-display font-semibold leading-[0.95] [font-size:clamp(2.6rem,5vw,4.5rem)]">{e.name}</h1>
          {e.scientific && <p className="sci mt-2 text-2xl text-ink/75">{e.scientific}</p>}
          {e.aka.length > 0 && <p className="mt-3 text-ink/70"><span className="text-ink/50">Also called </span>{e.aka.join(", ")}</p>}
          <LanguageTabs texts={texts} />

          {(e.varieties || e.location || e.flowering) && (
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {e.location && (
                <div className="rounded-xl bg-forest p-4 text-white sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.18em] text-white/70">Where to find it</dt>
                  <dd className="mt-1 text-lg">{e.location}</dd>
                </div>
              )}
              {e.flowering && (
                <div className="rounded-xl bg-white p-4 ring-1 ring-ink/10">
                  <dt className="eyebrow">Flowering</dt>
                  <dd className="mt-1">{e.flowering}</dd>
                  {e.floweringMonths.length > 0 && e.floweringMonths.length < 12 && (
                    <dd className="mt-2 flex gap-0.5" aria-hidden="true">
                      {MONTH_NAMES.map((m, k) => (
                        <span key={m} title={m} className={`flex h-6 flex-1 items-center justify-center rounded-sm text-[10px] ${e.floweringMonths.includes(k) ? "bg-moss text-white" : "bg-ink/5 text-ink/40"}`}>{m[0]}</span>
                      ))}
                    </dd>
                  )}
                </div>
              )}
              {e.varieties && (
                <div className="rounded-xl bg-white p-4 ring-1 ring-ink/10">
                  <dt className="eyebrow">Planted on campus</dt>
                  <dd className="mt-1">{e.varieties}</dd>
                </div>
              )}
            </dl>
          )}

          {sections.map((s, n) => (
            <section key={n} className="mt-7">
              {s.heading && <h2 className="eyebrow mb-2">{s.heading}</h2>}
              {s.pairs.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5">
                  {s.pairs.map(([k, v], m) => (
                    <Fragment key={`${k}-${m}`}>
                      <dt className={`font-medium ${/^caution$/i.test(k) ? "text-clay" : ""}`}>{k}</dt>
                      <dd className={/^caution$/i.test(k) ? "font-medium text-clay" : "text-ink/80"}>{v}</dd>
                    </Fragment>
                  ))}
                </dl>
              )}
              {s.lines.length > 0 && (
                <ul className="mt-1 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/85">
                  {s.lines.map((l, m) => <li key={m}>{l}</li>)}
                </ul>
              )}
            </section>
          ))}

          {e.features.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              {e.features.map((f) => <span key={f} className="rounded-full bg-ink/5 px-3 py-1 text-xs">{f}</span>)}
            </div>
          )}

          <div className="no-print mt-8 flex flex-wrap gap-3">
            {e.images.length > 0 && (
              <button type="button" onClick={() => setViewer(i)} className="btn-dark">
                View {e.images.length === 1 ? "photo" : `all ${e.images.length} photos`}
              </button>
            )}
            <Link href={`/contribute?plant=${e.slug}`} className="btn-line">Add a photo</Link>
            <button type="button" onClick={() => setQr(true)} className="btn-line">Name-tag QR code</button>
          </div>
          {e.sightings.length > 0 && (
            <section className="no-print mt-8" aria-labelledby="where-heading">
              <h2 id="where-heading" className="eyebrow mb-2">Where it was photographed</h2>
              <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-200" />}>
                <CampusMap
                  className="h-64"
                  pins={e.sightings.map((s) => ({ lat: s.lat, lng: s.lng, title: e.name, by: s.by, src: s.src }))}
                />
              </Suspense>
              <p className="mt-2 text-sm text-ink/60">
                {e.sightings.length === 1 ? "One spot" : `${e.sightings.length} spots`} on campus. <Link href="/map" className="underline">See the whole campus map</Link>
              </p>
            </section>
          )}
          {e.post && (
            <p className="mt-4 text-xs text-ink/50">
              From the Nisarga Blogger post · <a href={e.post.url} target="_blank" rel="noopener noreferrer" className="underline">edit or view source</a>
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && cols[0] && (
        <section className="mt-20" aria-labelledby="related-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="related-heading" className="font-display text-3xl font-semibold sm:text-4xl">More in {cols[0].title}</h2>
            <Link href={`/flora/${cols[0].id}`} className="btn-line">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((r) => <PlantCard key={r.slug} entry={r} />)}
          </div>
        </section>
      )}

      <Lightbox open={viewer !== null} onClose={() => setViewer(null)} label={`${e.name} photos`}>
        {viewer !== null && <PlantViewer key={e.slug} title={e.name} images={e.images} start={viewer} />}
      </Lightbox>
      <Lightbox open={qr} onClose={() => setQr(false)} label={`${e.name} QR code`}>
        <TagQR name={e.name} scientific={e.scientific} tag={e.tag} url={pageUrl} suggestedTag={nextTag(entries)} tagProblem={e.tagProblem} />
      </Lightbox>
    </article>
  );
}
