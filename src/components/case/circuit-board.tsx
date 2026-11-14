"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { CircuitBoardData, CircuitNode, CircuitTrace } from "@/lib/circuit";

/**
 * Schéma de circuit interactif. La mise en page arrive toute faite du serveur
 * (src/lib/circuit.ts) : ce composant ne fait que dessiner et réagir.
 *
 * - Vue d'ensemble : des impulsions parcourent les pistes, de l'appelant vers
 *   l'appelé. Survoler ou sélectionner un bloc isole ses liaisons.
 * - Parcours : une impulsion suit le chemin d'une étape à la suivante.
 *
 * Coût : les impulsions animent `stroke-dashoffset` en CSS, sur un calque à part,
 * et s'arrêtent dès que le schéma sort de l'écran. Si l'utilisateur a demandé à
 * réduire les animations, il n'y en a aucune et rien ne défile tout seul.
 */

const STEP_MS = 2600;
/** Vitesse des impulsions, en unités du schéma par seconde. */
const SPEED = 170;
/** Longueur de la traînée lumineuse. */
const COMET = 28;

type TraceState = "idle" | "lit" | "trail" | "faded";
type NodeState = "idle" | "active" | "visited" | "faded";

export function CircuitBoard({ board, label }: { board: CircuitBoardData; label: string }) {
  const [view, setView] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const gridId = useId();

  const nodes = useMemo(() => new Map(board.nodes.map((n) => [n.id, n])), [board]);
  const journey = view === null ? null : (board.journeys[view] ?? null);
  const last = journey ? journey.steps.length - 1 : 0;
  const running = playing && !reducedMotion && step < last;

  // Les animations ne tournent que lorsque le schéma est visible.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(!!entry?.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running || !onScreen) return;
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, last)), STEP_MS);
    return () => window.clearTimeout(id);
  }, [running, onScreen, step, last]);

  const chooseView = (index: number | null) => {
    setView(index);
    setStep(0);
    setPlaying(index !== null);
    setSelected(null);
    setHovered(null);
  };

  // ---------------------------------------------------------- États dérivés

  const focus = journey ? null : (hovered ?? selected);
  const current = journey?.steps[step];

  const traceState = (trace: CircuitTrace): TraceState => {
    if (journey) {
      if (current?.route?.traces.includes(trace.id)) return "lit";
      const earlier = journey.steps.slice(1, step).some((s) => s.route?.traces.includes(trace.id));
      return earlier ? "trail" : "faded";
    }
    if (!focus) return "idle";
    return trace.from === focus || trace.to === focus ? "lit" : "faded";
  };

  const nodeState = (node: CircuitNode): NodeState => {
    if (journey) {
      if (current?.node === node.id) return "active";
      const passed = journey.steps.slice(0, step).some((s) => s.node === node.id);
      return passed ? "visited" : "faded";
    }
    if (!focus) return "idle";
    if (node.id === focus) return "active";
    const linked = board.traces.some(
      (t) => (t.from === focus && t.to === node.id) || (t.to === focus && t.from === node.id),
    );
    return linked ? "idle" : "faded";
  };

  const showPulses = !reducedMotion;
  const ambient = showPulses && !journey;

  return (
    <div
      ref={rootRef}
      className="circuit rounded-[28px] border border-(--u-line) bg-(--u-surface) p-3 sm:p-5"
      data-running={onScreen ? "true" : "false"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div role="group" aria-label="Affichage" className="flex flex-wrap gap-2">
          <ViewButton active={view === null} onClick={() => chooseView(null)}>
            Vue d&apos;ensemble
          </ViewButton>
          {board.journeys.map((j, i) => (
            <ViewButton key={j.id} active={view === i} onClick={() => chooseView(i)}>
              {j.name}
            </ViewButton>
          ))}
        </div>
        {journey && !reducedMotion ? (
          <button
            type="button"
            onClick={() => {
              if (running) return setPlaying(false);
              if (step >= last) setStep(0);
              setPlaying(true);
            }}
            className="min-h-10 rounded-full border border-(--u-line) px-4 font-mono text-xs text-(--u-dim) transition-colors hover:border-(--u-accent) hover:text-(--u-text)"
          >
            {running ? "Pause" : "Lecture"}
          </button>
        ) : null}
      </div>

      <p className="mt-4 min-h-6 px-1 font-mono text-xs text-(--u-dim)" aria-live="polite">
        {journey && current ? (
          <>
            <span className="text-(--u-accent)">
              {String(step + 1).padStart(2, "0")}/{String(journey.steps.length).padStart(2, "0")}
            </span>{" "}
            {current.text}
          </>
        ) : focus ? (
          <>
            <span className="text-(--u-accent)">{nodes.get(focus)?.ref}</span>{" "}
            {nodes.get(focus)?.label} : ses liaisons sont isolées.
          </>
        ) : (
          "Survole ou sélectionne un bloc pour isoler ses liaisons."
        )}
      </p>

      <p className="mt-1 px-1 font-mono text-[11px] text-(--u-dim) md:hidden">
        Fais glisser le schéma de côté pour le voir en entier.
      </p>

      <div className="no-scrollbar mt-3 overflow-x-auto rounded-[18px] border border-(--u-line) bg-(--u-bg)">
        <svg
          viewBox={`0 0 ${board.width} ${board.height}`}
          className="circuit-svg block w-full min-w-[760px]"
          role="group"
          aria-label={label}
        >
          <defs>
            <pattern id={gridId} width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" className="circuit-grid" />
            </pattern>
          </defs>
          <rect width={board.width} height={board.height} fill={`url(#${gridId})`} />

          {board.rows.map((row) => (
            <text key={row.name} x="22" y={row.y + 4} className="circuit-row">
              {row.name}
            </text>
          ))}

          <g>
            {board.traces.map((trace) => (
              <path
                key={trace.id}
                d={trace.d}
                className="circuit-trace"
                data-state={traceState(trace)}
              />
            ))}
          </g>

          <g aria-hidden="true">
            {ambient
              ? board.traces
                  .filter((t) => traceState(t) !== "faded")
                  .map((t) => (
                    <path
                      key={`pulse-${t.id}`}
                      d={t.d}
                      className="circuit-pulse"
                      style={pulseStyle(t.length, 520 + seeded(t.id, 2) * 900, seeded(t.id, 1))}
                    />
                  ))
              : null}
            {showPulses && journey && current?.route ? (
              <path
                key={`${journey.id}-${step}`}
                d={current.route.d}
                className="circuit-pulse"
                style={pulseStyle(current.route.length, 260, 0)}
              />
            ) : null}
          </g>

          <g aria-hidden="true">
            {board.traces.flatMap((trace) =>
              [trace.start, trace.end].map((p, i) => (
                <circle
                  key={`${trace.id}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="2.6"
                  className="circuit-pad"
                  data-state={traceState(trace)}
                />
              )),
            )}
          </g>

          <g>
            {board.nodes.map((node) => (
              <BoardNode
                key={node.id}
                node={node}
                state={nodeState(node)}
                interactive={!journey}
                pressed={selected === node.id}
                onHover={setHovered}
                onToggle={(id) => setSelected((s) => (s === id ? null : id))}
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-5 px-1">
        {journey ? (
          <ol className="gap-x-3 md:columns-2">
            {journey.steps.map((s, i) => (
              <li key={`${journey.id}-${i}`} className="mb-1.5 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setStep(i);
                  }}
                  aria-current={i === step ? "step" : undefined}
                  className="flex w-full gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-[14px] transition-colors duration-300"
                  style={
                    i === step
                      ? {
                          borderColor: "color-mix(in srgb, var(--u-accent) 50%, transparent)",
                          background: "color-mix(in srgb, var(--u-accent) 10%, transparent)",
                          color: "var(--u-text)",
                        }
                      : {
                          borderColor: "var(--u-line)",
                          color: i < step ? "var(--u-text)" : "var(--u-dim)",
                        }
                  }
                >
                  <span className="font-mono text-xs text-(--u-accent)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-mono text-xs text-(--u-dim)">
                      {nodes.get(s.node)?.ref ?? "··"}
                    </span>{" "}
                    {s.text}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : focus && nodes.get(focus) ? (
          <NodeDetails node={nodes.get(focus)!} board={board} nodes={nodes} />
        ) : (
          <Legend />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Pièces

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors"
      style={
        active
          ? {
              background: "var(--u-accent)",
              borderColor: "var(--u-accent)",
              color: "var(--u-on-accent)",
            }
          : { borderColor: "var(--u-line)", color: "var(--u-dim)" }
      }
    >
      {children}
    </button>
  );
}

function BoardNode({
  node,
  state,
  interactive,
  pressed,
  onHover,
  onToggle,
}: {
  node: CircuitNode;
  state: NodeState;
  interactive: boolean;
  pressed: boolean;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
}) {
  const chip = node.kind === "chip";
  const events = interactive
    ? {
        tabIndex: 0,
        role: "button",
        "aria-pressed": pressed,
        "aria-label": `${node.ref} ${node.label}`,
        onMouseEnter: () => onHover(node.id),
        onMouseLeave: () => onHover(null),
        onClick: () => onToggle(node.id),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(node.id);
          }
        },
      }
    : { "aria-label": `${node.ref} ${node.label}`, role: "img" };

  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      className="circuit-node"
      data-kind={node.kind}
      data-state={state}
      data-interactive={interactive}
      {...events}
    >
      <rect width={node.w} height={node.h} rx={chip ? 6 : node.h / 2} className="circuit-body" />
      {chip ? (
        <>
          {/* Repère de la broche 1, comme sur un boîtier de puce. */}
          <circle cx="11" cy="11" r="2.4" className="circuit-notch" />
          <text x={node.w - 10} y="15" textAnchor="end" className="circuit-ref">
            {node.ref}
          </text>
          <text
            x={node.w / 2}
            y={node.sublabel ? 30 : 35}
            textAnchor="middle"
            className="circuit-label"
          >
            {node.label}
          </text>
          {node.sublabel ? (
            <text x={node.w / 2} y="47" textAnchor="middle" className="circuit-sublabel">
              {node.sublabel}
            </text>
          ) : null}
        </>
      ) : (
        <>
          {/* Repère sérigraphié au-dessus du connecteur, hors du passage des pistes. */}
          <text x="4" y="-6" className="circuit-ref">
            {node.ref}
          </text>
          <text x={node.w / 2} y={node.h / 2 + 4} textAnchor="middle" className="circuit-connector">
            {node.label}
          </text>
        </>
      )}
    </g>
  );
}

function NodeDetails({
  node,
  board,
  nodes,
}: {
  node: CircuitNode;
  board: CircuitBoardData;
  nodes: Map<string, CircuitNode>;
}) {
  const name = (id: string) => nodes.get(id)?.label ?? id;
  const calls = board.traces.filter((t) => t.from === node.id || (t.both && t.to === node.id));
  const callers = board.traces.filter((t) => t.to === node.id || (t.both && t.from === node.id));
  const other = (t: CircuitTrace) => (t.from === node.id ? t.to : t.from);

  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="font-mono text-xs text-(--u-accent)">
          {node.ref} · {node.kind === "chip" ? "bloc du code" : "service extérieur"}
        </p>
        <p className="case-title mt-1 text-2xl font-bold text-(--u-text)">{node.label}</p>
        <p className="mt-2 text-[15px] text-(--u-dim)">{node.text}</p>
        {node.details.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-(--u-dim)">
            {node.details.map((detail) => (
              <li key={detail} className="rounded-md border border-(--u-line) px-2 py-0.5">
                {detail}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <dl className="grid content-start gap-3 font-mono text-xs">
        <div>
          <dt className="text-(--u-dim)">appelle →</dt>
          <dd className="mt-1 text-(--u-text)">
            {calls.length ? calls.map((t) => name(other(t))).join(" · ") : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-(--u-dim)">← appelé par</dt>
          <dd className="mt-1 text-(--u-text)">
            {callers.length ? callers.map((t) => name(other(t))).join(" · ") : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Legend() {
  return (
    <dl className="grid gap-x-6 gap-y-2 font-mono text-xs text-(--u-dim) md:grid-cols-3">
      <div>
        <dt className="text-(--u-text)">U · puce</dt>
        <dd>un bloc du code, rangé par couche</dd>
      </div>
      <div>
        <dt className="text-(--u-text)">J · connecteur</dt>
        <dd>un service extérieur</dd>
      </div>
      <div>
        <dt className="text-(--u-text)">piste</dt>
        <dd>imports et appels réseau ; l&apos;impulsion va de l&apos;appelant à l&apos;appelé</dd>
      </div>
    </dl>
  );
}

// ------------------------------------------------------------ Outils

/**
 * Style d'une impulsion : un trait court (la traînée) suivi d'un vide plus long
 * que la piste, qu'on fait glisser. Le vide en plus est la pause entre deux passages.
 */
function pulseStyle(length: number, pause: number, phase: number): CSSProperties {
  const period = length + COMET + pause;
  const duration = period / SPEED;
  return {
    strokeDasharray: `${COMET}px ${period - COMET}px`,
    ["--from" as string]: `${COMET}px`,
    ["--to" as string]: `${COMET - period}px`,
    animationDuration: `${duration.toFixed(2)}s`,
    animationDelay: `${(-phase * duration).toFixed(2)}s`,
  };
}

/** Nombre pseudo-aléatoire stable entre 0 et 1 : même rendu au serveur et au client. */
function seeded(text: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

/** Préférence « réduire les animations », suivie en direct. Côté serveur : non. */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(reducedMotionQuery);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}
