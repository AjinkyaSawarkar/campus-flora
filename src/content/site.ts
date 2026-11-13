import type { CollectionId } from "./inventory";

export interface Category {
  id: CollectionId;
  title: string;
  blurb: string;
  /** Local cover photo in public/categories/. */
  image: string;
  /**
   * Blogger labels ("tags") that put a post in this collection. A post belongs to a collection when
   * one of its labels contains the tag as a whole word (case-insensitive, plural allowed).
   * Posts for plants in the inventory are placed by the inventory; tags matter for the rest.
   */
  tags: string[];
}

// The 8 collections, in the order of the horticulture list.
// "Fruit bearing trees" is part of the Biodiversity plantation (with "Timber trees"), as in the list.
export const categories: Category[] = [
  { id: "avenue-trees", title: "Avenue Trees", blurb: "Shade and flowering trees that line the campus roads.", image: "/categories/avenue-trees.webp", tags: ["avenue"] },
  { id: "fruit-trees", title: "Fruit Trees", blurb: "Orchard trees that bear edible fruit.", image: "/categories/fruit-trees.webp", tags: ["fruit"] },
  { id: "sacred-medicinal", title: "Sacred & Medicinal Trees", blurb: "Trees with religious significance or medicinal value.", image: "/categories/sacred-medicinal.webp", tags: ["sacred"] },
  { id: "palms-specimen", title: "Palms & Specimen Plants", blurb: "Decorative palms and striking specimen plants.", image: "/categories/palms-specimen.webp", tags: ["palm"] },
  { id: "shrubs-ground-covers", title: "Shrubs & Ground Covers", blurb: "Flowering shrubs, hedges and plants that carpet the ground.", image: "/categories/shrubs-ground-covers.webp", tags: ["shrub"] },
  { id: "creepers", title: "Creepers", blurb: "Climbers and vines that grow along walls and pergolas.", image: "/categories/creepers.webp", tags: ["creeper"] },
  { id: "medicinal-aromatic", title: "Medicinal Herbs", blurb: "Small herbs with medicinal properties or pleasant aromas.", image: "/categories/medicinal-aromatic.webp", tags: ["aromatic", "herb"] },
  { id: "biodiversity", title: "Biodiversity Plantation", blurb: "Native timber and wild fruit trees planted to support local wildlife.", image: "/categories/biodiversity.webp", tags: ["biodiversity", "bearing"] },
];

/** Sub-lists shown as sections inside a collection page. */
export const GROUPS: Record<string, string> = { timber: "Timber trees", "wild-fruit": "Wild fruit-bearing trees" };

/** Old collection links that should land somewhere sensible. */
export const COLLECTION_REDIRECTS: Record<string, string> = { "fruit-bearing": "biodiversity" };

export const navItems = [
  // `short` is the label on phone screens, where the full menu would not fit.
  { label: "Collections", href: "/flora" },
  { label: "All plants", short: "Plants", href: "/flora/all" },
  { label: "Map", href: "/map" },
  { label: "Add a photo", short: "Add photo", href: "/contribute" },
  { label: "About", href: "/about" },
];

/**
 * Photo uploads. Paste the "Web app URL" of the contributions Google Sheet's script here
 * (it looks like https://script.google.com/macros/s/…/exec; see contributions/README.md).
 * Leave empty to switch uploads off. The address is not a secret.
 */
/**
 * Once a plant has this many photos on the site, the Add a photo page tells visitors it has enough
 * and points them to plants that still need photos. They can still send one.
 */
export const ENOUGH_PHOTOS = 7;

export const CONTRIBUTIONS_URL = "https://script.google.com/macros/s/AKfycbzPfZ3RGt-Z6Xvy8iLpD3TFwEJ_dCtKPSZiLLBFZi859gMGgGihX_1X5DkiOw6xC1vReQ/exec";
//https://script.google.com/macros/s/AKfycbyfALsLIuiD697LWNncjiBlnFPV6m0ZA5EP6hvyY9f77k8WIr1n0qTQn_05GvojwQUiGg/exec

/**
 * Where the campus is, for the map. `radiusKm` is how far from this point a photo's location may be
 * and still count as "on campus"; positions further away are ignored (someone uploading from home).
 */
export const CAMPUS = { lat: 13.7144, lng: 79.5953, radiusKm: 3 };

// From the horticulture section's planting report.
// Used until the Blogger page "About" has lines like "Native tree saplings planted: 5,200".
export const plantingStats = [
  { value: "5,200", label: "Native tree saplings planted" },
  { value: "2,25,000", label: "Flowering shrubs planted" },
  { value: "1,50,000", label: "Ground-cover plants planted" },
];

export const horticultureIntro = [
  "We planted 5,200 native tree saplings, 2,25,000 flowering shrubs and 1,50,000 ground cover plants on campus. These flowering species, chosen for their medicinal value and ability to enhance local biodiversity, were placed along roadways, near residential areas, in the administration and academic zones, and around hostels.",
  "By thriving in our local ecosystem, they create a sustainable environment that benefits both humans and wildlife. As they grow, these plants will provide shade and beauty, and the flowering species will attract pollinators, supporting a vital link in our ecosystem.",
  "Looking ahead, we aim to expand this initiative further, increasing the number of saplings planted every year and exploring partnerships with local environmental organisations.",
];

// Campus facts shown with the master plan on the About page
// (source: iittp.ac.in About Us / Permanent Campus pages, IIT Tirupati newsletter Samvid).
export const campusFacts = [
  { value: "548.3 acres", label: "Permanent campus, Merlapaka village, Yerpedu" },
  { value: "22 km", label: "from Tirupati town, on the Yerpedu–Venkatagiri road" },
  { value: "2 lakes", label: "about 10 acres, storing rainwater" },
  { value: "Eastern Ghats", label: "at the foothills of the Seshachalam range" },
];

// ---- To be filled in later ------------------------------------------------
export interface Person { name: string; role?: string; photo?: string }

export const horticulture = {
  head: { name: "", designation: "", email: "", photo: "" },
  gardeners: [] as Person[],
};

export const nisarga = { email: "" };

export const developers: Person[] = [];
