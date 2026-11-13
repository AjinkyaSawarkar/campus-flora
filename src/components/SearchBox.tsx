import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";

/** Search across every plant: common, local (Telugu/Hindi) and scientific names. Opens the All plants page. */
export default function SearchBox({ big = false, autoFocus = false }: { big?: boolean; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [, navigate] = useLocation();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/flora/all${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };
  return (
    <form role="search" onSubmit={submit} className={`flex w-full items-center rounded-full bg-white shadow-sm ring-1 ring-ink/15 focus-within:ring-2 focus-within:ring-forest ${big ? "p-1.5 pl-6" : "p-1 pl-5"}`}>
      <label htmlFor={big ? "search-big" : "search"} className="sr-only">Search plants</label>
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-ink/50" aria-hidden="true" fill="none">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
        <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        id={big ? "search-big" : "search"}
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Neem, Vepa or Azadirachta…"
        className={`min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-ink/40 ${big ? "py-2.5 text-lg" : "py-2 text-base"}`}
      />
      <button type="submit" className="btn-dark shrink-0">Search</button>
    </form>
  );
}
