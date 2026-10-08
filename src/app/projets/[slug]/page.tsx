import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getProject, getProjectSlugs } from "@/lib/projects";

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

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { meta, Content } = project;

  return (
    <article>
      <Link
        href="/projets"
        className="text-sm text-dim underline underline-offset-4 hover:text-text"
      >
        Tous les projets
      </Link>

      <header className="mt-8 border-b border-line pb-10">
        <p className="font-mono text-sm text-amber">{meta.id}</p>
        <h1 className="mt-3 max-w-3xl font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-dim">{meta.summary}</p>

        {meta.draft ? (
          <p role="note" className="mt-6 max-w-2xl border-l-2 border-alert pl-4 text-sm">
            Fiche en cours de rédaction.
          </p>
        ) : null}

        <dl className="mt-8 grid max-w-3xl gap-x-10 gap-y-4 text-sm sm:grid-cols-[auto_auto_1fr]">
          <div>
            <dt className="text-dim">Statut</dt>
            <dd>{meta.status}</dd>
          </div>
          {meta.date ? (
            <div>
              <dt className="text-dim">Date</dt>
              <dd>
                <time dateTime={meta.date}>{formatDate(meta.date)}</time>
              </dd>
            </div>
          ) : null}
          {meta.stack.length > 0 ? (
            <div>
              <dt className="text-dim">Technologies</dt>
              <dd>{meta.stack.join(", ")}</dd>
            </div>
          ) : null}
          {meta.repo ? (
            <div>
              <dt className="text-dim">Code source</dt>
              <dd>
                <a
                  href={meta.repo}
                  rel="noopener noreferrer"
                  className="text-amber underline underline-offset-4"
                >
                  Voir le dépôt
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      <div className="prose mt-10">
        <Content />
      </div>
    </article>
  );
}
