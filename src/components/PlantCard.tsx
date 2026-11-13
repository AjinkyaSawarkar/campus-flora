import { Link } from "wouter";
import type { Entry } from "../lib/catalog";
import { sized } from "../lib/plants";

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <path d="M10 38C10 20 22 9 40 8c0 18-10 30-28 30" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 38 30 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Photo, or a calm placeholder for species nobody has photographed yet. */
export function PlantPhoto({ entry, px = 480, className = "" }: { entry: Entry; px?: number; className?: string }) {
  const img = entry.images[0];
  return img ? (
    <img src={sized(img, px)} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#e6e4dc] text-ink/35">
      <Leaf className="h-10 w-10" />
      <span className="text-[11px] uppercase tracking-[0.18em]">Photo coming soon</span>
    </div>
  );
}

export default function PlantCard({ entry }: { entry: Entry }) {
  const n = entry.images.length;
  return (
    <Link href={`/plant/${entry.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
        <PlantPhoto entry={entry} className="transition-transform duration-700 group-hover:scale-105" />
      </div>
      <h3 className="mt-2.5 font-display text-[1.35rem] font-semibold leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
        {entry.name}
      </h3>
      {entry.scientific && <p className="sci text-[1.02rem] leading-snug text-ink/70">{entry.scientific}</p>}
      <p className="mt-1 text-xs text-ink/55">
        {[entry.varieties, n > 1 ? `${n} photos` : null].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}
