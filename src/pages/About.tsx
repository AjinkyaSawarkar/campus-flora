import { useEffect, useState } from "react";
import { Link } from "wouter";
import { campusFacts, developers, horticulture, horticultureIntro, nisarga } from "../content/site";
import { useCatalog } from "../lib/catalog";
import { parseAbout, parseContact, parseTeam, usePlantingStats, useSitePages, type Head, type Member } from "../lib/sitePages";
import Lightbox from "../components/Lightbox";
import Linkify from "../components/Linkify";
import Pending from "../components/Pending";

function People({ list, what }: { list: Member[]; what: string }) {
  if (list.length === 0) return <Pending what={what} />;
  const withPhotos = list.some((p) => p.photo);
  return (
    <ul className={withPhotos ? "grid grid-cols-2 gap-5 sm:grid-cols-3" : "space-y-2.5"}>
      {list.map((p, i) => (
        <li key={`${p.name}-${i}`}>
          {withPhotos &&
            (p.photo ? (
              <img src={p.photo} alt={p.name} className="mb-2 aspect-square w-full rounded-lg object-cover" loading="lazy" onError={(ev) => (ev.currentTarget.style.display = "none")} />
            ) : (
              <div className="mb-2 flex aspect-square w-full items-center justify-center rounded-lg bg-ink/5 font-display text-4xl text-ink/30" aria-hidden="true">
                {p.name.charAt(0)}
              </div>
            ))}
          <p className="font-semibold leading-snug">{p.name}</p>
          {p.role && <p className="text-sm text-ink/70">{p.role}</p>}
        </li>
      ))}
    </ul>
  );
}

function HeadCard({ head }: { head: Head }) {
  return (
    <div className="flex items-start gap-4">
      {head.photo && <img src={head.photo} alt={head.name} className="h-24 w-24 shrink-0 rounded-lg object-cover" loading="lazy" onError={(ev) => (ev.currentTarget.style.display = "none")} />}
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-snug">{head.name}</p>
        {head.role && <p className="text-ink/70">{head.role}</p>}
        {head.email && <p className="mt-1 text-sm"><Linkify text={head.email} /></p>}
        {head.phone && <p className="text-sm"><Linkify text={head.phone} /></p>}
        {head.details.map(([k, v]) => (
          <p key={k} className="text-sm text-ink/70">{k}: <Linkify text={v} /></p>
        ))}
      </div>
    </div>
  );
}

function Paragraphs({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <p key={i} className="mb-4 max-w-3xl text-lg leading-relaxed text-ink/85"><Linkify text={l} /></p>
      ))}
    </>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mb-5 scroll-mt-6 font-display text-4xl font-semibold">{children}</h2>;
}

