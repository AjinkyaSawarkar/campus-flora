import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { navItems } from "../content/site";
import { useCatalog } from "../lib/catalog";

export default function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { entries } = useCatalog();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="no-print relative z-30 border-b border-ink/10 bg-paper">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Campus Flora, home">
            <img src="/nisarga.webp" alt="" className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10" />
            <span className="hidden min-w-0 leading-none sm:block">
              <span className="block whitespace-nowrap font-display text-lg font-semibold sm:text-2xl">Campus Flora</span>
              <span className="mt-0.5 hidden text-[11px] uppercase tracking-[0.18em] text-ink/60 sm:block">IIT Tirupati</span>
            </span>
          </Link>
          <nav aria-label="Main" className="flex min-w-0 gap-x-3 overflow-x-auto text-[13px] font-medium sm:gap-x-7 sm:text-sm">
            {navItems.map((n) => {
              const active = n.href === "/flora" ? location === "/flora" || (location.startsWith("/flora/") && location !== "/flora/all") : location.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap border-b-2 py-1 transition-colors ${active ? "border-forest text-ink" : "border-transparent text-ink/70 hover:text-ink"}`}
                >
                  {"short" in n && n.short ? (
                    <>
                      <span className="sm:hidden">{n.short}</span>
                      <span className="hidden sm:inline">{n.label}</span>
                    </>
                  ) : (
                    n.label
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">{children}</main>

      <footer className="no-print border-t border-ink/10 bg-paper">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 text-sm sm:grid-cols-[1fr_auto] sm:px-8">
          <div className="flex items-start gap-4">
            <img src="/iitt-logo.svg" alt="IIT Tirupati" className="h-12 w-auto rounded bg-white p-1" />
            <div>
              <p className="font-display text-xl font-semibold">Campus Flora</p>
              <p className="mt-1 max-w-md text-ink/70">
                {entries.length} plant species on the IIT Tirupati campus, documented by the Nisarga club with the horticulture section.
              </p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:text-right">
            <li><Link href="/flora" className="hover:underline">Collections</Link></li>
            <li><Link href="/flora/all" className="hover:underline">All plants</Link></li>
            <li><Link href="/about" className="hover:underline">About</Link></li>
            <li><Link href="/about#contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/map" className="hover:underline">Campus map</Link></li>
            <li><Link href="/contribute" className="hover:underline">Add a photo</Link></li>
            <li><Link href="/guide" className="hover:underline">Maintain this site</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
