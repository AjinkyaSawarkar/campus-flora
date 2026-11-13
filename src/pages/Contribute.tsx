import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearch } from "wouter";
import { matches, norm, useCatalog, type Entry } from "../lib/catalog";
import { ENOUGH_PHOTOS } from "../content/site";
import { seededRandom } from "../lib/flora";
import { onCampus } from "../lib/geo";
import { identify, matchSuggestions, preparePhoto, submitPhoto, uploadsEnabled, type Match, type PreparedPhoto } from "../lib/contributions";

const NAME_KEY = "cf-contributor";
const NOT_SURE = "Not sure";
const field = "w-full rounded-xl bg-white px-4 py-3 text-base ring-1 ring-ink/15 outline-none focus:ring-2 focus:ring-forest";

/** Photos taken on campus (Blogger and approved uploads), not the Wikimedia stand-in. */
const campusPhotos = (e: Entry) => e.images.filter((u) => !u.includes("wikimedia.org")).length;

function PhotoTips({ open }: { open: boolean }) {
  return (
    <details open={open} className="group mb-5 rounded-xl bg-paper p-4 ring-1 ring-ink/10">
      <summary className="cursor-pointer select-none font-medium marker:text-ink/40">What makes a good photo</summary>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <figure>
          <img src="/examples/good-photo.webp" alt="Sharp close-up of Harshingar: white flowers with orange centres, buds and leaves" className="aspect-[7/6] w-full rounded-lg object-cover ring-4 ring-moss" loading="lazy" />
          <figcaption className="mt-1.5 text-sm"><span className="font-semibold text-moss">✓ Good:</span> close, sharp, flowers and leaves clearly visible</figcaption>
        </figure>
        <figure>
          <img src="/examples/blurry-photo.webp" alt="The same photo, blurred" className="aspect-[7/6] w-full rounded-lg object-cover ring-4 ring-clay/60" loading="lazy" />
          <figcaption className="mt-1.5 text-sm"><span className="font-semibold text-clay">✗ Avoid:</span> blurry or shaky, nothing can be recognised</figcaption>
        </figure>
      </div>
      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <ul className="space-y-1.5">
          <li>✓ Come close to the flowers, leaves, fruit or bark</li>
          <li>✓ Keep the plant in focus: tap it on your screen before taking the photo</li>
          <li>✓ Take it in daylight, with one plant in the picture</li>
          <li>✓ Show what makes this plant different: its flowers, fruit or leaf shape</li>
        </ul>
        <ul className="space-y-1.5">
          <li>✗ A whole tree from far away (unless that is its best feature)</li>
          <li>✗ Dark, blurry or zoomed-in-too-much photos</li>
          <li>✗ People's faces</li>
          <li>✗ Photos from the internet: only photos you took on campus</li>
        </ul>
      </div>
    </details>
  );
}

