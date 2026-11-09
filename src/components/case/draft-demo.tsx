"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Démo de la fiche de draft de Gufo : les dix choix se verrouillent dans l'ordre
 * réel d'une draft classée, puis la fiche s'écrit ligne par ligne. Elle démarre
 * quand elle entre à l'écran ; si l'utilisateur a demandé à réduire les
 * animations, l'état final s'affiche d'emblée.
 *
 * Aperçu illustratif : les phrases sont des exemples, pas une vraie fiche.
 */
const ROLES = ["TOP", "JUNGLE", "MID", "BOT", "SUPPORT"] as const;
/** 1 côté bleu, 2 côté rouge, 2 bleu, 2 rouge, 2 bleu, 1 rouge. */
const ORDER = ["a0", "e0", "e1", "a1", "a2", "e2", "e3", "a3", "a4", "e4"];
const WIN_LINES = [
  "Ton équipe est plus forte en milieu de partie : regroupez-vous tôt autour des objectifs.",
  "L'adversaire gagne les combats longs : cherchez des engagements courts et décisifs.",
  "Protège ton tireur : c'est lui qui porte les dégâts de ton équipe.",
];
const DUEL_LINE =
  "Ton vis-à-vis est plus fort en tout début de partie : joue la sécurité, puis prends l'initiative.";
/** Étapes : 10 choix, 4 lignes de fiche, puis les sources. */
const LAST_TICK = 16;
const TICK_MS = 700;
const ALLY = "95 220 176";
const ENEMY = "240 112 138";

export function DraftDemo() {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const done = tick >= LAST_TICK;

  const play = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTick(LAST_TICK);
      return;
    }
    setTick(0);
    setRunning(true);
  }, []);

  // Le minuteur ne vit que pendant la lecture : il s'arrête de lui-même à la dernière étape.
  useEffect(() => {
    if (!running || done) return;
    const id = window.setInterval(() => setTick((t) => Math.min(t + 1, LAST_TICK)), TICK_MS);
    return () => window.clearInterval(id);
  }, [running, done]);

  // Démarre une seule fois, quand la démo devient visible.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [play]);

  const phase =
    tick < 10 ? "Lecture de la draft…" : tick < 15 ? "Fiche en cours d'écriture…" : "Fiche prête";

  const slot = (side: "a" | "e", i: number) => {
    const k = ORDER.indexOf(`${side}${i}`);
    const color = side === "a" ? ALLY : ENEMY;
    if (tick > k)
      return {
        status: "verrouillé",
        picking: false,
        style: { background: `rgb(${color} / 0.1)`, borderColor: `rgb(${color} / 0.55)` },
      };
    if (tick === k)
      return {
        status: "en sélection…",
        picking: true,
        style: { background: "rgb(245 240 223 / 0.04)", borderColor: "#6b625a" },
      };
    return { status: "en attente", picking: false, style: {} };
  };

  const line = (at: number, text: string) => ({
    text,
    shown: tick > at,
    writing: tick === at + 1,
  });
  const wins = WIN_LINES.map((text, i) => line(10 + i, text));
  const duel = line(13, DUEL_LINE);

  return (
    <div ref={rootRef}>
      <div className="glass flex flex-wrap gap-5 rounded-[28px] p-4 sm:p-5">
        <div className="min-w-0 flex-[1_1_360px]">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <p
              className="flex items-center gap-2.5 font-mono text-xs text-(--u-dim)"
              aria-live="polite"
            >
              <span className="relative inline-block size-2" aria-hidden="true">
                <span className="ping absolute inset-0 rounded-full bg-(--u-accent)" />
                <span className="absolute inset-0 rounded-full bg-(--u-accent)" />
              </span>
              {phase}
            </p>
            <button
              type="button"
              onClick={play}
              className="min-h-10 rounded-full border border-(--u-line) px-4 font-mono text-xs text-(--u-dim) transition-colors hover:border-(--u-accent) hover:text-(--u-text)"
            >
              Rejouer
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["a", "e"] as const).map((side) => (
              <div key={side} className="flex flex-col gap-2">
                <p
                  className="font-mono text-[11px] tracking-[0.06em] uppercase"
                  style={{ color: `rgb(${side === "a" ? ALLY : ENEMY})` }}
                >
                  {side === "a" ? "Ton équipe" : "En face"}
                </p>
                {ROLES.map((role, i) => {
                  const s = slot(side, i);
                  return (
                    <div
                      key={role}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-(--u-line) px-3 py-3 transition-colors duration-300 sm:px-3.5"
                      style={s.style}
                    >
                      <span className="font-mono text-[11px] font-semibold sm:text-xs">{role}</span>
                      <span
                        className={`text-[12px] text-(--u-dim) sm:text-[13px] ${s.picking ? "pulse-soft" : ""}`}
                      >
                        {s.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-[1_1_360px] rounded-[20px] border border-(--u-line) bg-(--u-surface) px-5 py-5 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-gufo-display text-3xl leading-none font-extrabold uppercase">
              Fiche de draft
            </p>
            <p className="font-mono text-[11px] text-(--u-dim)">écrite en direct</p>
          </div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-(--u-accent) uppercase">
            Conditions de victoire
          </p>
          {wins.map((w) => (
            <DemoLine key={w.text} {...w} />
          ))}
          <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-(--u-accent) uppercase">
            Ton duel
          </p>
          <DemoLine {...duel} />
          <p
            className="mt-5 border-t border-(--u-line) pt-3.5 text-[12.5px] text-(--u-dim) transition-opacity duration-500"
            style={{ opacity: tick > 14 ? 1 : 0 }}
          >
            Sources citées sous la fiche : compétences du patch en cours (Data Dragon) et taux de
            victoire calculés sur de vraies parties classées.
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoLine({ text, shown, writing }: { text: string; shown: boolean; writing: boolean }) {
  return (
    <p
      className="mt-2.5 text-[15px] transition-[opacity,transform] duration-500"
      style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(6px)" }}
    >
      {text}
      {writing ? (
        <span aria-hidden="true" className="blink text-(--u-accent)">
          {" "}
          ▍
        </span>
      ) : null}
    </p>
  );
}
