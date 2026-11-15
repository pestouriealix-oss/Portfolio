import type { ReactNode } from "react";
import { CircuitBoard } from "@/components/case/circuit-board";
import { batailleNavaleCircuit } from "@/content/architectures/bataille-navale";
import { canoeCircuit } from "@/content/architectures/canoe";
import { formatDay, GUFO_MAP_URL, gufoCircuitInput, gufoPlan } from "@/content/gufo";
import { layoutCircuit, type CircuitInput } from "@/lib/circuit";

/**
 * L'architecture d'un projet, en schéma de circuit. Chaque mise en page est
 * calculée une fois, au chargement du module, donc au build : les fiches
 * restent statiques.
 */
type Architecture = { label: string; input: CircuitInput; caption: ReactNode };

const architectures = {
  gufo: {
    label: "Architecture de Gufo",
    input: gufoCircuitInput(),
    caption: (
      <>
        <span>
          Généré depuis la carte du code de Gufo, le {formatDay(gufoPlan.generatedAt)}. Les pistes
          résument les imports et les appels réseau entre dossiers ; les tests ne sont pas
          représentés.
        </span>
        <a
          href={GUFO_MAP_URL}
          target="_blank"
          rel="noopener"
          className="text-(--u-accent) underline-offset-4 hover:underline"
        >
          Carte complète ↗
        </a>
      </>
    ),
  },
  "bataille-navale": {
    label: "Architecture de la bataille navale",
    input: batailleNavaleCircuit,
    caption: (
      <span>
        Relevé dans le dépôt : une puce par module C, une piste quand un module appelle les
        fonctions d&apos;un autre.
      </span>
    ),
  },
  canoe: {
    label: "Architecture du site de la base de canoë",
    input: canoeCircuit,
    caption: (
      <span>
        Relevé dans le dépôt : une puce par groupe de fichiers, une piste par import entre groupes ;
        les composants d&apos;interface génériques ne sont pas représentés.
      </span>
    ),
  },
} satisfies Record<string, Architecture>;

export type ArchitectureId = keyof typeof architectures;

const boards = Object.fromEntries(
  Object.entries(architectures).map(([id, a]) => [id, layoutCircuit(a.input)]),
) as Record<ArchitectureId, ReturnType<typeof layoutCircuit>>;

export function Architecture({ project }: { project: ArchitectureId }) {
  const { label, caption } = architectures[project];
  return (
    <figure className="bleed">
      <CircuitBoard board={boards[project]} label={label} />
      <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 px-1 font-mono text-[11px] text-(--u-dim)">
        {caption}
      </figcaption>
    </figure>
  );
}
