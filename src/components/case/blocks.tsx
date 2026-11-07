import type { ReactNode } from "react";

/**
 * Briques des études de cas, utilisables directement dans les fichiers MDX
 * (déclarées dans mdx-components.tsx). Elles lisent les couleurs de l'univers
 * du projet (`--u-*`), donc s'adaptent à chaque fiche sans réglage.
 */

type PitchItem = { label: string; title: string; text: string };

/** Le problème, la question, la réponse : trois cartes en tête de fiche. */
export function Pitch({ items }: { items: PitchItem[] }) {
  return (
    <div className="mt-14! grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <section key={item.label} className="glass lift reveal rounded-3xl p-6 sm:p-7">
          <p className="font-mono text-xs text-(--u-accent)">{item.label}</p>
          <h3 className="case-title mt-2.5 text-2xl leading-tight font-semibold tracking-[-0.025em]">
            {item.title}
          </h3>
          <p className="mt-3 text-(--u-dim)">{item.text}</p>
        </section>
      ))}
    </div>
  );
}

type Figure = { value: string; label: string; accent?: boolean };

/** Les chiffres mesurés du projet, avec leur source. Jamais d'estimation ici. */
export function Figures({ items, source }: { items: Figure[]; source: string }) {
  return (
    <figure>
      <dl className="grid gap-px overflow-hidden rounded-3xl border border-(--u-line) bg-(--u-line) sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-(--u-bg) p-6 sm:p-7">
            <dd
              className="figure-value text-5xl leading-none font-[650] tracking-[-0.04em]"
              style={item.accent ? { color: "var(--u-accent)" } : undefined}
            >
              {item.value}
            </dd>
            <dt className="mt-3 text-(--u-dim)">{item.label}</dt>
          </div>
        ))}
      </dl>
      <figcaption className="mt-3 font-mono text-[11px] text-(--u-dim)">{source}</figcaption>
    </figure>
  );
}

type FlowStep = { title: string; text: string; highlight?: boolean };

/** Une chaîne d'étapes de gauche à droite (elle passe à la ligne sur téléphone). */
export function Flow({ steps, label }: { steps: FlowStep[]; label: string }) {
  return (
    <div>
      <ol aria-label={label} className="flex flex-wrap items-stretch gap-2.5">
        {steps.map((step, i) => (
          <li key={step.title} className="flex min-w-[170px] flex-1 items-stretch gap-2.5">
            <div
              className="flex-1 rounded-2xl border p-4"
              style={
                step.highlight
                  ? {
                      borderColor: "color-mix(in srgb, var(--u-accent) 45%, transparent)",
                      background: "color-mix(in srgb, var(--u-accent) 8%, transparent)",
                    }
                  : { borderColor: "var(--u-line)", background: "var(--u-surface)" }
              }
            >
              <p
                className="font-mono text-[11px]"
                style={{ color: step.highlight ? "var(--u-accent)" : "var(--u-dim)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1.5 font-bold text-(--u-text)">{step.title}</p>
              <p className="mt-1 text-sm text-(--u-dim)">{step.text}</p>
            </div>
            {i < steps.length - 1 ? (
              <span aria-hidden="true" className="self-center font-mono text-(--u-accent)">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

type Choice = { tag: string; title: string; text: string };

/** Les choix d'ingénieur, rangés par thème (sécurité, coût, fiabilité…). */
export function Choices({ items }: { items: Choice[] }) {
  return (
    <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <section
          key={item.title}
          className="lift reveal rounded-[20px] border border-(--u-line) bg-(--u-surface) p-6"
        >
          <p className="font-mono text-xs text-(--u-accent)">{item.tag}</p>
          <h3 className="mt-2 text-lg leading-snug font-bold text-(--u-text)">{item.title}</h3>
          <p className="mt-2 text-[15px] text-(--u-dim)">{item.text}</p>
        </section>
      ))}
    </div>
  );
}

/*
 * Note et légende sont des `div` : écrit sur plusieurs lignes dans le MDX, leur
 * texte arrive déjà enveloppé dans un paragraphe, et un <p> ne peut pas en contenir un autre.
 */

/** Petite mention en fin de fiche (crédits, mentions légales). */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-20! max-w-3xl border-t border-(--u-line) pt-6 text-[13px] text-(--u-dim)">
      {children}
    </div>
  );
}

/** Légende sous une démo ou un schéma. */
export function Caption({ children }: { children: ReactNode }) {
  return <div className="mt-3! font-mono text-[11px] text-(--u-dim)">{children}</div>;
}
