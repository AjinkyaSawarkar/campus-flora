import { useEffect, useState } from "react";
import { sized } from "../lib/plants";

/** Full-screen photo browser (inside a Lightbox). Arrow keys and buttons move between photos. */
export default function PlantViewer({ title, images, start = 0 }: { title: string; images: string[]; start?: number }) {
  const n = images.length;
  const [i, setI] = useState(Math.min(start, Math.max(n - 1, 0)));
  const go = (d: number) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (n < 2) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full w-full max-w-5xl flex-col gap-3">
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {n > 0 ? (
          <img src={sized(images[i], 1600)} alt={`${title}, photo ${i + 1} of ${n}`} className="max-h-full max-w-full rounded-lg object-contain" />
        ) : (
          <p className="text-white">No photos for this plant yet.</p>
        )}
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-0 rounded-full bg-white/90 px-4 py-3 text-xl text-forest hover:bg-white">‹</button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-0 rounded-full bg-white/90 px-4 py-3 text-xl text-forest hover:bg-white">›</button>
          </>
        )}
      </div>
      <p className="font-display text-2xl text-white">
        {title}
        {n > 1 && <span className="ml-3 font-sans text-sm opacity-80">{i + 1} / {n}</span>}
      </p>
    </div>
  );
}
