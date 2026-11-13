import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  name: string;
  scientific?: string;
  /** Permanent tag ID ("P016"). Without one, the code points at the name-based address. */
  tag?: string;
  url: string;
  /** For plants without a tag: the ID to add to their Blogger post, and why an existing line was ignored. */
  suggestedTag?: string;
  tagProblem?: string;
}

/**
 * A printable label for the plant's name tag on campus: a QR code that opens this plant's page.
 * Shown inside a Lightbox; "Print label" prints just the label.
 */
export default function TagQR({ name, scientific, tag, url, suggestedTag, tagProblem }: Props) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#161a17", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);

  const shortUrl = url.replace(/^https?:\/\//, "");

  const print = () => {
    const w = window.open("", "_blank", "width=420,height=600");
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    const n = esc(name);
    const sci = scientific ? esc(scientific) : "";
    w.document.write(`<!doctype html><title>${n} tag</title>
      <style>body{font-family:Georgia,serif;text-align:center;padding:24px}svg{width:220px;height:220px}h1{font-size:28px;margin:12px 0 2px}p{margin:0;font-style:italic;font-size:18px}small{display:block;margin-top:10px;font:12px sans-serif;color:#555}b{font:600 13px sans-serif;letter-spacing:.08em}</style>
      ${svg}<h1>${n}</h1>${sci ? `<p>${sci}</p>` : ""}<small>Scan to learn more · Campus Flora, IIT Tirupati<br>${esc(shortUrl)}</small>${tag ? `<b>${esc(tag)}</b>` : ""}
      <script>window.onload=()=>{window.print()}</script>`);
    w.document.close();
  };

  return (
    <div className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 text-center text-ink">
      <p className="eyebrow">Name-tag QR code</p>
      <div className="mx-auto mt-4 h-56 w-56 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} aria-label={`QR code linking to ${url}`} role="img" />
      <p className="mt-3 font-display text-3xl font-semibold leading-tight">{name}</p>
      {scientific && <p className="sci text-lg text-ink/70">{scientific}</p>}
      <p className="mt-3 break-all text-xs text-ink/60">{shortUrl}</p>
      {tag && <p className="mt-1 text-sm font-semibold tracking-wider">{tag}</p>}

      {!tag && (
        <div className="mt-4 rounded-xl bg-[#fff4d6] p-3 text-left text-sm">
          {tagProblem && <p className="mb-2 text-clay">{tagProblem}</p>}
          <p>
            <strong>Before printing:</strong> add this line to the plant's Blogger post, below “📋 Details”:
          </p>
          <p className="my-2 rounded-lg bg-white px-3 py-2 font-mono">Tag ID: {suggestedTag}</p>
          <p>Then reopen this page. The code will keep working even if the plant is renamed. Without it, renaming the post breaks printed codes.</p>
        </div>
      )}
      <button type="button" onClick={print} className={`mt-5 ${tag ? "btn-dark" : "btn-line"}`}>
        {tag ? "Print label" : "Print anyway"}
      </button>
    </div>
  );
}