/** Text written in Blogger under Pages ("About", "Team", "Contact"). Already cleaned by the server. */
function Rich({ html }: { html: string }) {
  return <div className="rich max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function About() {
  const [mapOpen, setMapOpen] = useState(false);
  const { data: pages = {} } = useSitePages();
  const { entries } = useCatalog();
  const stats = usePlantingStats();

  // Blogger pages in the site's formats; built-in text until they exist.
  const about = parseAbout(pages.about?.lines);
  const team = parseTeam(pages.team?.lines);
  const contact = parseContact(pages.contact?.lines);
  const builtInHead: Head | null = horticulture.head.name
    ? { name: horticulture.head.name, role: horticulture.head.designation, email: horticulture.head.email, photo: horticulture.head.photo || undefined, details: [] }
    : null;
  const head = team.found ? team.head : builtInHead;
  const gardeners = team.found ? team.gardeners : horticulture.gardeners;
  const webTeam = team.found ? team.web : developers;
  const boxes = contact.boxes.length
    ? contact.boxes
    : [
        { title: "Nisarga club", lines: nisarga.email ? [`Email: ${nisarga.email}`] : [] },
        { title: "Horticulture section", lines: horticulture.head.email ? [`Email: ${horticulture.head.email}`] : [] },
      ];

  // Jump to #team / #contact / #contribute after the page renders.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-10 sm:px-8">
      <h1 className="font-display font-light leading-none [font-size:clamp(2.75rem,7vw,6rem)]">About Campus Flora</h1>

      <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" aria-labelledby="hort">
        <div className="max-w-2xl">
          <H2 id="hort">Greening the campus</H2>
          {pages.about ? (
            about.stats.length ? <Paragraphs lines={about.paragraphs.filter((l) => !l.startsWith("[[img:"))} /> : <Rich html={pages.about.html} />
          ) : (
            horticultureIntro.map((p) => <p key={p} className="mb-4 text-lg leading-relaxed text-ink/85">{p}</p>)
          )}
        </div>
        <dl className="grid content-start gap-4 sm:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-5 ring-1 ring-ink/10">
              <dt className="font-display text-4xl font-semibold">{s.value}</dt>
              <dd className="text-sm text-ink/70">{s.label}</dd>
            </div>
          ))}
          <div className="rounded-xl bg-forest p-5 text-white">
            <dt className="font-display text-4xl font-semibold">{entries.length}</dt>
            <dd className="text-sm text-white/80">species in this guide</dd>
          </div>
        </dl>
      </section>

      <section className="mt-20" aria-labelledby="campus">
        <H2 id="campus">The campus</H2>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <button type="button" onClick={() => setMapOpen(true)} className="block overflow-hidden rounded-xl bg-white p-2 ring-1 ring-ink/10" aria-label="Enlarge the campus master plan">
            <img src="/map.webp" alt="Master plan of the IIT Tirupati campus with a legend of buildings and facilities" className="w-full rounded-lg" loading="lazy" />
            <span className="mt-2 block text-center text-xs text-ink/60">Master plan, IIT Tirupati · tap to enlarge</span>
          </button>
          <dl className="grid grid-cols-2 gap-3">
            {campusFacts.map((f) => (
              <div key={f.value} className="border-t border-ink/20 pt-3">
                <dt className="font-display text-2xl font-semibold">{f.value}</dt>
                <dd className="text-sm leading-snug text-ink/70">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="team">
        <H2 id="team">Team</H2>
        {pages.team && !team.found ? (
          <Rich html={pages.team.html} />
        ) : (
          <>
            {team.intro.length > 0 && <Paragraphs lines={team.intro} />}
            <div className="grid gap-12 lg:grid-cols-3">
              <div>
                <h3 className="eyebrow mb-3">Horticulture head</h3>
                {head ? <HeadCard head={head} /> : <Pending what="The horticulture head's details" />}
              </div>
              <div>
                <h3 className="eyebrow mb-3">Gardeners</h3>
                <People list={gardeners} what="The list of gardeners" />
              </div>
              <div>
                <h3 className="eyebrow mb-3">Website team</h3>
                <People list={webTeam} what="The website team" />
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mt-20" aria-labelledby="contact">
        <H2 id="contact">Contact</H2>
        {pages.contact && !contact.boxes.length ? (
          <Rich html={pages.contact.html} />
        ) : (
          <>
            {contact.intro.length > 0 && <Paragraphs lines={contact.intro} />}
            <div className="grid gap-4 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
              {boxes.map((c, i) => (
                <div key={`${c.title}-${i}`} className="rounded-xl bg-white p-5 ring-1 ring-ink/10">
                  {c.title && <p className="font-display text-2xl font-semibold">{c.title}</p>}
                  {c.lines.length ? (
                    <div className="mt-1 space-y-1 break-words">
                      {c.lines.map((l, k) => <p key={k}><Linkify text={l} /></p>)}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-ink/60">Contact details will be added soon.</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-20 max-w-3xl" aria-labelledby="contribute">
        <H2 id="contribute">Help build the guide</H2>
        <p className="mb-6 leading-relaxed text-ink/85">
          <strong>Anyone on campus:</strong> photograph a plant with your phone and <Link href="/contribute" className="font-medium underline">add your photo</Link>. It appears on the plant's page with your name after a reviewer has checked it.
        </p>
        <p className="leading-relaxed text-ink/85">
          <strong>Nisarga and horticulture team:</strong> adding plants, editing text, approving photos and printing QR tags are explained in the{" "}
          <Link href="/guide" className="font-medium underline">guide to keeping the site up to date</Link>.
        </p>
      </section>

      <Lightbox open={mapOpen} onClose={() => setMapOpen(false)} label="Campus master plan">
        <img src="/map.webp" alt="Master plan of the IIT Tirupati campus" className="max-h-full max-w-full rounded-lg bg-white object-contain" />
      </Lightbox>
    </div>
  );
}
