# Campus Flora (IIT Tirupati)

1. `npm install`
2. Copy `.env.example` to `.env` and put a Blogger API key in `BLOGGER_API_KEY` (restrict it to the Blogger API).
3. `npm run dev` then open http://localhost:5173
4. `npm run typecheck` and `npm run build` before deploying to Vercel (add `BLOGGER_API_KEY` in the Vercel project settings).

## Where the content comes from

- **`src/content/inventory.ts`**: the master list of species planted on campus (from the horticulture
  section's list). Every species gets a page at `/plant/<name>`, even before it has photos.
  Each entry has a display name, the scientific name, other names (Telugu / Hindi / English, all searchable),
  its collections and the varieties planted. Entries with a `review` note have a question for the
  horticulture team; their scientific name is hidden on the site until it is confirmed.
- **Blogger posts** (fetched through `/api/blogger`): photos and notes. A post is attached to a species
  automatically when its title is the species name or one of its other names, or when its first line is the
  scientific name. Posts that match nothing still get their own page.
- **`src/content/site.ts`**: the 8 collections, planting numbers, About text, team and contact details.
- **`src/content/facts.ts`**: general facts for the Sprout mascot (it also picks facts about our own plants).
- **`src/lib/catalog.ts`**: `PINNED_FEATURED` = plants to always show on the home page hero.

## Writing a Blogger post

- Title: the plant's name as on the site (e.g. "Neem").
- First line: the scientific name.
- Details as `Key: value` lines (`Family: Meliaceae`). A line starting with an emoji starts a new section.
- `Location: near the main gate` shows a "Where to find it" box.
- `Flowering: March–May` lists the plant under "In flower" on the home page in those months.
- Labels: the collection (Avenue, Fruit, Sacred, Palm, Shrub, Creeper, Herb, Biodiversity) and features (Flowering, Evergreen…).

Every plant page has a "Name-tag QR code" button that prints a label linking to that page.

## Writing plant content in bulk

`content-pipeline/` collects facts from Wikipedia and Wikidata, has an LLM write the English / Telugu / Hindi
paragraphs, puts everything in a review spreadsheet and creates the Blogger posts. See `content-pipeline/README.md`.

## Photo contributions and the About page

- **Add a photo** (`/contribute`): visitors upload campus photos with a name suggestion from Pl@ntNet.
  Photos go to a Google Sheet for review. Setup and reviewing: `contributions/README.md`.
- **About page text**: in Blogger, a *Page* (not a Post) titled "About", "Team" or "Contact" replaces that
  section of the website's About page. Each has a simple line format (number boxes, team lists, contact
  boxes), described on the site's `/guide` page and parsed in `src/lib/sitePages.ts`.
- New `.env` entry: `PLANTNET_API_KEY` (optional; see `.env.example`).

## Campus map and the maintenance guide

- **Map** (`/map`, and a small map on each plant page): shows where approved community photos were taken,
  on satellite or street maps (Leaflet, free map imagery). `CAMPUS` in `src/content/site.ts` sets the
  campus centre and how far from it a photo's position may be to count as on campus.
- **Guide** (`/guide`): how the horticulture and Nisarga team add plants, edit text, approve photos,
  edit the About page and print QR tags. Linked from the footer.
