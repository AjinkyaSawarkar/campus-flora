import { Link } from "wouter";
import SearchBox from "../components/SearchBox";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-5xl font-semibold">Page not found</h1>
      <p className="mb-8 mt-3 text-ink/70">This path has no plant growing on it. Try searching instead.</p>
      <SearchBox />
      <Link href="/" className="mt-6 inline-block underline">Back to home</Link>
    </div>
  );
}
