import type { TimelineEntry } from "@/content/timeline";

/** Frise verticale partagée par les pages Expérience et Formation. */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="max-w-3xl border-l border-line">
      {entries.map((entry) => (
        <li key={entry.title} className="relative pb-10 pl-8 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute -left-[5px] top-2 size-[9px] ${entry.placeholder ? "border border-dim bg-ink" : "bg-amber"}`}
          />
          <p className="font-mono text-sm text-dim">{entry.period}</p>
          <h2 className="mt-1 text-lg font-semibold">{entry.title}</h2>
          <p className="text-dim">{entry.place}</p>
          <p className="mt-2">{entry.description}</p>
        </li>
      ))}
    </ol>
  );
}
