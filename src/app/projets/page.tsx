import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { siteConfig } from "@/config/site";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "Études de cas : le problème, ce que j'ai construit, les choix techniques et ce que ça mesure.",
  alternates: { canonical: "/projets" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Container className="pt-36 pb-28 sm:pt-44">
      <PageHeader title="Projets" command={`curl -s ${siteConfig.handle}:80/projets`}>
        Chaque projet est une étude de cas, dans son propre univers : le problème, ce que j&apos;ai
        construit, les choix techniques et ce que ça mesure.
      </PageHeader>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.slug} className="reveal">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </Container>
  );
}
