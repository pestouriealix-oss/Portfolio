"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plan du code de Gufo, interactif. Les blocs, les services et les trois
 * parcours viennent de la carte du dépôt (Gufo map, générée le 5 novembre 2026) :
 * on choisit un parcours, et ses étapes s'allument une à une sur le plan.
 *
 * Accessible sans la souris : les parcours et les étapes sont des boutons, et
 * l'étape en cours est annoncée. Si l'utilisateur a demandé à réduire les
 * animations, rien ne défile tout seul.
 */
type NodeId =
  | "web"
  | "api"
  | "coach"
  | "game"
  | "content"
  | "account"
  | "data"
  | "jobs"
  | "tests"
  | "claude"
  | "riot"
  | "ddragon"
  | "pandascore"
  | "rss"
  | "paddle"
  | "resend"
  | "postgres"
  | "github";

type Block = { id: NodeId; name: string; text: string };

const LAYERS: { name: string; blocks: Block[] }[] = [
  {
    name: "Écrans",
    blocks: [
      {
        id: "web",
        name: "Le site (écrans)",
        text: "21 pages : tableau de bord, draft, parties, esport, actus, Premium, Paramètres.",
      },
      {
        id: "api",
        name: "Adresses du serveur",
        text: "6 routes : connexion, fiche, bilan, paiement, Riot Sign On.",
      },
    ],
  },
  {
    name: "Métier",
    blocks: [
      {
        id: "coach",
        name: "Coach IA",
        text: "Prépare les faits, fait écrire la fiche et le bilan, compte les coûts et les quotas.",
      },
      {
        id: "game",
        name: "Données du jeu",
        text: "Appels à Riot, images Data Dragon, synchronisation des parties, statistiques.",
      },
      {
        id: "content",
        name: "Esport et actus",
        text: "Compétitions sur PandaScore, articles lus dans des flux RSS publics.",
      },
    ],
  },
  {
    name: "Socle",
    blocks: [
      {
        id: "account",
        name: "Comptes, accès et paiement",
        text: "Connexion, droits selon l'offre, abonnement Paddle, e-mails.",
      },
      {
        id: "data",
        name: "Base de données",
        text: "20 tables PostgreSQL, une porte d'accès par sujet.",
      },
    ],
  },
];

const SERVICES: { id: NodeId; name: string }[] = [
  { id: "claude", name: "Claude" },
  { id: "riot", name: "API Riot" },
  { id: "ddragon", name: "Data Dragon" },
  { id: "pandascore", name: "PandaScore" },
  { id: "rss", name: "Flux RSS" },
  { id: "paddle", name: "Paddle" },
  { id: "resend", name: "Resend" },
  { id: "postgres", name: "PostgreSQL" },
  { id: "github", name: "GitHub Actions" },
];

const AROUND: Block[] = [
  {
    id: "jobs",
    name: "Tâches et scripts",
    text: "Collecte nocturne des duels sur GitHub Actions, suivi du coût du modèle.",
  },
  { id: "tests", name: "Tests", text: "220 tests Vitest, rangés à côté du code qu'ils vérifient." },
];

type Step = { node: NodeId; text: string };
/** Un parcours a au moins une étape, et la liste au moins un parcours : le type le garantit. */
type Journey = { id: string; name: string; steps: [Step, ...Step[]] };

