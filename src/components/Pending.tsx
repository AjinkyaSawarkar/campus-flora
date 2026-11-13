export default function Pending({ what }: { what: string }) {
  return <p className="rounded-lg border border-dashed border-forest/30 p-4 text-sm text-ink/70">{what} will be added soon.</p>;
}
