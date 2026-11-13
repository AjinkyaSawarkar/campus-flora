import { useState } from "react";
import type { ProfileSection } from "../lib/flora";

export const LANGS = [
  { key: "en", label: "English", match: /^english$/i },
  { key: "te", label: "తెలుగు", match: /^(తెలుగు|telugu)$/i },
  { key: "hi", label: "हिन्दी", match: /^(हिन्दी|हिंदी|hindi)$/i },
] as const;
type Lang = (typeof LANGS)[number]["key"];

const STORE = "cf-lang";

/** The plant's paragraphs, from post sections headed "English", "తెలుగు" and "हिन्दी". */
export function languageTexts(sections: ProfileSection[]): Partial<Record<Lang, string>> {
  const out: Partial<Record<Lang, string>> = {};
  for (const s of sections) {
    const lang = LANGS.find((l) => s.heading && l.match.test(s.heading.trim()));
    if (lang) out[lang.key] = s.lines.join(" ");
  }
  return out;
}

export const isLanguageSection = (s: ProfileSection) => !!s.heading && LANGS.some((l) => l.match.test(s.heading!.trim()));

function initialLang(available: Lang[]): Lang {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORE);
  } catch {
    /* storage blocked: fall back to the browser language */
  }
  const browser = (navigator.language || "en").slice(0, 2);
  for (const c of [saved, browser, "en"]) if (c && available.includes(c as Lang)) return c as Lang;
  return available[0];
}

/** Tabs to read the plant's description in English, Telugu or Hindi. The choice is remembered on this device. */
export default function LanguageTabs({ texts }: { texts: Partial<Record<Lang, string>> }) {
  const available = LANGS.filter((l) => texts[l.key]).map((l) => l.key);
  const [lang, setLang] = useState<Lang>(() => initialLang(available));
  if (available.length === 0) return null;
  const current = available.includes(lang) ? lang : available[0];

  const choose = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem(STORE, l);
    } catch {
      /* not remembered, still works */
    }
  };

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-ink/10" aria-label="About this plant">
      {available.length > 1 && (
        <div role="tablist" aria-label="Language" className="mb-4 flex gap-1 rounded-full bg-ink/5 p-1">
          {LANGS.filter((l) => texts[l.key]).map((l) => (
            <button
              key={l.key}
              type="button"
              role="tab"
              aria-selected={current === l.key}
              onClick={() => choose(l.key)}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${current === l.key ? "bg-forest text-white" : "text-ink/70 hover:text-ink"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
      <p role="tabpanel" lang={current} className="text-[1.05rem] leading-relaxed text-ink/90">
        {texts[current]}
      </p>
    </section>
  );
}