const JOURNEYS: [Journey, ...Journey[]] = [
  {
    id: "draft",
    name: "Fiche de draft",
    steps: [
      {
        node: "web",
        text: "La draft se remplit seule depuis la partie en cours, et le joueur demande la fiche.",
      },
      { node: "api", text: "Le serveur vérifie la connexion et le quota du jour." },
      {
        node: "coach",
        text: "Le coach rassemble les faits : sorts des champions, taux de victoire, duel déjà écrit.",
      },
      {
        node: "game",
        text: "Les statistiques de duels, comptées sur de vraies parties classées, sont jointes.",
      },
      {
        node: "coach",
        text: "Deux demandes partent en même temps : conditions de victoire et duel.",
      },
      { node: "claude", text: "Claude écrit la fiche, affichée morceau par morceau." },
      { node: "data", text: "La fiche, le duel et le coût de l'appel sont enregistrés." },
    ],
  },
  {
    id: "review",
    name: "Bilan d'une partie",
    steps: [
      { node: "web", text: "Sur le tableau de bord, le joueur clique « Mettre à jour »." },
      { node: "game", text: "Le site va chercher les nouvelles parties du compte." },
      {
        node: "riot",
        text: "Riot renvoie l'historique, le détail et la chronologie de chaque partie.",
      },
      { node: "data", text: "Les parties sont enregistrées en base." },
      { node: "api", text: "Sur la page d'une partie, « Écrire mon bilan » demande l'analyse." },
      {
        node: "coach",
        text: "Seuls des faits calculés sont donnés au modèle : écarts à 10 et 15 minutes, morts, objectifs.",
      },
      {
        node: "claude",
        text: "Claude écrit ce qui a marché, ce qui a coûté et comment progresser.",
      },
    ],
  },
  {
    id: "premium",
    name: "Passage en Premium",
    steps: [
      { node: "web", text: "Le joueur clique sur le bouton de paiement de la page Premium." },
      {
        node: "paddle",
        text: "Paddle affiche le paiement et encaisse : le site ne voit jamais la carte.",
      },
      {
        node: "api",
        text: "Paddle prévient le site ; la signature HMAC de la notification est vérifiée.",
      },
      { node: "account", text: "L'abonnement est interprété : actif, résilié, fin de période." },
      { node: "data", text: "L'utilisateur passe en Premium dans la base." },
    ],
  },
];

const STEP_MS = 1800;

