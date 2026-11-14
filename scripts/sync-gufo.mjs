#!/usr/bin/env node
/**
 * Met à jour la fiche Gufo du portfolio à partir de la carte du code de Gufo.
 *
 *   npm run gufo:sync -- --plan <carte>
 *
 * --plan  La carte du code (floorplan) : le fichier HTML obtenu avec « Export »
 *         dans la carte, ou le JSON du graphe (schéma floorplan/graph@1).
 *         Écrit src/content/gufo/plan.json : blocs, services, liaisons entre
 *         blocs et parcours. C'est ce fichier que le schéma de circuit affiche.
 *         Avec le fichier HTML, copie aussi la carte elle-même, nettoyée, dans
 *         public/cartes/gufo.html, pour le lien « carte complète ».
 *
 * Rien n'est lu au moment du build : on relance ce script quand Gufo évolue,
 * on relit le diff, puis on commite.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const ROOT = path.join(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "src", "content", "gufo");
const MAP_FILE = path.join(ROOT, "public", "cartes", "gufo.html");

const { values } = parseArgs({ options: { plan: { type: "string" } } });

if (!values.plan) {
  console.error("Usage : npm run gufo:sync -- --plan <carte.html|graphe.json>");
  process.exit(1);
}

/** Écrit un JSON lisible, avec un saut de ligne final (le diff reste propre). */
function write(name, data) {
  const file = path.join(OUT_DIR, name);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`✓ ${path.relative(process.cwd(), file)}`);
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------- Le plan

/** Position du littéral `window.FLOORPLAN = {…}` dans la page exportée. */
function findGraph(text, file) {
  const start = text.indexOf("window.FLOORPLAN = ");
  if (start === -1) fail(`aucun graphe trouvé dans ${file}`);
  // Le graphe est un littéral JSON : on le lit jusqu'à l'accolade qui le ferme.
  const from = text.indexOf("{", start);
  let depth = 0;
  let inString = false;
  for (let i = from; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === "\\") i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return { from, to: i + 1 };
  }
  fail(`graphe illisible dans ${file}`);
}

/** Lit le graphe dans un JSON, ou dans la page HTML exportée. */
function readGraph(file) {
  const text = readFileSync(file, "utf8");
  if (file.endsWith(".json")) return JSON.parse(text);
  const { from, to } = findGraph(text, file);
  return JSON.parse(text.slice(from, to));
}

/**
 * Copie la carte exportée dans public/, sans ce qui ne doit pas être publié :
 * - le chemin du dossier sur l'ordinateur (il contient le nom d'utilisateur) ;
 * - le journal « Recent work », qui reprend des demandes faites à l'assistant de code ;
 * - la configuration du serveur local de la carte, s'il y en a une (jeton compris).
 */
function publishMap(file) {
  let text = readFileSync(file, "utf8");
  const { from, to } = findGraph(text, file);
  const graph = JSON.parse(text.slice(from, to));

  const root = graph.meta?.root;
  graph.recent = { items: [], tasks: [] };
  if (root) graph.meta.root = graph.meta.rootName ?? "";

  // Échappe `<` : le JSON est réinjecté dans une balise <script>.
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");
  text = text.slice(0, from) + json + text.slice(to);
  text = text.replace(/window\.FLOORPLAN_SERVER\s*=\s*\{[^;]*\};?/g, "");

  // Dernier filet : plus aucune trace du chemin local, nulle part dans la page.
  if (root) text = text.split(root).join(graph.meta.root);
  const home = root?.match(/^\/Users\/[^/]+|^\/home\/[^/]+|^[A-Z]:\\Users\\[^\\]+/)?.[0];
  if (home && text.includes(home)) text = text.split(home).join("~");

  // Thème sombre par défaut, comme le site ; le bouton de thème de la carte reste actif.
  const autoTheme = "let mem = 'auto';";
  if (text.includes(autoTheme)) text = text.replace(autoTheme, "let mem = 'dark';");
  else if (!text.includes("let mem = 'dark';")) {
    console.warn("! Thème de la carte non trouvé : elle suivra le thème de l'appareil.");
  }

  mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  writeFileSync(MAP_FILE, text);
  console.log(`✓ ${path.relative(process.cwd(), MAP_FILE)} (${Math.round(text.length / 1024)} Ko)`);
}

