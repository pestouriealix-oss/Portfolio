import { ScanOutput, type ScanRow } from "@/components/scan-output";
import { siteConfig } from "@/config/site";
import { skillDomains } from "@/content/skills";
import { getProjects } from "@/lib/projects";

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
    <div className="grid gap-12">
      <header className="max-w-2xl">
        <h1 className="font-mono text-4xl font-semibold leading-[1.1] tracking-tighter sm:text-6xl">
          Alix-Pierre
          <br />
          Pestourie
        </h1>
        <p className="mt-6 text-lg text-dim sm:text-xl">
          Élève ingénieur en informatique à l&apos;{siteConfig.school}, à {siteConfig.city}. Je suis
          en deuxième année du cycle ingénieur et je m&apos;oriente vers la cybersécurité.
        </p>
        {siteConfig.availability ? (
          <p className="mt-4 border-l-2 border-amber pl-4 text-text">{siteConfig.availability}</p>
        ) : null}
      </header>

      <ScanOutput rows={rows} />
    </div>
  );
}
