import { useMemo } from "react";
import { Link } from "wouter";
import { usePlantingStats } from "../lib/sitePages";
import { featured, floweringIn, newestFirst, useCatalog, withPhotos } from "../lib/catalog";
import { MONTH_NAMES } from "../lib/flora";
import ScrollHero from "../components/ScrollHero";
import PlantCard from "../components/PlantCard";
import CollectionTiles from "../components/CollectionTiles";
import SearchBox from "../components/SearchBox";

function SectionHead({ title, children, id }: { title: string; children?: React.ReactNode; id: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h2 id={id} className="font-display font-light uppercase leading-none [font-size:clamp(2.1rem,4.5vw,3.75rem)]">{title}</h2>
      {children}
    </div>
  );
}

export default function Home() {
  const { entries, isLoading, error } = useCatalog();
  const heroPlants = useMemo(() => featured(entries, 4), [entries]);
  const newest = useMemo(() => withPhotos(entries).filter((e) => e.published).sort(newestFirst).slice(0, 10), [entries]);
  const month = new Date().getMonth();
  const inFlower = useMemo(() => withPhotos(floweringIn(entries, month)).slice(0, 10), [entries, month]);
  const photographed = withPhotos(entries).length;
  const plantingStats = usePlantingStats();
  const total = entries.length;

  return (
    <div>
      {heroPlants.length > 0 ? (
        <ScrollHero entries={heroPlants} />
      ) : (
        <section className="flex min-h-[70svh] items-center justify-center px-4">
          <h1 className="text-center font-display font-light uppercase leading-[0.85] [font-size:clamp(3.4rem,15vw,17rem)]">
            Discover<br />our flora
          </h1>
        </section>
      )}

      {/* Search and the planting numbers */}
      <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-4 sm:px-8" aria-labelledby="find-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <h2 id="find-heading" className="font-display text-3xl font-semibold sm:text-4xl">Find a plant on campus</h2>
            <p className="mb-5 mt-2 max-w-xl text-ink/70">
              Search {total} species by English, Telugu or Hindi name, or by scientific name.
            </p>
            <SearchBox big />
          </div>
          <dl className="grid grid-cols-3 gap-3 sm:gap-6">
            {plantingStats.map((s) => (
              <div key={s.label} className="border-t border-ink/20 pt-3">
                <dt className="font-display text-3xl font-semibold leading-none sm:text-5xl">{s.value}</dt>
                <dd className="mt-1.5 text-xs leading-snug text-ink/70 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {error && (
        <p role="alert" className="mx-auto max-w-[1400px] px-4 pb-8 text-clay sm:px-8">
          Photos could not be loaded from Blogger right now. The plant list below still works.
          <span className="mt-1 block text-xs text-ink/50">Details: {(error as Error).message}</span>
        </p>
      )}

      {inFlower.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-8" aria-labelledby="flower-heading">
          <SectionHead id="flower-heading" title={`In flower in ${MONTH_NAMES[month]}`} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {inFlower.map((e) => <PlantCard key={e.slug} entry={e} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-8" aria-labelledby="collections-heading">
        <SectionHead id="collections-heading" title="Collections">
          <Link href="/flora/all" className="btn-line">Browse all {total} plants</Link>
        </SectionHead>
        <CollectionTiles entries={entries} loading={isLoading} />
      </section>

      {newest.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-8" aria-labelledby="new-heading">
          <SectionHead id="new-heading" title="Recently added" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {newest.map((e) => <PlantCard key={e.slug} entry={e} />)}
          </div>
        </section>
      )}

      {/* Invite members to photograph what is missing */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-8">
        <div className="grid gap-6 rounded-2xl bg-forest px-6 py-8 text-white sm:px-10 sm:py-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Help complete the guide</p>
            <p className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {isLoading ? "Many" : total - photographed} of our {total} species still need photos.
            </p>
            <p className="mt-2 max-w-2xl text-white/80">Anyone on campus can help: take a photo of a plant with your phone and send it in. It appears here with your name after a quick check.</p>
          </div>
          <Link href="/contribute" className="btn bg-white text-forest hover:bg-paper">Add a photo</Link>
        </div>
      </section>
    </div>
  );
}
