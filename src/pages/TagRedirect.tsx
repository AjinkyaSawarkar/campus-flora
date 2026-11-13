import { Redirect } from "wouter";
import { findByTag, useCatalog } from "../lib/catalog";
import NotFound from "./NotFound";

/** Short, permanent address printed in QR codes: /p/P016 opens that plant's page, whatever it is called now. */
export default function TagRedirect({ tag }: { tag: string }) {
  const { entries, isLoading } = useCatalog();
  const e = findByTag(entries, tag);
  if (e) return <Redirect to={`/plant/${e.slug}`} replace />;
  if (isLoading) return <p className="px-8 py-20 text-center text-ink/60">Opening plant…</p>;
  return <NotFound />;
}
