# Photo contributions: setup and reviewing

Visitors add photos on the website's **Add a photo** page. Each photo is saved in a Google Drive folder and
listed in a Google Sheet. A reviewer ticks **Approved** in the sheet, and the photo then appears on the
plant's page with the contributor's name.

```
Add a photo page ──► Google Apps Script ──► Drive folder "Campus Flora uploads"
   (website)            (Code.gs)       └─► Sheet tab "Submissions"  ──(Approved ✓)──► website
```

## Setup (about 10 minutes, once)

1. Open <https://sheets.new> in the Google account that should own the photos. Name the sheet
   "Campus Flora contributions".
2. In the sheet: **Extensions → Apps Script**. Delete the sample code, paste everything from `Code.gs`
   (in this folder), and click **Save**.
3. In the toolbar choose the function **setup** and click **Run**. Google asks for permission. It will say
   "Google hasn't verified this app": that is normal for your own script. Click **Advanced → Go to … (unsafe)**
   and allow. The sheet now has a "Submissions" tab, a "Summary" tab and a "Campus Flora" menu.
4. Click **Deploy → New deployment**, choose type **Web app**, and set
   **Execute as: Me** and **Who has access: Anyone**. Click **Deploy** and copy the **Web app URL**
   (it ends in `/exec`).
5. Paste that URL into `src/content/site.ts`:
   `export const CONTRIBUTIONS_URL = "https://script.google.com/macros/s/…/exec";`
   Then deploy the website again.
6. Name suggestions (optional but recommended): create a free account at <https://my.plantnet.org>, create
   an API key, and add `PLANTNET_API_KEY=…` to the website's `.env` file and to the Vercel project's
   Environment Variables. Leave "expose my API key" unticked. The free plan covers 500 photos a day.
7. Share the sheet (Editor access) with the people who will review photos.

## Reviewing photos

- Each row shows the photo, the plant name the contributor chose, and what Pl@ntNet thought it was.
  **Name check** is green when they agree, red when they differ, yellow when the suggestion was unsure.
- Tick **Approved** to publish the photo. It appears on the website within a few minutes. Untick to remove it.
- **Wrong name?** Correct the **Plant** cell before approving. Use the plant's name exactly as on the website
  (a name from its "Also called" list also works). Photos whose plant name is not on the site are not shown.
- **Campus Flora menu:** "Group by plant" puts all photos of the same plant together, "Show only photos
  waiting for review" hides the approved ones.
- To delete a photo completely, delete its row and delete the file in the Drive folder "Campus Flora uploads".
- The **Summary** tab counts uploads and approved photos per plant.

## Good to know

- Locations of **Red Sanders** and **Sandalwood** are stored in the sheet but never sent to the website
  (poaching risk). Edit `HIDE_LOCATION` at the top of `Code.gs` to change the list.
- Photos are shared as "anyone with the link can view", which is what lets the sheet and the website show
  them. Unapproved photos are not linked from anywhere public.
- The website shows photos straight from Google Drive. Google does not officially support this for
  websites; if photos ever load slowly or stop loading, the storage can be moved to an image host.
- **After changing `Code.gs`:** Deploy → Manage deployments → edit (pencil) → Version: **New version** →
  Deploy. The URL stays the same.
- **Moving to another Google account later** (for example Nisarga's): make a copy of the sheet from that
  account, repeat steps 2–5 there, and move the Drive folder's photos into the new account's folder.
