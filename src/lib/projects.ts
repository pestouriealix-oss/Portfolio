import { readdir } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { ComponentType } from "react";
import { z } from "zod";

/**
 * Pipeline de contenu : un projet = un fichier MDX dans src/content/projects
 * qui exporte un objet `metadata`. Le schéma Zod est appliqué au build, donc
 * un champ manquant ou mal typé casse la compilation plutôt que la production.
 */
export const projectStatuses = [
  "En production",
  "En cours",
  "Terminé",
  "Planifié",
  "Archivé",
] as const;

const projectSchema = z.object({
  /** Identifiant au format des avis de sécurité : PRJ-AAAA-NN. */
  id: z.string().regex(/^PRJ-\d{4}-\d{2}$/, "Format attendu : PRJ-AAAA-NN"),
  title: z.string().min(1),
  summary: z.string().min(1).max(200),
  /** Facultative tant que la date exacte n'est pas connue. */
  date: z.iso.date().optional(),
  status: z.enum(projectStatuses),
  stack: z.array(z.string().min(1)),
  repo: z.url().optional(),
  /** Fiche incomplète : un bandeau l'indique et la page n'est pas indexée. */
  draft: z.boolean().default(false),
});

export type ProjectMeta = z.infer<typeof projectSchema>;
export type Project = { slug: string; meta: ProjectMeta; Content: ComponentType };

const CONTENT_DIR = path.join(process.cwd(), "src/content/projects");

export const getProjectSlugs = cache(async (): Promise<string[]> => {
  const files = await readdir(CONTENT_DIR);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  // Le slug ne sert de chemin d'import que s'il correspond à un fichier connu.
  if (!(await getProjectSlugs()).includes(slug)) return null;

  const mod = await import(`@/content/projects/${slug}.mdx`);
  const parsed = projectSchema.safeParse(mod.metadata);
  if (!parsed.success) {
    throw new Error(`Métadonnées invalides dans ${slug}.mdx :\n${z.prettifyError(parsed.error)}`);
  }
  return { slug, meta: parsed.data, Content: mod.default };
});

/** Tous les projets, triés par statut (ordre de `projectStatuses`) puis par identifiant décroissant. */
export const getProjects = cache(async (): Promise<Project[]> => {
  const projects = await Promise.all((await getProjectSlugs()).map(getProject));
  return projects
    .filter((project): project is Project => project !== null)
    .sort(
      (a, b) =>
        projectStatuses.indexOf(a.meta.status) - projectStatuses.indexOf(b.meta.status) ||
        b.meta.id.localeCompare(a.meta.id),
    );
});

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
    new Date(isoDate),
  );
}
