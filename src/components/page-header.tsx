import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** Commande affichée au-dessus du titre, en écho au scan de la page d'accueil. */
  command?: string;
  children?: ReactNode;
};

export function PageHeader({ title, command, children }: PageHeaderProps) {
  return (
    <header className="mb-12 max-w-2xl">
      {command ? (
        // Décoratif : masqué aux lecteurs d'écran, le titre porte l'information.
        <p aria-hidden="true" className="mb-4 font-mono text-xs text-dim sm:text-sm">
          <span className="text-amber">$</span> {command}
        </p>
      ) : null}
      <h1 className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {children ? <p className="mt-4 text-lg text-dim">{children}</p> : null}
    </header>
  );
}
