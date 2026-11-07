import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gufoDisplay, gufoText } from "@/app/fonts";
import { Container } from "@/components/container";
import { ProjectVisual } from "@/components/project-visual";
import { themeFor, themeVars } from "@/content/project-themes";
import { formatDate, getProject, getProjectSlugs, getProjects } from "@/lib/projects";
import { delay } from "@/lib/style";

type Props = { params: Promise<{ slug: string }> };

// Toutes les pages projet sont générées au build ; un slug inconnu renvoie une 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: project.meta.title,
    description: project.meta.summary,
    alternates: { canonical: `/projets/${slug}` },
    // Les fiches incomplètes ne sont pas indexées.
    robots: project.meta.draft ? { index: false } : undefined,
  };
}

/**
 * Étude de cas d'un projet, dans son univers : les couleurs du projet (variables
 * `--u-*`), son image animée en tête, et pour Gufo ses propres polices.
 */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { meta, Content } = project;
  const theme = themeFor(slug);
  const gufo = theme.display === "gufo";

  // Projet suivant, dans l'ordre de la page Projets (on boucle à la fin).
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;

  const eyebrow = [meta.id, meta.kind, meta.period].filter(Boolean).join(" · ");

  return (
    <article
      className={`relative overflow-hidden bg-(--u-bg) text-(--u-text) ${
        gufo ? `${gufoDisplay.variable} ${gufoText.variable} univers-gufo` : ""
      }`}
      style={themeVars(theme)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 -right-40 size-[1100px] rounded-full"
        style={{ background: `radial-gradient(closest-side, ${theme.accent}2e, transparent)` }}
      />

      <Container className="relative pt-32 pb-28 sm:pt-40">
        <Link
          href="/projets"
          className="font-mono text-xs text-(--u-dim) underline-offset-4 hover:text-(--u-text) hover:underline"
        >
          <span style={{ color: theme.accent }}>~/</span>projets/{slug}
        </Link>

        <header className="mt-8 flex flex-wrap items-center gap-x-12 gap-y-12">
          <div className="min-w-0 flex-[1_1_480px]">
            <p className="rise font-mono text-xs text-(--u-dim)">{eyebrow}</p>
            <h1
              className={`rise mt-3 ${
                gufo
                  ? "font-gufo-display text-[clamp(7rem,15vw,13rem)] leading-[0.82] font-black uppercase"
                  : "text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.98] font-[650] tracking-[-0.045em]"
              }`}
              style={delay(1)}
            >
              {meta.title}
            </h1>
            {meta.tagline ? (
              <p
                className={`rise mt-6 text-[clamp(1.4rem,2.4vw,2rem)] leading-tight tracking-[-0.01em] ${
                  gufo ? "font-bold" : "font-semibold"
                }`}
                style={delay(2)}
              >
                {meta.tagline}{" "}
                {meta.taglineAccent ? (
                  <span style={{ color: theme.accent }}>{meta.taglineAccent}</span>
                ) : null}
              </p>
            ) : null}
            <p className="rise mt-5 max-w-[560px] text-lg text-(--u-dim)" style={delay(2)}>
              {meta.summary}
            </p>

            {meta.draft ? (
              <p
                role="note"
                className="mt-6 max-w-xl rounded-2xl border border-(--u-line) px-4 py-3 text-sm"
              >
                Fiche en cours de rédaction : le projet n&apos;a pas encore commencé.
              </p>
            ) : null}

            {meta.repo || meta.report ? (
              <p className="rise mt-8 flex flex-wrap gap-3" style={delay(3)}>
                {meta.repo ? (
                  <a
                    href={meta.repo}
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center gap-2.5 rounded-full px-6 font-semibold transition-opacity hover:opacity-90"
                    style={{ background: theme.accent, color: theme.onAccent }}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m8 8-4 4 4 4" />
                      <path d="m16 8 4 4-4 4" />
                      <path d="m14 5-4 14" />
                    </svg>
                    Voir le code sur GitHub
                  </a>
                ) : null}
                {meta.report ? (
                  <a
                    href={meta.report}
                    className="inline-flex min-h-12 items-center rounded-full border border-(--u-line) px-6 font-semibold text-(--u-dim) transition-colors hover:border-(--u-accent) hover:text-(--u-text)"
                  >
                    Lire le rapport (PDF)
                  </a>
                ) : null}
              </p>
            ) : null}

            <dl className="rise mt-8 flex flex-wrap gap-2 font-mono text-xs" style={delay(3)}>
              <div className="flex gap-1.5 rounded-full border border-(--u-line) px-3 py-1.5">
                <dt className="text-(--u-dim)">statut</dt>
                <dd>{meta.status}</dd>
              </div>
              {meta.date ? (
                <div className="flex gap-1.5 rounded-full border border-(--u-line) px-3 py-1.5">
                  <dt className="text-(--u-dim)">date</dt>
                  <dd>
                    <time dateTime={meta.date}>{formatDate(meta.date)}</time>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="flex min-w-0 flex-[1_1_360px] justify-center">
            <ProjectVisual theme={theme} variant="hero" />
          </div>
        </header>

        {meta.stack.length > 0 ? (
          <ul
            aria-label="Technologies"
            className="mt-14 flex flex-wrap gap-2 border-t border-(--u-line) pt-8 font-mono text-[13px]"
          >
            {meta.stack.map((tech) => (
              <li key={tech} className="rounded-full border border-(--u-line) px-3.5 py-1.5">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="prose mt-4">
          <Content />
        </div>

        {next ? (
          <nav aria-label="Autres projets" className="mt-28 grid gap-3.5 sm:grid-cols-2">
            <Link
              href="/projets"
              className="lift block rounded-[20px] border border-(--u-line) p-6"
            >
              <span className="font-mono text-xs text-(--u-dim)">← retour</span>
              <span className="mt-1.5 block text-lg font-bold">Tous les projets</span>
            </Link>
            <Link
              href={`/projets/${next.slug}`}
              className="lift block rounded-[20px] border border-(--u-line) p-6 sm:text-right"
            >
              <span className="font-mono text-xs text-(--u-dim)">projet suivant →</span>
              <span className="mt-1.5 block text-lg font-bold">{next.meta.title}</span>
            </Link>
          </nav>
        ) : null}
      </Container>
    </article>
  );
}
