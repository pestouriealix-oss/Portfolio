"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDay, gufoPlan, type PlanBlock as Block } from "@/content/gufo";

/**
 * Plan du code de Gufo, interactif. Les blocs, les services et les parcours
 * viennent de la carte du code (src/content/gufo/plan.json, régénéré par
 * `npm run gufo:sync`) : quand Gufo évolue, le plan suit sans toucher à ce
 * composant. On choisit un parcours, et ses étapes s'allument une à une.
 *
 * Accessible sans la souris : les parcours et les étapes sont des boutons, et
 * l'étape en cours est annoncée. Si l'utilisateur a demandé à réduire les
 * animations, rien ne défile tout seul.
 */
const AROUND = "Autour";
const { journeys, services } = gufoPlan;
const mainLayers = gufoPlan.layers.filter((layer) => layer.name !== AROUND);
const aroundBlocks = gufoPlan.layers.find((layer) => layer.name === AROUND)?.blocks ?? [];

const STEP_MS = 1800;

export function GufoPlan() {
  // La carte garantit au moins un parcours (le script de synchronisation le vérifie).
  if (journeys.length === 0) return null;
  return <GufoPlanView />;
}

function GufoPlanView() {
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const journey = journeys[journeyIndex] ?? journeys[0]!;
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
  const stateOf = (id: string): "current" | "visited" | "idle" => {
    if (current?.node === id) return "current";
    if (journey.steps.slice(0, stepIndex).some((s) => s.node === id)) return "visited";
    return "idle";
  };

  /** Numéros des étapes qui passent par ce bloc, pour la pastille. */
  const stepsOf = (id: string) =>
    journey.steps.flatMap((s, i) => (s.node === id && i <= stepIndex ? [i + 1] : []));

  return (
    <div ref={rootRef} className="glass rounded-[28px] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Parcours" className="flex flex-wrap gap-2">
          {journeys.map((j, i) => (
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
          {mainLayers.map((layer) => (
            <section key={layer.name} aria-label={layer.name}>
              <p className="mb-2 font-mono text-[11px] tracking-[0.06em] text-(--u-dim) uppercase">
                {layer.name}
              </p>
              <div
                className={`grid gap-2.5 ${layer.blocks.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
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
              {services.map((service) => {
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

          {aroundBlocks.length > 0 ? (
            <section aria-label="En dehors des requêtes des joueurs">
              <p className="mb-2 font-mono text-[11px] tracking-[0.06em] text-(--u-dim) uppercase">
                En dehors des requêtes
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {aroundBlocks.map((block) => (
                  <PlanBlock
                    key={block.id}
                    block={block}
                    state={stateOf(block.id)}
                    steps={stepsOf(block.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}
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
            Étape {stepIndex + 1} : {current?.text}
          </p>
        </div>
      </div>

      <p className="mt-5 font-mono text-[11px] text-(--u-dim)">
        D&apos;après la carte du code ({gufoPlan.source}), générée le{" "}
        {formatDay(gufoPlan.generatedAt)}.
      </p>
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
