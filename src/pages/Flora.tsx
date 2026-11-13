import { useCatalog } from "../lib/catalog";
import CollectionTiles from "../components/CollectionTiles";
import SearchBox from "../components/SearchBox";

export default function Flora() {
  const { entries, isLoading, error } = useCatalog();
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-10 sm:px-8">
      <h1 className="text-center font-display font-light uppercase leading-none tracking-tight [font-size:clamp(2.75rem,9vw,8rem)]">Collections</h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-ink/70">
        {entries.length} species in eight collections, following the horticulture section's planting plan.
      </p>
      <div className="mx-auto mb-12 mt-8 max-w-xl">
        <SearchBox />
      </div>
      {error && <p role="alert" className="mb-6 text-clay">Photos could not be loaded from Blogger right now.</p>}
      <CollectionTiles entries={entries} loading={isLoading} />
    </div>
  );
}
