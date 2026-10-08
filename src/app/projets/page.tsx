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
          <li key={slug} className="border-b border-line">
            <Link
              href={`/projets/${slug}`}
              className="group grid gap-x-8 gap-y-2 py-6 hover:bg-panel sm:grid-cols-[8.5rem_1fr_auto] sm:px-4"
            >
              <span className="font-mono text-sm text-dim">{meta.id}</span>
              <span>
                <span className="block text-lg font-semibold underline-offset-4 group-hover:text-amber group-hover:underline">
                  {meta.title}
                </span>
                <span className="mt-1 block text-dim">{meta.summary}</span>
                {meta.stack.length > 0 ? (
                  <span className="mt-3 block font-mono text-xs text-dim">
                    {meta.stack.join(", ")}
                  </span>
                ) : null}
              </span>
              <span className="text-sm text-dim">{meta.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
