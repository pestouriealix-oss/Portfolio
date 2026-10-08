/**
 * Parcours, regroupé par rubrique. Dans chaque rubrique, du plus récent au plus ancien.
 * Les entrées `placeholder` contiennent une information à confirmer ou à compléter.
 */
export type TimelineEntry = {
  period: string;
  title: string;
  place: string;
  description: string;
  placeholder?: boolean;
};

export type TimelineSection = { title: string; entries: TimelineEntry[] };

export const timeline: TimelineSection[] = [
  {
    title: "Expériences et engagement",
    entries: [
      {
        period: "Depuis 2021",
        title: "Cofondateur d'ULTRA.Digital",
        place: "Bordeaux",
        description:
          "Société de création de sites web : sites vitrines et boutiques en ligne pour des entreprises et des indépendants. J'y ai accompagné les clients de la définition de leur besoin à la mise en ligne, en suivant les développements et en validant les livrables.",
      },
      {
        period: "Été 2026",
        title: "Emploi saisonnier dans une base de canoë",
        place: "Saint-Julien-de-Lampon, Dordogne",
        description:
          "Un mois et demi en poste polyvalent : accueil des clients, gestion de l'affluence sur la base, conduite des navettes.",
      },
      {
        period: "Janvier – mai 2026",
        title: "Projet solidaire à l'Association d'Entraide du Calaisis",
        place: "Calais",
        description:
          "Bénévolat en équipe de quatre dans une association d'aide alimentaire : dix samedis matin, environ trente heures chacun, à décharger les camions, trier les denrées et préparer la distribution réservée aux étudiants.",
      },
    ],
  },
  {
    title: "Formation",
    entries: [
      {
        period: "2026 – 2027",
        title: "Cycle ingénieur informatique, deuxième année (ING2)",
        place: "EILCO, Calais",
        description:
          "Administration réseau, génie logiciel, intelligence artificielle, systèmes embarqués, méthodes agiles.",
      },
      {
        period: "2025 – 2026",
        title: "Cycle ingénieur informatique, première année (ING1)",
        place: "EILCO, Calais",
        description:
          "Algorithmique et programmation en C, programmation orientée objet en Java, systèmes d'exploitation, réseaux, bases de données, développement web.",
      },
      {
        period: "2022 – 2025",
        title: "Classe préparatoire TSI",
        place: "Lycée Léonce Vieljeux, La Rochelle",
        description:
          "Mathématiques, physique et sciences de l'ingénieur. TIPE sur l'atténuation de la fibre optique et les phénomènes de diffusion.",
      },
      {
        period: "2019 – 2022",
        title: "Baccalauréat STI2D, option systèmes d'information et numérique",
        place: "Lycée Gustave Eiffel, Bordeaux",
        description: "Sciences et technologies de l'industrie et du développement durable.",
      },
    ],
  },
];
