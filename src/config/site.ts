/**
 * Source unique de vérité pour l'identité du site.
 * Tout ce qui vaut `null` est simplement masqué dans l'interface :
 * renseigne les valeurs au fur et à mesure.
 */
export const siteConfig = {
  name: "Alix-Pierre Pestourie",
  /** Nom d'hôte affiché dans le scan de la page d'accueil. */
  handle: "alix-pierre.pestourie",
  role: "Élève ingénieur en informatique",
  school: "EILCO",
  city: "Calais",
  year: "ING2",
  description:
    "Alix-Pierre Pestourie, élève ingénieur en informatique à l'EILCO (Calais), en deuxième année du cycle ingénieur. Orientation cybersécurité.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Exemple : "Stage de 3 mois à partir de juin 2027". */
  availability: null as string | null,
  links: {
    email: "pestouriealix@gmail.com" as string | null,
    github: "https://github.com/pestouriealix-oss" as string | null,
    linkedin: "https://www.linkedin.com/in/alix-pestourie-343969331/" as string | null,
  },
} as const;

export const navigation = [
  { href: "/projets", label: "Projets" },
  { href: "/competences", label: "Compétences" },
  { href: "/parcours", label: "Parcours" },
  { href: "/contact", label: "Contact" },
] as const;
