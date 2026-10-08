import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { timeline } from "@/content/timeline";

export const metadata: Metadata = {
  title: "Parcours",
  description: "Formation, expériences et engagement d'Alix-Pierre Pestourie.",
  alternates: { canonical: "/parcours" },
};

export default function TimelinePage() {
  return (
    <>
      <PageHeader title="Parcours" command="journalctl --since 2019 --reverse">
        Formation, expériences et engagement, du plus récent au plus ancien.
      </PageHeader>

      <div className="grid max-w-3xl gap-16">
        {timeline.map((section) => (
          <section key={section.title}>
            <h2 className="mb-8 font-mono text-sm font-semibold text-amber">{section.title}</h2>
            <ol className="border-l border-line">
              {section.entries.map((entry) => (
                <li key={entry.title} className="relative pb-10 pl-8 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[5px] top-2 size-[9px] ${entry.placeholder ? "border border-dim bg-ink" : "bg-amber"}`}
                  />
                  <p className="font-mono text-sm text-dim">{entry.period}</p>
                  <h3 className="mt-1 text-lg font-semibold">{entry.title}</h3>
                  <p className="text-dim">{entry.place}</p>
                  <p className="mt-2">{entry.description}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
