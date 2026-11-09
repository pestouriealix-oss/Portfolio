import type { CSSProperties } from "react";

/**
 * Univers visuel de chaque projet : une couleur d'accent, un fond, une image
 * animée. La barre de navigation lit aussi ce fichier pour prendre la couleur
 * du projet affiché ; il ne doit donc rien importer côté serveur.
 */
export type ProjectVisual = "gufo" | "radar" | "before-after" | "hash";

export type ProjectTheme = {
  visual: ProjectVisual;
  /** Police de titre propre au projet (chargée seulement sur sa fiche). */
  display?: "gufo";
  accent: string;
  /** Couleur du texte posé sur l'accent (boutons pleins). */
  onAccent: string;
  bg: string;
  surface: string;
  line: string;
  text: string;
  dim: string;
};

export const projectThemes: Record<string, ProjectTheme> = {
  gufo: {
    visual: "gufo",
    display: "gufo",
    accent: "#ff5a36",
    onAccent: "#2b120a",
    bg: "#1a1715",
    surface: "#23201d",
    line: "#3b3632",
    text: "#f5f0df",
    dim: "#c4b9ae",
  },
  "bataille-navale-c": {
    visual: "radar",
    accent: "#6cb4ff",
    onAccent: "#06142a",
    bg: "#0b1428",
    surface: "#12203a",
    line: "#24375a",
    text: "#e4ecf8",
    dim: "#a3b4cf",
  },
  "refonte-site-base-canoe": {
    visual: "before-after",
    accent: "#4fd1a5",
    onAccent: "#04201a",
    bg: "#0b1a19",
    surface: "#12262a",
    line: "#244241",
    text: "#e6f2ee",
    dim: "#a1c3b8",
  },
  "agent-surveillance-integrite": {
    visual: "hash",
    accent: "#ff6b7a",
    onAccent: "#2a0a10",
    bg: "#140f1a",
    surface: "#1e1727",
    line: "#3b2d46",
    text: "#f0e8f2",
    dim: "#bcaac6",
  },
};

/** Thème neutre, aux couleurs du site, pour un projet sans univers déclaré. */
export const defaultTheme: ProjectTheme = {
  visual: "hash",
  accent: "#ffb454",
  onAccent: "#0f1424",
  bg: "#0f1424",
  surface: "#171d33",
  line: "#2a3252",
  text: "#e4e8f4",
  dim: "#939bb8",
};

export function themeFor(slug: string): ProjectTheme {
  return projectThemes[slug] ?? defaultTheme;
}

/** Variables CSS d'un univers, lues par les classes `bg-(--u-bg)`, `text-(--u-dim)`, etc. */
export function themeVars(theme: ProjectTheme): CSSProperties {
  return {
    "--u-accent": theme.accent,
    "--u-on-accent": theme.onAccent,
    "--u-bg": theme.bg,
    "--u-surface": theme.surface,
    "--u-line": theme.line,
    "--u-text": theme.text,
    "--u-dim": theme.dim,
  } as CSSProperties;
}
