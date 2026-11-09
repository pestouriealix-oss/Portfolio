"use client";

import { useState, type ReactNode } from "react";

/**
 * Relance l'apparition des lignes du scan : changer la clé recrée le contenu,
 * donc rejoue ses animations CSS. Aucun état métier, aucun appel réseau.
 */
export function ScanReplay({ header, children }: { header: ReactNode; children: ReactNode }) {
  const [run, setRun] = useState(0);

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-3 pr-3 pl-5 sm:pl-6">
        {header}
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="min-h-10 shrink-0 rounded-full border border-white/15 px-4 text-xs text-dim transition-colors hover:border-amber hover:text-amber"
        >
          Relancer le scan
        </button>
      </div>
      <div key={run}>{children}</div>
    </>
  );
}