export function GufoPlan() {
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const journey = JOURNEYS[journeyIndex] ?? JOURNEYS[0];
  const current = journey.steps[stepIndex] ?? journey.steps[0];
  const last = journey.steps.length - 1;
  const atEnd = stepIndex >= last;
  const running = playing && !atEnd;

  const reducedMotion = useCallback(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Lecture automatique : une étape toutes les 1,8 s ; le minuteur s'arrête à la dernière.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStepIndex((i) => Math.min(i + 1, last)), STEP_MS);
    return () => window.clearInterval(id);
  }, [running, last]);

  // Premier passage à l'écran : on lance le premier parcours.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          if (!reducedMotion()) setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const chooseJourney = (index: number) => {
    setJourneyIndex(index);
    setStepIndex(0);
    setPlaying(!reducedMotion());
  };

  const chooseStep = (index: number) => {
    setPlaying(false);
    setStepIndex(index);
  };

  /** État d'un bloc : étape en cours, déjà parcouru, ou au repos. */
  const stateOf = (id: NodeId): "current" | "visited" | "idle" => {
    if (current.node === id) return "current";
    if (journey.steps.slice(0, stepIndex).some((s) => s.node === id)) return "visited";
    return "idle";
  };

  /** Numéros des étapes qui passent par ce bloc, pour la pastille. */
  const stepsOf = (id: NodeId) =>
    journey.steps.flatMap((s, i) => (s.node === id && i <= stepIndex ? [i + 1] : []));

  return (
    <div ref={rootRef} className="glass rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Parcours" className="flex flex-wrap gap-2">
          {JOURNEYS.map((j, i) => (
            <button
              key={j.id}
              type="button"
              aria-pressed={i === journeyIndex}
              onClick={() => chooseJourney(i)}
              className="min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors"
              style={
                i === journeyIndex
                  ? {
                      background: "var(--u-accent)",
                      borderColor: "var(--u-accent)",
                      color: "var(--u-on-accent)",
                    }
                  : { borderColor: "var(--u-line)", color: "var(--u-dim)" }
              }
            >
              {j.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (running) return setPlaying(false);
            if (atEnd) setStepIndex(0);
            setPlaying(true);
          }}
          className="min-h-10 rounded-full border border-(--u-line) px-4 font-mono text-xs text-(--u-dim) transition-colors hover:border-(--u-accent) hover:text-(--u-text)"
        >
          {running ? "Pause" : "Lecture"}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          {LAYERS.map((layer) => (
            <section key={layer.name} aria-label={layer.name}>
              <p className="mb-2 font-mono text-[11px] tracking-[0.06em] text-(--u-dim) uppercase">
                {layer.name}
              </p>
              <div
                className={`grid gap-2.5 ${layer.blocks.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
              >
                {layer.blocks.map((block) => (
                  <PlanBlock
                    key={block.id}
                    block={block}
                    state={stateOf(block.id)}
                    steps={stepsOf(block.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          <section aria-label="Services externes">
            <p className="mb-2 font-mono text-[11px] tracking-[0.06em] text-(--u-dim) uppercase">
              Services externes
            </p>
            <ul className="flex flex-wrap gap-2">
              {SERVICES.map((service) => {
                const state = stateOf(service.id);
                return (
                  <li
                    key={service.id}
                    className="rounded-full border px-3 py-1.5 font-mono text-xs transition-all duration-500"
                    style={blockStyle(state)}
                  >
                    {service.name}
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="En dehors des requêtes des joueurs">
            <p className="mb-2 font-mono text-[11px] tracking-[0.06em] text-(--u-dim) uppercase">
              En dehors des requêtes
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {AROUND.map((block) => (
                <PlanBlock key={block.id} block={block} state="idle" steps={[]} />
              ))}
            </div>
          </section>
        </div>

        <div>
          <p className="font-mono text-[11px] tracking-[0.06em] text-(--u-accent) uppercase">
            {journey.name} · étape {stepIndex + 1} sur {journey.steps.length}
          </p>
          <ol className="mt-3 space-y-1.5">
            {journey.steps.map((step, i) => (
              <li key={`${journey.id}-${i}`}>
                <button
                  type="button"
                  onClick={() => chooseStep(i)}
                  aria-current={i === stepIndex ? "step" : undefined}
                  className="flex w-full gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-[14px] transition-colors duration-300"
                  style={
                    i === stepIndex
                      ? {
                          borderColor: "color-mix(in srgb, var(--u-accent) 50%, transparent)",
                          background: "color-mix(in srgb, var(--u-accent) 10%, transparent)",
                          color: "var(--u-text)",
                        }
                      : {
                          borderColor: "transparent",
                          color: i < stepIndex ? "var(--u-text)" : "var(--u-dim)",
                        }
                  }
                >
                  <span className="font-mono text-xs text-(--u-accent)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step.text}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            Étape {stepIndex + 1} : {current.text}
          </p>
        </div>
      </div>
    </div>
  );
}

function blockStyle(state: "current" | "visited" | "idle") {
  if (state === "current")
    return {
      borderColor: "var(--u-accent)",
      background: "color-mix(in srgb, var(--u-accent) 14%, transparent)",
      boxShadow: "0 0 40px -12px var(--u-accent)",
      color: "var(--u-text)",
    };
  if (state === "visited")
    return {
      borderColor: "color-mix(in srgb, var(--u-accent) 40%, transparent)",
      background: "color-mix(in srgb, var(--u-accent) 5%, transparent)",
      color: "var(--u-text)",
    };
  return { borderColor: "var(--u-line)", background: "var(--u-surface)", color: "var(--u-dim)" };
}

function PlanBlock({
  block,
  state,
  steps,
}: {
  block: Block;
  state: "current" | "visited" | "idle";
  steps: number[];
}) {
  return (
    <div
      className="relative rounded-2xl border p-3.5 transition-all duration-500"
      style={blockStyle(state)}
    >
      <p className="pr-10 font-bold text-(--u-text)">{block.name}</p>
      <p className="mt-1 text-[13px] leading-snug text-(--u-dim)">{block.text}</p>
      {steps.length > 0 ? (
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold"
          style={{ background: "var(--u-accent)", color: "var(--u-on-accent)" }}
        >
          {steps.join(" · ")}
        </span>
      ) : null}
    </div>
  );
}
