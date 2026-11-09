"use client";

import { useState } from "react";

/**
 * Cadre de la carte du code. Tant qu'on ne l'a pas activée, la carte ne capte
 * ni la molette ni le doigt : la page défile normalement par-dessus. Un clic
 * (ou Entrée) l'active ; un lien l'ouvre en plein écran, seule option proposée
 * sur téléphone, où une carte zoomable dans une page qui défile est inutilisable.
 */
export function CodeMapFrame({ src }: { src: string }) {
  const [active, setActive] = useState(false);

  return (
    <div>
      <div className="glass relative hidden h-[640px] overflow-hidden rounded-[28px] md:block">
        <iframe
          src={src}
          title="Carte du code de Gufo"
          loading="lazy"
          className="h-full w-full border-0"
          style={{ pointerEvents: active ? "auto" : "none" }}
        />
        {active ? null : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-black/50 via-transparent to-transparent pb-8"
          >
            <span
              className="rounded-full px-5 py-2.5 font-semibold shadow-lg"
              style={{ background: "var(--u-accent)", color: "var(--u-on-accent)" }}
            >
              Explorer la carte
            </span>
          </button>
        )}
      </div>
      <p className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-(--u-dim)">
        <span>Carte interactive générée à partir du code de Gufo : blocs, liens et parcours.</span>
        <a
          href={src}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-10 items-center rounded-full border border-(--u-line) px-4 text-xs text-(--u-text) transition-colors hover:border-(--u-accent)"
        >
          Ouvrir en plein écran ↗
        </a>
      </p>
    </div>
  );
}
