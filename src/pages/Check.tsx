import { useMemo, type ReactNode } from "react";
import { Link } from "wouter";
import { DEFAULT_BLOG_ID } from "../../shared/blogger";
import { inventory } from "../content/inventory";
import { nextTag, useCatalog } from "../lib/catalog";
import type { Plant } from "../lib/plants";

/** Address of a post in Blogger's editor (works for the blog's authors). */
const editUrl = (p: Plant) => `https://www.blogger.com/blog/post/edit/${DEFAULT_BLOG_ID}/${p.id}`;

function PostLinks({ post }: { post: Plant }) {
  return (
    <span className="whitespace-nowrap text-sm">
      <a href={editUrl(post)} target="_blank" rel="noopener noreferrer" className="font-medium underline">Edit in Blogger</a>
      <span className="text-ink/40"> · </span>
      <a href={post.url} target="_blank" rel="noopener noreferrer" className="underline">view</a>
    </span>
  );
}

function Section({ id, title, count, ok, help, children }: { id: string; title: string; count: number; ok: string; help: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-ink/15 pt-7" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="flex flex-wrap items-baseline gap-x-3 font-display text-3xl font-semibold">
        {title}
        <span className={`rounded-full px-2.5 py-0.5 font-sans text-sm font-medium ${count ? "bg-[#fff4d6] text-[#7a5300]" : "bg-moss/15 text-moss"}`}>
          {count ? count : "✓"}
        </span>
      </h2>
      {count ? (
        <>
          <p className="mt-2 max-w-3xl text-ink/70">{help}</p>
          <div className="mt-4">{children}</div>
        </>
      ) : (
        <p className="mt-2 text-moss">{ok}</p>
      )}
    </section>
  );
}

const Row = ({ children }: { children: ReactNode }) => <li className="rounded-xl bg-white p-4 ring-1 ring-ink/10">{children}</li>;

/**
 * For the horticulture and Nisarga team: things in Blogger or the photo sheet that the website could not use
 * the way they were probably meant. Nothing here is visible to visitors unless they open this address.
 */
