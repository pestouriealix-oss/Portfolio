import type { ReactNode } from "react";

/** Colonne centrée du site. Le fond, lui, reste pleine largeur (univers des projets). */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-5xl px-5 sm:px-8 ${className}`}>{children}</div>;
}