/**
 * Étage de chaque bloc sur le plan. Le type donné par la carte suffit presque
 * toujours ; seuls les blocs « bibliothèque » du socle sont nommés à la main.
 */
const SOCLE = new Set(["account"]);
function layerOf(node) {
  if (node.kind === "ui" || node.kind === "service") return "Écrans";
  if (node.kind === "data" || SOCLE.has(node.id)) return "Socle";
  if (node.kind === "script" || node.kind === "test") return "Autour";
  return "Métier";
}

function syncPlan(file) {
  const graph = readGraph(file);
  if (graph.schema !== "floorplan/graph@1") fail(`schéma inattendu : ${graph.schema}`);

  const top = graph.nodes.filter((n) => !n.parent);
  const blocks = top.filter((n) => n.kind !== "external");
  const services = top.filter((n) => n.kind === "external");
  const known = new Set(top.map((n) => n.id));
  const fileNode = new Map((graph.files ?? []).map((f) => [`f:${f.p}`, f.n]));

  /** Bloc de premier niveau d'une référence (`n:coach.brain`, `f:src/…`), ou null. */
  const rootOf = (ref) => {
    const id = ref.startsWith("f:") ? fileNode.get(ref) : ref.replace(/^n:/, "");
    const root = id?.split(".")[0];
    return root && known.has(root) ? root : null;
  };
  const blockOf = (ref) => rootOf(ref) ?? fail(`étape rattachée à un bloc inconnu : ${ref}`);

  /** « src/lib/coach/** » → « src/lib/coach » : le dossier, sans le motif. */
  const folder = (glob) => glob.replace(/\/\*\*$/, "").replace(/\/\*\.\w+$/, "");

  const layers = ["Écrans", "Métier", "Socle", "Autour"]
    .map((name) => ({
      name,
      blocks: blocks
        .filter((n) => layerOf(n) === name)
        .map((n) => ({
          id: n.id,
          kind: n.kind,
          name: n.label,
          text: n.summary,
          paths: [...new Set((n.paths ?? []).map(folder))],
        })),
    }))
    .filter((layer) => layer.blocks.length > 0);

  const journeys = graph.flows.map((flow) => ({
    id: flow.id,
    name: flow.title,
    steps: flow.steps.map((step) => ({ node: blockOf(step.ref), text: step.note })),
  }));
  if (journeys.length === 0 || journeys.some((j) => j.steps.length === 0)) {
    fail("la carte doit contenir au moins un parcours, chacun avec au moins une étape");
  }

  write("plan.json", {
    source: "Gufo map",
    generatedAt: graph.meta.generatedAt.slice(0, 10),
    layers,
    services: services.map((n) => ({
      id: n.id,
      name: n.label,
      text: n.summary,
      hosts: n.hosts ?? [],
    })),
    links: aggregateLinks(graph.links ?? [], rootOf),
    journeys,
  });
}

/**
 * Les liaisons de la carte relient des fichiers (un import, un appel HTTP…) :
 * on les ramène aux blocs de premier niveau. Une liaison par sens, pondérée par
 * le nombre de liaisons de fichiers qu'elle résume ; celles internes à un bloc
 * disparaissent. Triées pour que le diff reste stable d'une synchronisation à l'autre.
 */
function aggregateLinks(links, rootOf) {
  const byPair = new Map();
  for (const link of links) {
    const from = rootOf(link.a);
    const to = rootOf(link.b);
    if (!from || !to || from === to) continue;
    const key = `${from}>${to}`;
    const entry = byPair.get(key) ?? { from, to, weight: 0, kinds: new Set() };
    entry.weight += link.w ?? 1;
    entry.kinds.add(link.k);
    byPair.set(key, entry);
  }
  return [...byPair.values()]
    .map((e) => ({ from: e.from, to: e.to, weight: e.weight, kinds: [...e.kinds].sort() }))
    .sort((x, y) => x.from.localeCompare(y.from) || x.to.localeCompare(y.to));
}

syncPlan(path.resolve(values.plan));
if (values.plan.endsWith(".html")) publishMap(path.resolve(values.plan));
