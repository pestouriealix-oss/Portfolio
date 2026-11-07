import type { CSSProperties } from "react";

/** Rang d'un élément dans une cascade d'apparition (voir `.rise` dans globals.css). */
export const delay = (rank: number) => ({ "--d": rank }) as CSSProperties;
