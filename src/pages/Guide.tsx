import type { ReactNode } from "react";
import { Link } from "wouter";

const sections = [
  { id: "add-plant", title: "Add a new plant" },
  { id: "edit-plant", title: "Change a plant's text" },
  { id: "photos", title: "Add photos to a plant" },
  { id: "review", title: "Review photos sent by visitors" },
  { id: "about", title: "Edit the About, Team and Contact text" },
  { id: "qr", title: "Print a QR code for a name tag" },
  { id: "developer", title: "Things that need the developer" },
];

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-ink/15 pt-8" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="mb-4 font-display text-3xl font-semibold sm:text-4xl">
        <span className="mr-3 text-ink/40">{n}</span>
        {title}
      </h2>
      <div className="guide space-y-4 text-lg leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

const Code = ({ children }: { children: ReactNode }) => <code className="rounded bg-ink/5 px-1.5 py-0.5 text-[0.92em]">{children}</code>;

/** How the horticulture and Nisarga team keep the site up to date, without a developer. */
export default function Guide() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-8">
      <p className="eyebrow">For the horticulture and Nisarga team</p>
      <h1 className="mt-2 font-display font-light leading-none [font-size:clamp(2.6rem,7vw,5rem)]">Keeping the site up to date</h1>
      <p className="mt-4 text-lg text-ink/75">
        Plant text lives in <strong>Blogger</strong>. Photos sent by visitors are checked in a <strong>Google Sheet</strong>. You need to be
        added to both by the site's owner. Changes show on the website within about five minutes.
      </p>
      <p className="mt-3 text-lg text-ink/75">
        The <Link href="/check" className="font-medium underline">content check page</Link> lists anything the website could not use as intended:
        duplicate posts, posts missing a language, photos with a wrong plant name, and so on. Look at it after adding or changing posts.
      </p>

      <nav aria-label="On this page" className="no-print mt-8 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
        <ol className="list-decimal space-y-1.5 pl-5">
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="underline underline-offset-2">{s.title}</a></li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        <Section id="add-plant" n={1} title="Add a new plant">
          <p>In Blogger, click <strong>New post</strong> and write it in this shape:</p>
          <pre className="overflow-x-auto rounded-xl bg-white p-4 text-sm leading-relaxed ring-1 ring-ink/10">{`Title:  Neem

Azadirachta indica
🌿 English
One short paragraph about the plant.
🌿 తెలుగు
The same paragraph in Telugu.
🌿 हिन्दी
The same paragraph in Hindi.
📋 Details
Family: Meliaceae
Flowering: March–April
Flower colour: White
Location: Along the road to the hostels
Tag ID: P146`}</pre>
          <ul className="list-disc space-y-2 pl-6">
            <li>The <strong>title</strong> is the plant's name. The <strong>first line</strong> is the scientific name.</li>
            <li>Lines that start with an emoji are headings. Lines written as <Code>Name: value</Code> become facts.</li>
            <li><Code>Flowering:</Code> with month names puts the plant under “In flower” on the home page in those months. <Code>Location:</Code> shows a “Where to find it” box.</li>
            <li>
              Add a <strong>label</strong> for the collection, so the plant appears in it:{" "}
              {["Avenue", "Fruit", "Sacred", "Palm", "Shrub", "Creeper", "Herb", "Biodiversity"].map((l, i) => (
                <span key={l}>{i > 0 && ", "}<Code>{l}</Code></span>
              ))}.
            </li>
            <li>Keep all labels short. Blogger refuses a post when its labels add up to more than about 200 letters.</li>
          </ul>
          <p>
            <Code>Tag ID:</Code> is the plant's permanent number for its QR label. Use the next number after the highest one in use: the{" "}
            <strong>Name-tag QR code</strong> button on a new plant's page shows which one, until it is added. Never reuse or change a tag ID.
          </p>
          <p>Click <strong>Publish</strong>. The plant gets its own page and shows up in search.</p>
        </Section>

        <Section id="edit-plant" n={2} title="Change a plant's text">
          <p>Open the plant on the website and click <strong>edit or view source</strong> at the bottom of its details. That opens its Blogger post. Edit, then click <strong>Update</strong>.</p>
          <p>Keep the shape shown above: the scientific name first, the three language headings, then the details. If a heading loses its emoji, the website no longer sees it as a heading.</p>
        </Section>

        <Section id="photos" n={3} title="Add photos to a plant">
          <p><strong>Your own photos:</strong> open the plant's Blogger post, place the cursor at the end, and use the image button to upload. They are shown first on the plant's page.</p>
          <p><strong>Photos from visitors</strong> arrive through the <Link href="/contribute" className="underline">Add a photo</Link> page and need your approval: see the next section.</p>
          <p>The picture from Wikimedia Commons that some plants start with is only a stand-in. It moves to the end as soon as a campus photo exists.</p>
        </Section>

        <Section id="review" n={4} title="Review photos sent by visitors">
          <p>Open the Google Sheet <strong>“Campus Flora contributions”</strong>, tab <strong>Submissions</strong>. Each row is one photo.</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Look at the photo and the <strong>Plant</strong> name the visitor chose.</li>
            <li>
              <strong>Name check</strong> compares it with an automatic guess: green means they agree, red means they differ, yellow means the guess was unsure.
              The guess can be wrong, so trust your own eyes.
            </li>
            <li>If the name is wrong, type the right one in the <strong>Plant</strong> cell, exactly as it is written on the website.</li>
            <li>Tick <strong>Approved</strong>. The photo appears on the plant's page with the visitor's name, and its position appears on the <Link href="/map" className="underline">campus map</Link>.</li>
          </ol>
          <ul className="list-disc space-y-2 pl-6">
            <li>To take a photo off the website, untick <strong>Approved</strong>.</li>
            <li>The <strong>Campus Flora</strong> menu at the top can group photos by plant or show only those waiting for review.</li>
            <li>Do not approve photos that show people's faces, or that are blurred or copied from the internet.</li>
            <li>Positions of red sanders and sandalwood are never shown on the website, even when approved.</li>
          </ul>
        </Section>

        <Section id="about" n={5} title="Edit the About, Team and Contact text">
          <p>
            In Blogger, open <strong>Pages</strong> in the left menu (not Posts). Create a page titled <strong>About</strong>, <strong>Team</strong> or{" "}
            <strong>Contact</strong>, write it in the shape shown below, and publish. Write each item on its own line. Text that does not follow
            the shape is still shown, as ordinary paragraphs.
          </p>

          <h3 className="pt-2 font-display text-2xl font-semibold">About page</h3>
          <pre className="overflow-x-auto rounded-xl bg-white p-4 text-sm leading-relaxed ring-1 ring-ink/10">{`Native tree saplings planted: 5,200
Flowering shrubs planted: 2,25,000
Ground-cover plants planted: 1,50,000

We planted 5,200 native tree saplings ... (any paragraphs you like)`}</pre>
          <ul className="list-disc space-y-2 pl-6">
            <li>A line with a <strong>number after the colon</strong> becomes a number box, on the About page and on the home page. Change the number to update it; add a line for a new box.</li>
            <li>The <strong>“species in this guide”</strong> box counts the plants on the website by itself, including plants added as new posts. Nothing to update.</li>
          </ul>

          <h3 className="pt-2 font-display text-2xl font-semibold">Team page</h3>
          <pre className="overflow-x-auto rounded-xl bg-white p-4 text-sm leading-relaxed ring-1 ring-ink/10">{`Horticulture head
[photo]
Name: Dr. A. Kumar
Designation: Assistant Engineer (Horticulture)
Email: horticulture@iittp.ac.in
Phone: +91 98765 43210

Gardeners
Ramesh – Avenue trees
Suresh – Hostel zone
Lakshmi

Website team
Your Name – Design and development`}</pre>
          <ul className="list-disc space-y-2 pl-6">
            <li>The three heading lines must be written exactly: <Code>Horticulture head</Code>, <Code>Gardeners</Code>, <Code>Website team</Code>.</li>
            <li>One person per line. What comes after the dash (–) is shown under the name; it can be left out.</li>
            <li>For photos, insert a picture with Blogger's image button on the line <strong>just above</strong> that person's name (or above “Name:” for the head).</li>
          </ul>

          <h3 className="pt-2 font-display text-2xl font-semibold">Contact page</h3>
          <pre className="overflow-x-auto rounded-xl bg-white p-4 text-sm leading-relaxed ring-1 ring-ink/10">{`Questions about a plant or this website? Write to us.

Box: Nisarga club
Email: nisarga@iittp.ac.in
Instagram: https://instagram.com/...

Box: Horticulture section
Email: horticulture@iittp.ac.in
Phone: 0877-2503000`}</pre>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              A line starting with <Code>Box:</Code> opens a white box; the rest of that line is its title. Every line after it goes into that box until
              the next <Code>Box:</Code> line.
            </li>
            <li>Text above the first box is shown above the boxes. Email addresses, phone numbers and web links become clickable by themselves.</li>
          </ul>
        </Section>

        <Section id="qr" n={6} title="Print a QR code for a name tag">
          <p>Open the plant on the website and click <strong>Name-tag QR code</strong>, then <strong>Print label</strong>. Scanning the code opens that plant's page.</p>
          <p>
            Each code contains the plant's permanent tag ID (for example <Code>/p/P016</Code> for Neem), so it keeps working even if the plant is renamed.
            The ID is also printed under the code, so a faded tag can still be identified.
          </p>
          <p>
            <strong>New plants added in Blogger</strong> need a <Code>Tag ID:</Code> line in their post first (see section 1). Until then the QR window shows
            a yellow note with the number to add.
          </p>
        </Section>

        <Section id="developer" n={7} title="Things that need the developer">
          <ul className="list-disc space-y-2 pl-6">
            <li>Renaming a plant that is on the built-in list of campus species, or correcting its scientific name there.</li>
            <li>Adding, renaming or removing a collection.</li>
            <li>Changing which plants have their position hidden.</li>
            <li>Giving a new person access to Blogger or to the review sheet (the owner of those accounts does this).</li>
            <li>The website stops showing new posts or photos for more than an hour.</li>
          </ul>
        </Section>
      </div>

      <p className="no-print mt-12 text-center">
        <button type="button" onClick={() => window.print()} className="btn-line">Print this guide</button>
      </p>
    </div>
  );
}
