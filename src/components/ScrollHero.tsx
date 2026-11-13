import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { categories } from "../content/site";
import { postFacts } from "../lib/flora";
import { sized } from "../lib/plants";
import type { Entry } from "../lib/catalog";

// Final place of each tilted card: x / y in % of the screen, rotation in degrees.
// `start` = scroll progress at which the card starts arriving (negative = already there on load),
// `drift` = slow upward parallax.
const SLOTS_WIDE = [
  { x: 4, y: 8, rot: -10, start: -0.4, drift: 4 },
  { x: 27, y: 36, rot: 7, start: -0.12, drift: 8 },
  { x: 53, y: 10, rot: -7, start: 0.08, drift: 4 },
  { x: 76, y: 36, rot: 10, start: 0.24, drift: 8 },
];
const SLOTS_NARROW = [
  { x: 4, y: 50, rot: -7, start: -0.4, drift: 3 },
  { x: 50, y: 55, rot: 6, start: -0.35, drift: 5 },
  { x: 28, y: 6, rot: -5, start: 0.15, drift: 3 },
];
const SPAN = 0.35; // share of the scroll each card needs to arrive
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const isNarrow = () => typeof window !== "undefined" && window.innerWidth < 640;

function HeroCard({ entry, style }: { entry: Entry; style: React.CSSProperties }) {
  const [shown, setShown] = useState(false);
  const cat = categories.find((c) => c.id === entry.collections[0]);
  const facts = entry.post ? postFacts(entry.post) : [];
  const notes = facts.length ? facts : [entry.scientific, entry.varieties, cat && `Grows in our ${cat.title.toLowerCase()} collection.`].filter(Boolean) as string[];

  const onClick = (e: MouseEvent) => {
    // Touch screens have no hover: the first tap shows the note, the second opens the plant.
    if (window.matchMedia("(hover: none)").matches && !shown) {
      e.preventDefault();
      setShown(true);
    }
  };

  return (
    <Link
      href={`/plant/${entry.slug}`}
      onClick={onClick}
      aria-label={`${entry.name}${entry.scientific ? `, ${entry.scientific}` : ""}`}
      className="group absolute z-10 block overflow-hidden rounded-2xl bg-white shadow-2xl"
      style={style}
    >
      <div className="aspect-[1/1.05] overflow-hidden bg-neutral-200">
        <img src={sized(entry.images[0], 640)} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="px-[7%] py-[5%]">
        <p className="font-display font-semibold leading-none [font-size:clamp(1.05rem,1.9vw,2rem)]">{entry.name}</p>
        {entry.scientific && <p className="sci mt-1 truncate text-ink/70 [font-size:clamp(0.8rem,1.1vw,1.15rem)]">{entry.scientific}</p>}
      </div>

      <div
        className={`note-paper absolute inset-0 flex flex-col items-center justify-center px-[13%] py-[11%] text-center text-[#3b2b1a] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${shown ? "opacity-100" : "opacity-0"}`}
      >
        <p className="font-hand font-semibold leading-none [font-size:clamp(1.5rem,2.4vw,2.6rem)]">{entry.name}</p>
        <ul className="mt-3 space-y-1.5 font-hand leading-tight [font-size:clamp(0.95rem,1.35vw,1.4rem)]">
          {notes.slice(0, 3).map((f) => (
            <li key={f} className="line-clamp-2">{f}</li>
          ))}
        </ul>
        <span className="mt-4 text-[10px] uppercase tracking-[0.2em] opacity-70">Open plant →</span>
      </div>
    </Link>
  );
}

/** Pinned headline; tilted featured-plant cards are already landing when the page opens and the rest fly in on scroll. */
export default function ScrollHero({ entries }: { entries: Entry[] }) {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0); // scroll progress through the hero, 0..1
  const [narrow, setNarrow] = useState(isNarrow);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      setP(clamp(total > 0 ? -el.getBoundingClientRect().top / total : 0));
      setNarrow(isNarrow());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const slots = narrow ? SLOTS_NARROW : SLOTS_WIDE;
  const width = narrow ? "41vw" : "min(19vw, 330px)";

  return (
    <section ref={ref} className="relative h-[165vh]" aria-label="Featured plants">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <h1
          style={{ transform: `scale(${1 + p * 0.05})` }}
          className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center pb-[24vh] text-center font-display font-light uppercase leading-[0.85] [font-size:clamp(3rem,14vw,17rem)] sm:pb-0"
        >
          <span>Discover</span>
          <span>our flora</span>
        </h1>
        <p style={{ opacity: clamp(1 - p * 5) }} className="absolute bottom-6 left-0 right-0 text-center text-xs uppercase tracking-[0.3em] text-ink/70">
          Today's plants · scroll ↓
        </p>

        {entries.slice(0, slots.length).map((e, i) => {
          const s = slots[i];
          const t = clamp((p - s.start) / SPAN);
          const k = 1 - Math.pow(1 - t, 3); // ease-out
          return (
            <HeroCard
              key={e.slug}
              entry={e}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width,
                opacity: Math.min(1, t * 4),
                transform: `translate3d(${(1 - k) * 80}vw, ${(1 - k) * -45 - p * s.drift}vh, 0) rotate(${s.rot + (1 - k) * 20}deg)`,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
