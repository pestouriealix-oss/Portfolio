#!/usr/bin/env node
/**
 * Met à jour la fiche Gufo du portfolio à partir du projet lui-même.
 *
 *   npm run gufo:sync -- --plan <carte> --repo <dépôt>
 *
 * --plan  La carte du code (floorplan) : le fichier HTML obtenu avec « Export »
 *         dans la carte, ou le JSON du graphe (schéma floorplan/graph@1).
 *         Écrit src/content/gufo/plan.json : blocs, services, parcours.
 * --repo  Le dossier du dépôt Gufo (ProjetLol). Compte les lignes, les tests,
 *         les pages, les tables et les migrations à partir des fichiers suivis
 *         par Git. Écrit src/content/gufo/stats.json.
 *
 * Les deux options sont indépendantes. Rien n'est lu au moment du build : on
 * relance ce script quand Gufo évolue, on relit le diff, puis on commite.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const OUT_DIR = path.join(import.meta.dirname, "..", "src", "content", "gufo");

const { values } = parseArgs({
  options: { plan: { type: "string" }, repo: { type: "string" } },
});

if (!values.plan && !values.repo) {
  console.error(
    "Usage : npm run gufo:sync -- --plan <carte.html|graphe.json> --repo <dossier ProjetLol>",
  );
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

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

/** Lit le graphe dans un JSON, ou dans la page HTML exportée (`window.FLOORPLAN = {…};`). */
function readGraph(file) {
  const text = readFileSync(file, "utf8");
  if (file.endsWith(".json")) return JSON.parse(text);
  const start = text.indexOf("window.FLOORPLAN = ");
  if (start === -1) fail(`aucun graphe trouvé dans ${file}`);
  // Le graphe est un littéral JSON sur une ligne : on le lit jusqu'à la fin de l'objet.
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
    else if (c === "}" && --depth === 0) return JSON.parse(text.slice(from, i + 1));
  }
  fail(`graphe illisible dans ${file}`);
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

  /** Bloc de premier niveau qui contient une référence d'étape (`n:coach.brain`, `f:src/…`). */
  const blockOf = (ref) => {
    const id = ref.startsWith("f:") ? fileNode.get(ref) : ref.replace(/^n:/, "");
    const root = id?.split(".")[0];
    if (!root || !known.has(root)) fail(`étape rattachée à un bloc inconnu : ${ref}`);
    return root;
  };

  const layers = ["Écrans", "Métier", "Socle", "Autour"]
    .map((name) => ({
      name,
      blocks: blocks
        .filter((n) => layerOf(n) === name)
        .map((n) => ({ id: n.id, name: n.label, text: n.summary })),
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
    services: services.map((n) => ({ id: n.id, name: n.label })),
    journeys,
  });
}

// ---------------------------------------------------------------- Les chiffres

/**
 * Nombre de tests tel que Vitest le rapporte (les `it.each` comptent pour chaque
 * cas, les tests ignorés aussi). Vitest sort en erreur si un test échoue, mais
 * écrit quand même son rapport : seul un rapport absent fait renoncer.
 */
function vitestTotal(repo) {
  const report = path.join(mkdtempSync(path.join(tmpdir(), "gufo-")), "vitest.json");
  try {
    execFileSync("npx", ["vitest", "run", "--reporter=json", `--outputFile=${report}`], {
      cwd: repo,
      stdio: "ignore",
      timeout: 5 * 60 * 1000,
    });
  } catch {
    // Un test en échec rend un code de sortie non nul : le rapport est lu quand même.
  }
  if (!existsSync(report)) return null;
  return JSON.parse(readFileSync(report, "utf8")).numTotalTests ?? null;
}

function syncStats(repo) {
  if (!existsSync(path.join(repo, ".git"))) fail(`${repo} n'est pas un dépôt Git`);
  // Seuls les fichiers suivis par Git comptent : pas de node_modules ni de brouillon local.
  const files = execFileSync("git", ["-C", repo, "ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const read = (f) => readFileSync(path.join(repo, f), "utf8");
  const lines = (f) => read(f).split("\n").length - 1;

  const isTest = (f) => /\.test\.tsx?$/.test(f);
  const code = files.filter((f) => f.startsWith("src/") && /\.tsx?$/.test(f) && !isTest(f));
  const tests = files.filter(isTest);
  // À défaut de Vitest (dépendances non installées), on compte les `it(` et `test(` écrits.
  let testCases = vitestTotal(repo);
  if (testCases === null) {
    console.warn("! Vitest n'a pas pu tourner : les tests sont comptés dans le code.");
    testCases = tests
      .map((f) => read(f).match(/^\s*(it|test)(\.each\([^)]*\))?\(/gm)?.length ?? 0)
      .reduce((a, b) => a + b, 0);
  }
  const tables = files
    .filter((f) => f.startsWith("src/") && f.endsWith(".ts"))
    .map((f) => read(f).match(/pgTable\(\s*"/g)?.length ?? 0)
    .reduce((a, b) => a + b, 0);

  write("stats.json", {
    measuredAt: today,
    linesOfCode: code.map(lines).reduce((a, b) => a + b, 0),
    tests: testCases,
    testFiles: tests.length,
    pages: files.filter((f) => /^src\/app\/.*page\.tsx$/.test(f)).length,
    apiRoutes: files.filter((f) => /^src\/app\/api\/.*route\.ts$/.test(f)).length,
    tables,
    migrations: files.filter((f) => /^drizzle\/[^/]+\.sql$/.test(f)).length,
  });
}

if (values.plan) syncPlan(path.resolve(values.plan));
if (values.repo) syncStats(path.resolve(values.repo));