type Place = { state: "idle" | "asking" | "denied" | "unavailable" } | { state: "ok"; lat: number; lng: number; accuracy: number };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-ink/10 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 font-display text-2xl font-semibold">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest font-sans text-sm font-semibold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Contribute() {
  const { entries } = useCatalog();
  const wanted = new URLSearchParams(useSearch()).get("plant") ?? "";
  const fileInput = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState<Match[] | null>(null); // null = not asked yet
  const [plant, setPlant] = useState("");
  const [place, setPlace] = useState<Place>({ state: "idle" });
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      /* no saved name */
    }
  }, []);
  // Arriving from a plant page: that plant is already chosen.
  useEffect(() => {
    const e = entries.find((x) => x.slug === wanted);
    if (e) setPlant((p) => p || e.name);
  }, [entries, wanted]);

  const chosen: Entry | undefined = useMemo(() => {
    const k = norm(plant);
    return k ? entries.find((e) => norm(e.name) === k) ?? entries.find((e) => e.aka.some((a) => norm(a) === k)) : undefined;
  }, [plant, entries]);
  const typedHints = useMemo(
    () => (plant.trim().length >= 2 && !chosen && plant !== NOT_SURE ? entries.filter((e) => matches(e, plant)).slice(0, 6) : []),
    [plant, chosen, entries],
  );

  // How many photos the chosen plant already has, and plants that need photos more.
  const have = chosen ? campusPhotos(chosen) : 0;
  const enough = !!chosen && have >= ENOUGH_PHOTOS;
  const needPhotos = useMemo(() => {
    if (!enough || !chosen) return [];
    // Shuffled differently each day, so visitors are not all sent to the same few plants.
    const rand = seededRandom();
    const none = entries
      .filter((e) => e.inInventory && campusPhotos(e) === 0)
      .map((e) => [rand(), e] as const)
      .sort((x, y) => x[0] - y[0])
      .map(([, e]) => e);
    const sameCollection = none.filter((e) => e.collections.some((c) => chosen.collections.includes(c)));
    return [...sameCollection, ...none.filter((e) => !sameCollection.includes(e))].slice(0, 6);
  }, [enough, chosen, entries]);

  const top = found?.[0];
  const confident = !!top && top.suggestion.score >= 0.3;
  const disagrees = confident && !!chosen && top!.entry !== chosen;

  const askPlace = () => {
    if (!("geolocation" in navigator)) return setPlace({ state: "unavailable" });
    setPlace({ state: "asking" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setPlace({ state: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) }),
      (err) => setPlace({ state: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setPhotoError("");
    setFound(null);
    setDone(false);
    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      if (place.state === "idle") askPlace();
      setLooking(true);
      const suggestions = await identify(prepared.base64);
      setFound(matchSuggestions(suggestions, entries));
    } catch (e) {
      setPhotoError((e as Error).message);
    } finally {
      setLooking(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setFound(null);
    setPlant("");
    setNote("");
    setPlace({ state: "idle" });
    setDone(false);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!photo) return setError("Please add a photo first.");
    if (!plant.trim()) return setError("Please choose the plant, or tap “Not sure”.");
    if (!name.trim()) return setError("Please enter your name, so we can credit you.");
    if (!consent) return setError("Please tick the permission box.");
    setError("");
    setSending(true);
    try {
      await submitPhoto({
        plant: chosen?.name ?? plant.trim(),
        name: name.trim(),
        note: note.trim(),
        consent,
        image: photo.base64,
        ...(place.state === "ok" && onCampus(place.lat, place.lng) ? { lat: place.lat, lng: place.lng, accuracy: place.accuracy } : {}),
        aiName: top ? `${top.entry?.name ? top.entry.name + " – " : ""}${top.suggestion.scientific}` : undefined,
        aiScore: top?.suggestion.score,
        aiMatch: !top ? "none" : !confident || !chosen ? "unsure" : disagrees ? "different" : "agrees",
      });
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {
        /* name not remembered */
      }
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (!uploadsEnabled()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl font-semibold">Add a photo</h1>
        <p className="mt-4 text-ink/70">Photo uploads are not switched on yet. Please check back soon.</p>
        <Link href="/flora/all" className="btn-dark mt-8">Browse the plants</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss text-3xl text-white" aria-hidden="true">✓</p>
        <h1 className="mt-6 font-display text-5xl font-semibold">Thank you{name ? `, ${name.split(" ")[0]}` : ""}!</h1>
        <p className="mt-4 text-lg text-ink/75">
          Your photo{chosen ? ` of ${chosen.name}` : ""} has been sent. It will appear on the site with your name once a reviewer has checked it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-dark">Add another photo</button>
          {chosen && <Link href={`/plant/${chosen.slug}`} className="btn-line">Back to {chosen.name}</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-10 sm:px-8">
      <h1 className="font-display font-light leading-none [font-size:clamp(2.6rem,8vw,5rem)]">Add a photo</h1>
      <p className="mt-3 text-lg text-ink/75">
        Help us photograph every plant on campus. Stand next to the plant, take a clear photo of its leaves, flowers or fruit, and send it here.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <Step n={1} title="The photo">
          <PhotoTips open={!photo} />
          <input ref={fileInput} id="photo" type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          {photo ? (
            <div className="flex items-start gap-4">
              <img src={photo.previewUrl} alt="Your photo" className="h-36 w-36 rounded-xl object-cover" />
              <label htmlFor="photo" className="btn-line cursor-pointer">Change photo</label>
            </div>
          ) : (
            <label htmlFor="photo" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink/25 px-4 py-10 text-center hover:border-forest">
              <span className="btn-dark">Take or choose a photo</span>
              <span className="text-sm text-ink/60">One plant per photo. Close-ups of leaves or flowers work best.</span>
            </label>
          )}
          {photoError && <p role="alert" className="mt-3 text-clay">{photoError}</p>}
        </Step>

        <Step n={2} title="Which plant is it?">
          <div aria-live="polite">
            {looking && <p className="mb-3 text-sm text-ink/60">Looking at your photo…</p>}
            {found && found.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-ink/70">This photo looks like:</p>
                <ul className="flex flex-wrap gap-2">
                  {found.filter((m, k) => k === 0 || m.suggestion.score >= 0.1).slice(0, 3).map((m) => {
                    const pct = `${Math.round(m.suggestion.score * 100)}%`;
                    return m.entry ? (
                      <li key={m.suggestion.scientific}>
                        <button
                          type="button"
                          onClick={() => setPlant(m.entry!.name)}
                          aria-pressed={chosen === m.entry}
                          className={`rounded-full px-4 py-2 text-left text-sm ring-1 transition-colors ${chosen === m.entry ? "bg-forest text-white ring-forest" : "bg-paper ring-ink/15 hover:ring-forest"}`}
                        >
                          <strong className="font-semibold">{m.entry.name}</strong>
                          <span className="opacity-70"> · {pct}{m.exact ? "" : " (similar)"}</span>
                        </button>
                      </li>
                    ) : (
                      <li key={m.suggestion.scientific} className="rounded-full bg-ink/5 px-4 py-2 text-sm text-ink/70">
                        <span className="sci">{m.suggestion.scientific}</span> · {pct} · not on our list
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-xs text-ink/50">Suggestions by Pl@ntNet. They can be wrong; choose what you believe is right.</p>
              </div>
            )}
            {found && found.length === 0 && photo && <p className="mb-3 text-sm text-ink/60">No automatic suggestion for this photo. Please choose the plant below.</p>}
          </div>

          <label htmlFor="plant" className="mb-1.5 block text-sm font-medium">Plant name</label>
          <input
            id="plant"
            type="text"
            value={plant}
            onChange={(e) => setPlant(e.target.value)}
            placeholder="Type a name: Neem, Vepa, Bougainvillea…"
            autoComplete="off"
            className={field}
          />
          {typedHints.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {typedHints.map((e) => (
                <li key={e.slug}>
                  <button type="button" onClick={() => setPlant(e.name)} className="rounded-full bg-paper px-3 py-1.5 text-sm ring-1 ring-ink/15 hover:ring-forest">
                    {e.name}
                    {e.scientific && <span className="sci ml-1.5 text-ink/60">{e.scientific}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {chosen && <span className="text-moss">✓ {chosen.name}{chosen.scientific && <span className="sci text-ink/60"> · {chosen.scientific}</span>}</span>}
            {plant.trim() && !chosen && plant !== NOT_SURE && typedHints.length === 0 && (
              <span className="text-ink/60">Not on our list. You can still send it; a reviewer will check.</span>
            )}
            {plant !== NOT_SURE && <button type="button" onClick={() => setPlant(NOT_SURE)} className="underline underline-offset-2">I'm not sure</button>}
          </div>
          {chosen && !enough && (
            <p className="mt-3 text-sm text-ink/70">
              {have === 0
                ? `${chosen.name} has no photos yet. Yours could be the first!`
                : `${chosen.name} has ${have} ${have === 1 ? "photo" : "photos"} on the site so far.`}
            </p>
          )}
          {enough && (
            <div className="mt-3 rounded-xl bg-[#fff4d6] p-4 text-sm">
              <p>
                <strong>{chosen!.name} already has {have} photos</strong>, which is enough. Send yours only if it shows something new, such as its
                flowers or fruit.
              </p>
              {needPhotos.length > 0 && (
                <>
                  <p className="mt-3">These plants have no photos yet. Seen one of them? A photo of it helps much more:</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {needPhotos.map((e) => (
                      <li key={e.slug}>
                        <button type="button" onClick={() => setPlant(e.name)} className="rounded-full bg-white px-3 py-1.5 ring-1 ring-ink/15 hover:ring-forest">
                          {e.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          {disagrees && (
            <p className="mt-3 rounded-xl bg-[#fff4d6] p-3 text-sm">
              The photo looks more like <strong>{top!.entry?.name ?? top!.suggestion.scientific}</strong> than {chosen!.name}.{" "}
              {top!.entry && <button type="button" className="font-medium underline" onClick={() => setPlant(top!.entry!.name)}>Switch to {top!.entry.name}</button>}
              {top!.entry ? " or keep your choice if you are sure." : " Keep your choice if you are sure."}
            </p>
          )}
        </Step>

        <Step n={3} title="Where is it?">
          {place.state === "ok" && !onCampus(place.lat, place.lng) ? (
            <p className="text-ink/75">
              You seem to be away from campus right now, so no location will be sent with this photo. The photo itself is still welcome.
            </p>
          ) : place.state === "ok" ? (
            <p className="text-moss">
              ✓ Location saved (within about {place.accuracy} m).{" "}
              <button type="button" onClick={() => setPlace({ state: "denied" })} className="text-ink/60 underline">Remove</button>
            </p>
          ) : (
            <>
              <p className="mb-3 text-ink/75">
                {place.state === "asking" && "Finding your location…"}
                {place.state === "idle" && "If you are standing at the plant, share your location so others can find it."}
                {place.state === "denied" && "No location will be sent. That's fine if you are not at the plant right now."}
                {place.state === "unavailable" && "Your location could not be found. You can send the photo without it."}
              </p>
              {place.state !== "asking" && <button type="button" onClick={askPlace} className="btn-line">Use my current location</button>}
            </>
          )}
          <p className="mt-3 text-xs text-ink/50">Only the plant's position is kept. Location data inside the photo itself is removed before upload.</p>
        </Step>

        <Step n={4} title="About you">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Your name (shown as photo credit)</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className={field} />
          <label htmlFor="note" className="mb-1.5 mt-4 block text-sm font-medium">Note for the reviewer <span className="font-normal text-ink/50">(optional)</span></label>
          <input id="note" type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. behind the library, in flower now" className={field} />
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-forest" />
            <span className="text-sm leading-relaxed">I took this photo myself and allow Campus Flora (IIT Tirupati) to show it on the website with my name as credit.</span>
          </label>
        </Step>

        {error && <p role="alert" className="rounded-xl bg-clay/10 p-4 text-clay">{error}</p>}
        <button type="submit" disabled={sending} className="btn-dark w-full py-4 text-base disabled:opacity-60">
          {sending ? "Sending…" : "Send photo for review"}
        </button>
      </form>
    </div>
  );
}
