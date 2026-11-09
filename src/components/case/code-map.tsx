import { existsSync } from "node:fs";
import path from "node:path";
import { CodeMapFrame } from "@/components/case/code-map-frame";

/** Adresse publique de la carte exportée (copiée par `npm run gufo:sync`). */
export const GUFO_MAP_URL = "/cartes/gufo.html";

/**
 * La vraie carte du code de Gufo (floorplan), telle qu'Alix-Pierre l'a générée,
 * intégrée à la fiche. Rendu au build : si la carte n'a pas encore été exportée
 * dans `public/cartes`, rien ne s'affiche plutôt qu'un cadre vide.
 */
export function CodeMap() {
  const file = path.join(process.cwd(), "public", GUFO_MAP_URL);
  if (!existsSync(file)) return null;
  return <CodeMapFrame src={GUFO_MAP_URL} />;
}
