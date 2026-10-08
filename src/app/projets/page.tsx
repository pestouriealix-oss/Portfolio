import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projets",
  description: "Études de cas : le problème, l'architecture, les compromis et les résultats.",
  alternates: { canonical: "/projets" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader title="Projets" command={`curl -s ${siteConfig.handle}:80/projets`}>
        Chaque projet est rédigé comme une étude de cas : le problème, l&apos;architecture, les
        compromis et les résultats.
      </PageHeader>

      <ul className="border-t border-line">
        {projects.map(({ slug, meta }) => (
          <li
            key={slug}
            className="grid gap-x-8 gap-y-2 border-b border-line py-7 sm:grid-cols-[8.5rem_1fr_auto]"
          >
            <span className="font-mono text-sm text-dim">{meta.id}</span>
            <div>
              <h2 className="text-lg font-semibold">
                <Link
                  href={`/projets/${slug}`}
                  className="underline-offset-4 hover:text-amber hover:underline"
                >
                  {meta.title}
                </Link>
              </h2>
              <p className="mt-1 text-dim">{meta.summary}</p>

              {meta.stack.length > 0 ? (
                <ul aria-label="Technologies" className="mt-4 flex flex-wrap gap-2">
                  {meta.stack.map((tech) => (
                    <li
                      key={tech}
                      className="border border-line px-2 py-0.5 font-mono text-xs text-dim"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                {meta.repo ? (
                  <a
                    href={meta.repo}
                    rel="noopener noreferrer"
                    className="border border-amber px-3 py-1.5 font-semibold text-amber transition-colors hover:bg-amber hover:text-ink"
                  >
                    Voir sur GitHub
                  </a>
                ) : null}
                <Link
                  href={`/projets/${slug}`}
                  className="text-text underline underline-offset-4 hover:text-amber"
                >
                  Lire l&apos;étude de cas
                </Link>
              </p>
            </div>
            <span className="text-sm text-dim">{meta.status}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
