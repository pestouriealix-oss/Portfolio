import type { TimelineEntry } from "@/content/timeline";

/** Frise verticale partagée par les pages Expérience et Formation : une carte de verre par étape. */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative max-w-3xl space-y-4 pl-8 before:absolute before:top-3 before:bottom-3 before:left-[5px] before:w-px before:bg-line">
      {entries.map((entry) => (
        <li key={entry.title} className="reveal relative">
          <span
            aria-hidden="true"
            className={`absolute top-7 -left-8 size-[11px] rounded-full ${
              entry.placeholder
                ? "border border-dim bg-ink"
                : "bg-amber shadow-[0_0_16px_#ffb45488]"
            }`}
          />
          <div className="glass lift rounded-3xl p-6 sm:p-7">
            <p className="font-mono text-xs text-amber">{entry.period}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{entry.title}</h2>
            <p className="text-dim">{entry.place}</p>
            <p className="mt-3 text-[#c9cfe3]">{entry.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
