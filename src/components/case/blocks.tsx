import type { ReactNode } from "react";

/**
 * Briques des études de cas, utilisables directement dans les fichiers MDX
 * (déclarées dans mdx-components.tsx). Elles lisent les couleurs de l'univers
 * du projet (`--u-*`), donc s'adaptent à chaque fiche sans réglage.
 */

type Spec = { term: string; text: string; source?: string };

/**
 * Fiche technique : un mécanisme par ligne, ce qu'il fait, et le fichier qui
 * le met en œuvre dans le dépôt du projet.
 */
export function Specs({ items }: { items: Spec[] }) {
  return (
    <dl className="border-t border-(--u-line)">
      {items.map((item) => (
        <div
          key={item.term}
          className="grid gap-1.5 border-b border-(--u-line) py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-8"
        >
          <dt className="font-mono text-xs leading-6 text-(--u-accent)">{item.term}</dt>
          <dd className="text-[15px] leading-relaxed text-(--u-text)">
            {item.text}
            {item.source ? (
              <code className="mt-1.5 block font-mono text-[11px] break-all text-(--u-dim)">
                {item.source}
              </code>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
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