export default function Check() {
  const { entries, report, isLoading, error } = useCatalog();

  const textMatches = report.posts.filter((p) => p.matchedBy === "scientific name in the text");
  const layout = report.posts.filter((p) => p.problems.length);
  const newWithProblems = report.newPlants.filter((p) => p.problems.length);
  const noPost = useMemo(() => entries.filter((e) => e.inInventory && !e.post), [entries]);
  const noPhoto = useMemo(() => entries.filter((e) => !e.images.some((u) => !u.includes("wikimedia.org"))), [entries]);
  const openQuestions = inventory.filter((sp) => sp.review);
  const suggested = nextTag(entries);

  const sections = [
    { id: "duplicates", title: "Duplicate posts", n: report.duplicates.length },
    { id: "shared-names", title: "Titles shared by several plants", n: report.ambiguous.length },
    { id: "text-matches", title: "Matched by a name in the text", n: textMatches.length },
    { id: "new-plants", title: "New plants needing details", n: newWithProblems.length },
    { id: "layout", title: "Posts not in the standard layout", n: layout.length },
    { id: "photos", title: "Approved photos not shown", n: report.unmatchedPhotos.length },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8">
      <p className="eyebrow">For the horticulture and Nisarga team</p>
      <h1 className="mt-2 font-display font-light leading-none [font-size:clamp(2.6rem,7vw,5rem)]">Content check</h1>
      <p className="mt-4 max-w-3xl text-lg text-ink/75">
        Things in Blogger or the photo sheet that the website could not use the way they were probably meant. Fix them in Blogger or the sheet;
        this page updates within about five minutes. How to write posts is in the <Link href="/guide" className="underline">guide</Link>.
      </p>

      {isLoading && <p className="mt-8 text-ink/60">Reading Blogger…</p>}
      {error && (
        <p role="alert" className="mt-8 rounded-xl bg-clay/10 p-4 text-clay">
          Blogger could not be read, so post checks are incomplete. {(error as Error).message}
        </p>
      )}

      {!isLoading && (
        <>
          <nav aria-label="Summary" className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-ink/10 hover:ring-forest">
                <span>{s.title}</span>
                <span className={`ml-3 rounded-full px-2.5 py-0.5 text-sm font-medium ${s.n ? "bg-[#fff4d6] text-[#7a5300]" : "bg-moss/15 text-moss"}`}>{s.n || "✓"}</span>
              </a>
            ))}
          </nav>
          <p className="mt-3 text-sm text-ink/60">
            {report.posts.length} posts read · {entries.length} plants on the site · {entries.length - noPhoto.length} with campus photos
          </p>

          <div className="mt-10 space-y-10">
            <Section
              id="duplicates"
              title="Duplicate posts"
              count={report.duplicates.length}
              ok="Every plant has at most one post."
              help="These plants have more than one post. Photos from all of them are shown, but the text comes only from the longest post, so edits to the others change nothing. Copy anything useful into the post that is used, then delete the others."
            >
              <ul className="space-y-3">
                {report.duplicates.map((d) => (
                  <Row key={d.slug}>
                    <Link href={`/plant/${d.slug}`} className="font-display text-xl font-semibold underline-offset-4 hover:underline">{d.name}</Link>
                    <p className="mt-2 text-sm"><span className="font-medium text-moss">Text used:</span> “{d.used.title}” <PostLinks post={d.used} /></p>
                    {d.others.map((o) => (
                      <p key={o.id} className="mt-1 text-sm"><span className="font-medium text-[#7a5300]">Ignored:</span> “{o.title}” <PostLinks post={o} /></p>
                    ))}
                  </Row>
                ))}
              </ul>
            </Section>

            <Section
              id="shared-names"
              title="Titles shared by several plants"
              count={report.ambiguous.length}
              ok="No post is titled with a name that several plants share."
              help="These posts are titled with a name that belongs to more than one plant, so the title alone cannot say which plant is meant. The site used the scientific name instead. Check the result, and rename the post to the plant's own name to be safe."
            >
              <ul className="space-y-3">
                {report.ambiguous.map((a) => (
                  <Row key={a.post.id}>
                    <p>
                      “{a.title}” could be {a.candidates.join(", ")}. It now appears as{" "}
                      <Link href={`/plant/${a.slug}`} className="font-medium underline">{a.endedUpAs}</Link>.
                    </p>
                    <p className="mt-1"><PostLinks post={a.post} /></p>
                  </Row>
                ))}
              </ul>
            </Section>

            <Section
              id="text-matches"
              title="Matched by a name in the text"
              count={textMatches.length}
              ok="Every post was matched by its title or by the scientific name on its first line."
              help="These posts did not have a recognised title or a scientific name on line 1, so the site matched them by a scientific name found further down. That is usually right, but check that each went to the correct plant."
            >
              <ul className="space-y-3">
                {textMatches.map((m) => (
                  <Row key={m.post.id}>
                    <p>
                      “{m.post.title}” → <Link href={`/plant/${m.slug}`} className="font-medium underline">{m.plant}</Link>
                    </p>
                    <p className="mt-1"><PostLinks post={m.post} /></p>
                  </Row>
                ))}
              </ul>
            </Section>

            <Section
              id="new-plants"
              title="New plants needing details"
              count={newWithProblems.length}
              ok={report.newPlants.length ? "Every plant added in Blogger has a collection, a Tag ID and a scientific name." : "No plants have been added outside the built-in list."}
              help={<>These posts are not about a plant on the built-in list, so each became a new plant page. If one was meant to be an existing plant, change its title to that plant's name. The next free Tag ID is <strong>{suggested}</strong>.</>}
            >
              <ul className="space-y-3">
                {newWithProblems.map((p) => (
                  <Row key={p.slug}>
                    <Link href={`/plant/${p.slug}`} className="font-display text-xl font-semibold underline-offset-4 hover:underline">{p.name}</Link>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{p.problems.map((x) => <li key={x}>{x}</li>)}</ul>
                    {(() => {
                      const post = entries.find((e) => e.slug === p.slug)?.post;
                      return post && <p className="mt-2"><PostLinks post={post} /></p>;
                    })()}
                  </Row>
                ))}
              </ul>
            </Section>

            <Section
              id="layout"
              title="Posts not in the standard layout"
              count={layout.length}
              ok="Every post has its scientific name, three language paragraphs and photos."
              help="The website still shows these posts, but parts of them are missing or not recognised. The guide shows the layout."
            >
              <ul className="space-y-3">
                {layout.map((l) => (
                  <Row key={l.post.id}>
                    <p>
                      <Link href={`/plant/${l.slug}`} className="font-medium underline">{l.plant}</Link>
                      {l.post.title.trim() !== l.plant && <span className="text-ink/60"> (post “{l.post.title}”)</span>}
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{l.problems.map((x) => <li key={x}>{x}</li>)}</ul>
                    <p className="mt-2"><PostLinks post={l.post} /></p>
                  </Row>
                ))}
              </ul>
            </Section>

            <Section
              id="photos"
              title="Approved photos not shown"
              count={report.unmatchedPhotos.length}
              ok="Every approved photo is attached to a plant."
              help="These photos are ticked Approved in the photo sheet, but their Plant name matches no plant on the site, so they appear nowhere. In the sheet, change the Plant cell to the plant's name exactly as on the website."
            >
              <ul className="space-y-3">
                {report.unmatchedPhotos.map((p) => (
                  <Row key={p.id}>
                    <p>Plant written as “<strong>{p.plant}</strong>” · photo by {p.by}{p.date && ` · ${new Date(p.date).toLocaleDateString("en-IN")}`}</p>
                  </Row>
                ))}
              </ul>
            </Section>

            <section className="border-t border-ink/15 pt-7" aria-labelledby="progress-h">
              <h2 id="progress-h" className="font-display text-3xl font-semibold">Still to do</h2>
              <p className="mt-2 text-ink/70">Not errors: the work left before the guide is complete.</p>
              <details className="mt-4 rounded-xl bg-white p-4 ring-1 ring-ink/10">
                <summary className="cursor-pointer font-medium">{noPost.length} plants on the built-in list have no Blogger post yet</summary>
                <p className="mt-3 text-sm leading-relaxed">
                  {noPost.map((e, i) => (
                    <span key={e.slug}>{i > 0 && ", "}<Link href={`/plant/${e.slug}`} className="underline">{e.name}</Link> ({e.tag})</span>
                  ))}
                </p>
              </details>
              <details className="mt-3 rounded-xl bg-white p-4 ring-1 ring-ink/10">
                <summary className="cursor-pointer font-medium">{noPhoto.length} plants have no photo taken on campus</summary>
                <p className="mt-3 text-sm leading-relaxed">
                  {noPhoto.map((e, i) => (
                    <span key={e.slug}>{i > 0 && ", "}<Link href={`/plant/${e.slug}`} className="underline">{e.name}</Link></span>
                  ))}
                </p>
              </details>
              {openQuestions.length > 0 && (
                <details className="mt-3 rounded-xl bg-white p-4 ring-1 ring-ink/10">
                  <summary className="cursor-pointer font-medium">{openQuestions.length} open questions about plant names (for the horticulture team)</summary>
                  <ul className="mt-3 space-y-2 text-sm">
                    {openQuestions.map((sp) => (
                      <li key={sp.tag}><strong>{sp.name}</strong> ({sp.tag}): {sp.review}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-ink/60">Their scientific names stay hidden on the site until answered. Send the answers to the website team.</p>
                </details>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
