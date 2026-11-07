import type { ReactNode } from "react";
import { delay } from "@/lib/style";

type PageHeaderProps = {
  title: string;
  /** Commande affichée au-dessus du titre, en écho au scan de la page d'accueil. */
  command?: string;
  children?: ReactNode;
};

export function PageHeader({ title, command, children }: PageHeaderProps) {
  return (
    <header className="mb-14 max-w-3xl">
      {command ? (
        // Décoratif : masqué aux lecteurs d'écran, le titre porte l'information.
        <p
          aria-hidden="true"
          className="glass rise inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 font-mono text-xs text-dim"
        >
          <span className="text-amber">$</span>
          <span className="truncate">{command}</span>
        </p>
      ) : null}
      <h1
        className="rise mt-7 text-5xl leading-[0.95] font-semibold tracking-[-0.045em] sm:text-7xl"
        style={delay(1)}
      >
        {title}
      </h1>
      {children ? (
        <p className="rise mt-6 text-lg text-dim sm:text-xl" style={delay(2)}>
          {children}
        </p>
      ) : null}
    </header>
  );
}
