import { CircuitBoard } from "@/components/case/circuit-board";
import { formatDay, GUFO_MAP_URL, gufoCircuitInput, gufoPlan } from "@/content/gufo";
import { layoutCircuit } from "@/lib/circuit";

/**
 * L'architecture de Gufo, en schéma de circuit. Mise en page calculée une fois,
 * au build, depuis la carte du code (src/content/gufo/plan.json) : quand Gufo
 * évolue, `npm run gufo:sync` met le plan à jour et le schéma suit.
 */
const board = layoutCircuit(gufoCircuitInput());

export function GufoArchitecture() {
  return (
    <figure className="bleed">
      <CircuitBoard board={board} label="Architecture de Gufo" />
      <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 px-1 font-mono text-[11px] text-(--u-dim)">
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
      </figcaption>
    </figure>
  );
}
