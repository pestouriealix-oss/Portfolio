import Link from "next/link";
import { ProjectVisual } from "@/components/project-visual";
import { themeFor, themeVars } from "@/content/project-themes";
import type { Project } from "@/lib/projects";

/**
 * Carte d'un projet : une fenêtre sur son univers (couleur, image animée),
 * puis l'essentiel. Toute la carte est un lien vers l'étude de cas.
 */
export function ProjectCard({ project }: { project: Project }) {
  const { slug, meta } = project;
  const theme = themeFor(slug);
  const eyebrow = [meta.id, meta.kind, meta.status === "Planifié" ? "planifié" : meta.period]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/projets/${slug}`}
      className="lift group block overflow-hidden rounded-[26px] border border-white/[0.08] bg-panel"
      style={themeVars(theme)}
    >
      <div className="relative h-56 overflow-hidden">
        <ProjectVisual theme={theme} variant="card" />
      </div>
      <div className="p-6 sm:p-7">
        <p className="font-mono text-xs text-dim">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-[28px]">
          {meta.title}
        </h3>
        <p className="mt-2 text-dim">{meta.summary}</p>
        <p className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs">
          {meta.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border px-3 py-1"
              style={{ borderColor: `${theme.accent}73`, color: theme.text }}
            >
              {tech}
            </span>
          ))}
          <span className="px-1 text-text transition-colors group-hover:text-(--u-accent)">
            Lire l&apos;étude de cas →
          </span>
        </p>
      </div>
    </Link>
  );
}
