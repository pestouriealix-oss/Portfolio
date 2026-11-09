import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/config/site";
import { skillDomains, type SkillLevel } from "@/content/skills";

export const metadata: Metadata = {
  title: "Compétences",
  description:
    "Matrice de compétences par domaine : programmation, systèmes et réseaux, sécurité, données, sciences de l'ingénieur, entreprise.",
  alternates: { canonical: "/competences" },
};

/** Le niveau est porté par la forme du marqueur et par le texte, pas par la couleur seule. */
const levelMarker: Record<SkillLevel, { glyph: string; className: string }> = {
  étudié: { glyph: "■", className: "text-amber" },
  "en cours cette année": { glyph: "□", className: "text-dim" },
};

export default function SkillsPage() {
  return (
    <Container className="pt-36 pb-28 sm:pt-44">
      <PageHeader
        title="Compétences"
        command={`openssl s_client -connect ${siteConfig.handle}:443`}
      >
        Une colonne par domaine, à la manière d&apos;une matrice ATT&amp;CK. Je distingue ce que
        j&apos;ai étudié en classe préparatoire et en première année de ce que j&apos;apprends cette
        année.
      </PageHeader>

      <ul className="mb-6 flex flex-wrap gap-x-8 gap-y-1 font-mono text-xs text-dim">
        {(Object.keys(levelMarker) as SkillLevel[]).map((level) => (
          <li key={level}>
            <span aria-hidden="true" className={`mr-2 ${levelMarker[level].className}`}>
              {levelMarker[level].glyph}
            </span>
            {level}
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillDomains.map((domain) => (
          <section key={domain.name} className="glass lift reveal overflow-hidden rounded-3xl">
            <h2 className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 font-mono text-sm font-semibold">
              {domain.name}
              <span className="font-normal text-dim">{domain.skills.length}</span>
            </h2>
            <ul className="px-2 py-2">
              {domain.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04]"
                >
                  <span aria-hidden="true" className={levelMarker[skill.level].className}>
                    {levelMarker[skill.level].glyph}
                  </span>
                  <span>
                    {skill.name}
                    <span className="sr-only"> ({skill.level})</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
