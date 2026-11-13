/** One species suggested by Pl@ntNet for a photo. */
export interface Suggestion {
  scientific: string; // "Azadirachta indica"
  genus: string;
  family: string;
  common: string[];
  score: number; // 0..1
}

export const MAX_IMAGE_BYTES = 3_500_000; // the upload page resizes photos to well under this

/**
 * Ask Pl@ntNet (https://my.plantnet.org, free for 500 identifications a day) which plant is in a photo.
 * `base64` is the image without the "data:image/jpeg;base64," prefix.
 */
export async function identifyPlant(apiKey: string, base64: string, mime = "image/jpeg"): Promise<Suggestion[]> {
  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length) throw new Error("No image received");
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Image is too large");

  const form = new FormData();
  form.append("images", new Blob([bytes], { type: mime }), "photo.jpg");
  form.append("organs", "auto");
  const params = new URLSearchParams({ "api-key": apiKey, lang: "en", "nb-results": "5", "include-related-images": "false" });
  const res = await fetch(`https://my-api.plantnet.org/v2/identify/all?${params}`, { method: "POST", body: form });

  if (res.status === 404) return []; // Pl@ntNet's answer for "no plant recognised"
  if (res.status === 429) throw new Error("Daily limit of plant identifications reached");
  if (!res.ok) throw new Error(`Pl@ntNet responded with ${res.status}`);

  const data = (await res.json()) as {
    results?: {
      score: number;
      species: {
        scientificNameWithoutAuthor: string;
        genus?: { scientificNameWithoutAuthor?: string };
        family?: { scientificNameWithoutAuthor?: string };
        commonNames?: string[];
      };
    }[];
  };
  return (data.results ?? []).slice(0, 5).map((r) => ({
    scientific: r.species.scientificNameWithoutAuthor,
    genus: r.species.genus?.scientificNameWithoutAuthor ?? r.species.scientificNameWithoutAuthor.split(" ")[0],
    family: r.species.family?.scientificNameWithoutAuthor ?? "",
    common: (r.species.commonNames ?? []).slice(0, 3),
    score: r.score,
  }));
}
