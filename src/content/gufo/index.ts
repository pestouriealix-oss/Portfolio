import type { CircuitInput, CircuitInputNode } from "@/lib/circuit";
import planData from "./plan.json";

/**
 * Données de la fiche Gufo, régénérées par `npm run gufo:sync` (scripts/sync-gufo.mjs)
 * à partir de la carte du code de Gufo. Ce module ne fait que les typer et les
 * préparer pour le schéma de circuit.
 */
export type PlanBlock = {
  id: string;
  /** Type donné par la carte : ui, service, library, data, script, test. */
  kind: string;
  name: string;
  text: string;
  paths: string[];
};
export type PlanLayer = { name: string; blocks: PlanBlock[] };
export type PlanService = { id: string; name: string; text: string; hosts: string[] };
export type PlanLink = { from: string; to: string; weight: number; kinds: string[] };
export type PlanStep = { node: string; text: string };
export type PlanJourney = { id: string; name: string; steps: PlanStep[] };
export type GufoPlanData = {
  source: string;
  generatedAt: string;
  layers: PlanLayer[];
  services: PlanService[];
  links: PlanLink[];
  journeys: PlanJourney[];
};

export const gufoPlan: GufoPlanData = planData;

/** La carte complète, exportée telle quelle dans public/ par le script de synchronisation. */
export const GUFO_MAP_URL = "/cartes/gufo.html";

const longDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** « 5 novembre 2026 », à partir d'une date AAAA-MM-JJ. */
export const formatDay = (iso: string) => longDate.format(new Date(`${iso}T12:00:00Z`));

/**
 * Le schéma montre le code qui tourne : les tests, qui importent presque tout,
 * le rendraient illisible sans rien apprendre de l'architecture.
 */
const shownBlocks = (layer: PlanLayer) => layer.blocks.filter((block) => block.kind !== "test");

/** Entrée du schéma de circuit : un étage par couche de la carte, les services en bordure. */
export function gufoCircuitInput(plan: GufoPlanData = gufoPlan): CircuitInput {
  const rows = plan.layers
    .map((layer) => ({
      name: layer.name,
      nodes: shownBlocks(layer).map((block): CircuitInputNode => ({
        id: block.id,
        label: block.name,
        sublabel: block.paths[0],
        text: block.text,
        details: block.paths,
      })),
    }))
    .filter((row) => row.nodes.length > 0);

  const shown = new Set([
    ...rows.flatMap((row) => row.nodes.map((node) => node.id)),
    ...plan.services.map((service) => service.id),
  ]);

  return {
    rows,
    connectors: {
      name: "Services",
      nodes: plan.services.map((service) => ({
        id: service.id,
        label: service.name,
        text: service.text,
        details: service.hosts,
      })),
    },
    links: plan.links.filter((link) => shown.has(link.from) && shown.has(link.to)),
    journeys: plan.journeys,
  };
}
