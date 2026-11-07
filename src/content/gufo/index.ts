import planData from "./plan.json";
import statsData from "./stats.json";

/**
 * Données de la fiche Gufo, régénérées par `npm run gufo:sync` (scripts/sync-gufo.mjs) :
 * le plan vient de la carte du code, les chiffres du dépôt lui-même. Ce module
 * ne fait que les typer et les mettre en forme ; il n'importe rien côté serveur,
 * le plan interactif (composant client) peut donc le lire.
 */
export type PlanBlock = { id: string; name: string; text: string };
export type PlanLayer = { name: string; blocks: PlanBlock[] };
export type PlanService = { id: string; name: string };
export type PlanStep = { node: string; text: string };
export type PlanJourney = { id: string; name: string; steps: PlanStep[] };
export type GufoPlanData = {
  source: string;
  generatedAt: string;
  layers: PlanLayer[];
  services: PlanService[];
  journeys: PlanJourney[];
};

export type GufoStats = {
  measuredAt: string;
  linesOfCode: number;
  tests: number;
  testFiles: number;
  pages: number;
  apiRoutes: number;
  tables: number;
  migrations: number;
};

export const gufoPlan: GufoPlanData = planData;
export const gufoStats: GufoStats = statsData;

const number = new Intl.NumberFormat("fr-FR");
const longDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** « 24 455 », avec l'espace insécable des milliers. */
export const formatNumber = (n: number) => number.format(n);
/** « 7 novembre 2026 », à partir d'une date AAAA-MM-JJ. */
export const formatDay = (iso: string) => longDate.format(new Date(`${iso}T12:00:00Z`));

/** Les quatre chiffres de la fiche, avec leur source. */
export const gufoFigures = {
  items: [
    { value: formatNumber(gufoStats.linesOfCode), label: "lignes de TypeScript, hors tests" },
    {
      value: formatNumber(gufoStats.tests),
      label: `tests automatisés, dans ${gufoStats.testFiles} fichiers`,
      accent: true,
    },
    {
      value: formatNumber(gufoStats.pages),
      label: "pages, dont l'esport, les actus et la progression",
    },
    {
      value: formatNumber(gufoStats.tables),
      label: `tables PostgreSQL, créées par ${gufoStats.migrations} migrations`,
    },
  ],
  source: `Mesuré dans le dépôt le ${formatDay(gufoStats.measuredAt)}.`,
};

/** Arrondi au millier inférieur pour une phrase : « 24 000 ». */
export const gufoLinesRounded = formatNumber(Math.floor(gufoStats.linesOfCode / 1000) * 1000);
