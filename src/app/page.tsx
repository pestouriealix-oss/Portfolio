import { Container } from "@/components/container";
import { ProjectCard } from "@/components/project-card";
import { ScanOutput, type ScanRow } from "@/components/scan-output";
import { siteConfig } from "@/config/site";
import { skillDomains } from "@/content/skills";
import { getProjects } from "@/lib/projects";
import { delay } from "@/lib/style";

const facts = [
  { label: "Formation", value: `Cycle ingénieur informatique · ${siteConfig.school}` },
  { label: "Terrain", value: "Web full-stack · Linux · réseaux" },
  { label: "Projet phare", value: "Gufo · coach League of Legends" },
];

export default async function HomePage() {
  const projects = await getProjects();

  // Même ordre que la navigation. Les ports restent croissants, comme dans une vraie
  // sortie nmap, et chacun est un clin d'œil : 80 et 443 pour le web, 514 (syslog) pour le
  // journal des expériences, 636 (LDAPS, l'annuaire) pour la formation, 4444 (le port
  // d'écoute par défaut de netcat et Metasploit) pour le contact.
  const rows: ScanRow[] = [
    {
      port: "80/tcp",
      service: "projets",
      href: "/projets",
      detail: `${projects.length} étude${projects.length > 1 ? "s" : ""} de cas`,
    },
    {
      port: "443/tcp",
      service: "competences",
      href: "/competences",
      detail: `matrice sur ${skillDomains.length} domaines`,
    },
    {
      port: "514/tcp",
      service: "experience",
      href: "/experience",
      detail: "société, saison, bénévolat",
    },
    {
      port: "636/tcp",
      service: "formation",
      href: "/formation",
      detail: `${siteConfig.school}, ${siteConfig.year}`,
    },
    {
      port: "4444/tcp",
      service: "contact",
      href: "/contact",
      detail: "m'écrire, GitHub, LinkedIn",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[1100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-64 left-1/2 h-[900px] w-[1100px] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, rgb(255 180 84 / 0.14), transparent)" }}
      />

      <Container className="relative pt-36 pb-28 sm:pt-44">
        <p className="glass rise inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-3 font-mono text-xs text-[#c9cfe3]">
          <span className="relative inline-block size-2" aria-hidden="true">
            <span className="ping absolute inset-0 rounded-full bg-open" />
            <span className="absolute inset-0 rounded-full bg-open" />
          </span>
          hôte actif · {siteConfig.year} informatique · {siteConfig.school}, {siteConfig.city}
        </p>

        <h1
          className="rise mt-7 max-w-[980px] text-[clamp(3rem,7.6vw,6.75rem)] leading-[0.96] font-[650] tracking-[-0.048em]"
          style={delay(1)}
        >
          Comprendre les systèmes,
          <br />
          <span className="text-gradient">jusqu&apos;au dernier octet.</span>
        </h1>

        <p
          className="rise mt-8 max-w-[720px] text-lg text-dim sm:text-[21px] sm:leading-relaxed"
          style={delay(2)}
        >
          Je suis <strong className="font-semibold text-text">{siteConfig.name}</strong>, élève
          ingénieur en informatique à l&apos;
          <strong className="font-semibold text-text">{siteConfig.school}</strong>. Mon terrain :{" "}
          <strong className="font-semibold text-text">
            le développement full-stack, Linux et les réseaux
          </strong>
          . Mon plus gros projet, Gufo, est un coach League of Legends : 24 000 lignes de TypeScript
          et 220 tests automatisés.
        </p>

        <dl className="rise mt-11 grid gap-3 sm:grid-cols-3" style={delay(3)}>
          {facts.map((fact) => (
            <div key={fact.label} className="glass rounded-[20px] px-5 py-4">
              <dt className="font-mono text-[11px] tracking-[0.06em] text-dim uppercase">
                {fact.label}
              </dt>
              <dd className="mt-1.5 font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="rise mt-16" style={delay(4)}>
          <ScanOutput rows={rows} />
        </div>

        <section aria-labelledby="titre-projets" className="mt-36">
          <p className="font-mono text-xs text-amber">80/tcp · /projets</p>
          <h2
            id="titre-projets"
            className="mt-3.5 text-[clamp(2.25rem,4.6vw,3.75rem)] leading-none font-[650] tracking-[-0.04em]"
          >
            Ce que j&apos;ai construit.
          </h2>
          <p className="mt-4 max-w-[620px] text-lg text-dim">
            Chaque projet a son propre univers : le problème, ce que j&apos;ai fait, et ce que ça
            mesure.
          </p>
          <div className="mt-11 grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.slug} className="reveal">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
