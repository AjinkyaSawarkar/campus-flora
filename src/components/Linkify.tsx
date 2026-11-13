import type { ReactNode } from "react";

// Email addresses, web addresses and phone numbers (Indian style: +91 98765 43210, 0877-2503000, 9876543210).
const TOKEN = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(https?:\/\/[^\s<>"']+)|(\+?\d[\d\s-]{8,}\d)/g;

/** Plain text with clickable emails, links and phone numbers. */
export default function Linkify({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const [whole, email, url, phone] = m;
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const cls = "underline underline-offset-2 break-words";
    if (email) out.push(<a key={at} href={`mailto:${email}`} className={cls}>{email}</a>);
    else if (url) out.push(<a key={at} href={url.replace(/[.,)]+$/, "")} target="_blank" rel="noopener noreferrer" className={cls}>{url}</a>);
    else if (phone && phone.replace(/\D/g, "").length >= 10) out.push(<a key={at} href={`tel:${phone.replace(/[\s-]/g, "")}`} className={cls}>{phone}</a>);
    else out.push(whole);
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
