import { useRef, useState } from "react";
import { Link } from "wouter";
import { FLORA_FACTS } from "../content/facts";
import { categories } from "../content/site";
import { useCatalog, type Entry } from "../lib/catalog";
import { postFacts } from "../lib/flora";

interface Fact { text: string; plant?: Entry }

/** A fact about one of our own plants (from its Blogger post or the inventory), or a general one. */
function pickFact(entries: Entry[], last: string): Fact {
  for (let tries = 0; tries < 6; tries++) {
    let f: Fact;
    if (entries.length && Math.random() < 0.7) {
      const e = entries[Math.floor(Math.random() * entries.length)];
      const fromPost = e.post ? postFacts(e.post, 2) : [];
      const cat = categories.find((c) => c.id === e.collections[0]);
      const also = e.aka.length ? ` It is also called ${e.aka.slice(0, 2).join(" or ")}.` : "";
      f = {
        plant: e,
        text: fromPost.length
          ? `${e.name}: ${fromPost[0]}`
          : `${e.name}${e.scientific ? ` (${e.scientific})` : ""} grows in our ${cat?.title.toLowerCase() ?? "campus"} collection.${also}`,
      };
    } else {
      f = { text: FLORA_FACTS[Math.floor(Math.random() * FLORA_FACTS.length)] };
    }
    if (f.text !== last) return f;
  }
  return { text: FLORA_FACTS[0] };
}

export default function Sprout() {
  const { entries } = useCatalog();
  const [open, setOpen] = useState(false);
  const [hop, setHop] = useState(false);
  const [fact, setFact] = useState<Fact>({ text: FLORA_FACTS[0] });
  const last = useRef("");

  const nextFact = () => {
    const f = pickFact(entries, last.current);
    last.current = f.text;
    setFact(f);
  };

  const toggle = () => {
    setHop(true);
    setTimeout(() => setHop(false), 500);
    if (!open) nextFact();
    setOpen((o) => !o);
  };

  return (
    <div className="no-print fixed bottom-3 right-3 z-30 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div role="status" aria-live="polite" className="max-w-[17rem] rounded-2xl bg-white p-4 text-sm text-ink shadow-xl ring-1 ring-ink/10">
          <p className="mb-1 font-semibold text-forest">Sprout says</p>
          <p className="leading-relaxed">{fact.text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button type="button" onClick={nextFact} className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-moss">
              Another fact
            </button>
            {fact.plant && (
              <Link href={`/plant/${fact.plant.slug}`} onClick={() => setOpen(false)} className="text-xs font-medium underline underline-offset-2">
                See {fact.plant.name}
              </Link>
            )}
            <button type="button" onClick={() => setOpen(false)} className="ml-auto text-xs text-ink/60 underline">Hide</button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Sprout, your flora guide. Show a plant fact"
        className={`rounded-full bg-white/95 p-1 shadow-lg ring-1 ring-ink/10 ${hop ? "sprout-hop" : ""}`}
      >
        <svg viewBox="0 0 80 90" fill="none" className="sprout-idle h-10 w-9 overflow-visible sm:h-[62px] sm:w-14" aria-hidden="true">
          <path d="M40 28 C40 20 40 12 40 6" stroke="#40916c" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 14 C32 8 22 10 18 18 C26 22 34 20 40 14 Z" fill="#52b788" stroke="#2d6a4f" strokeWidth="1.2" />
          <path d="M40 10 C48 4 58 6 62 14 C54 18 46 16 40 10 Z" fill="#74c69d" stroke="#2d6a4f" strokeWidth="1.2" />
          <path d="M20 46 C20 32 30 26 40 26 C50 26 60 32 60 46 C60 62 52 74 40 76 C28 74 20 62 20 46 Z" fill="#7f5539" stroke="#58311a" strokeWidth="2.5" />
          <path d="M28 50 C28 38 34 34 40 34 C46 34 52 38 52 50 C52 62 46 68 40 70 C34 68 28 62 28 50 Z" fill="#9c6644" />
          <circle cx="31" cy="52" r="3.5" fill="#e76f51" fillOpacity="0.6" />
          <circle cx="49" cy="52" r="3.5" fill="#e76f51" fillOpacity="0.6" />
          <circle cx="34" cy="46" r="4" fill="#221108" />
          <circle cx="46" cy="46" r="4" fill="#221108" />
          <circle cx="35.5" cy="44.5" r="1.5" fill="white" />
          <circle cx="47.5" cy="44.5" r="1.5" fill="white" />
          <path d="M37 54 Q40 58 43 54" stroke="#221108" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 75 C30 82 25 84 22 84 M48 75 C50 82 55 84 58 84" stroke="#58311a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M20 48 Q14 44 10 40 M60 48 Q66 44 70 40" stroke="#58311a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
