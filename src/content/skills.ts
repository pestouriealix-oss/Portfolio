/**
 * Matrice de compétences, présentée comme une matrice MITRE ATT&CK :
 * une colonne par domaine, une cellule par compétence.
 *
 * Source : programme de la classe préparatoire TSI et syllabus EILCO, spécialité
 * informatique (ING1, puis premier semestre d'ING2). Retire ce que tu ne te sens
 * pas capable de défendre en entretien, ajoute ce que tu as appris par toi-même.
 */
export type SkillLevel = "étudié" | "en cours cette année";
export type Skill = { name: string; level: SkillLevel };
export type SkillDomain = { name: string; skills: Skill[] };

export const skillDomains: SkillDomain[] = [
  {
    name: "Programmation",
    skills: [
      { name: "C", level: "étudié" },
      { name: "Java", level: "étudié" },
      { name: "Python", level: "étudié" },
      { name: "SQL", level: "étudié" },
      { name: "PHP", level: "étudié" },
      { name: "HTML et CSS", level: "étudié" },
      { name: "Assembleur", level: "étudié" },
    ],
  },
  {
    name: "Systèmes et réseaux",
    skills: [
      { name: "Linux", level: "étudié" },
      { name: "Scripts shell", level: "étudié" },
      { name: "TCP/IP et modèle OSI", level: "étudié" },
      { name: "Ethernet et VLAN", level: "étudié" },
      { name: "Sockets", level: "étudié" },
      { name: "DNS, DHCP, serveur web", level: "en cours cette année" },
    ],
  },
  {
    name: "Sécurité",
    skills: [
      { name: "Pare-feu iptables", level: "en cours cette année" },
      { name: "OpenSSH", level: "en cours cette année" },
    ],
  },
  {
    name: "Données et conception",
    skills: [
      { name: "MySQL", level: "étudié" },
      { name: "Merise", level: "étudié" },
      { name: "Algorithmique", level: "étudié" },
      { name: "UML", level: "en cours cette année" },
      { name: "Méthodes agiles", level: "en cours cette année" },
      { name: "Intelligence artificielle", level: "en cours cette année" },
    ],
  },
  {
    name: "Sciences de l'ingénieur",
    skills: [
      { name: "Automatique", level: "étudié" },
      { name: "Électronique", level: "étudié" },
      { name: "Traitement du signal", level: "étudié" },
      { name: "MATLAB", level: "étudié" },
      { name: "Systèmes embarqués", level: "en cours cette année" },
      { name: "Traitement d'images", level: "en cours cette année" },
    ],
  },
  {
    name: "Entreprise et management",
    skills: [
      { name: "Management de projets", level: "étudié" },
      { name: "Management des équipes", level: "étudié" },
      { name: "Gestion et finances d'entreprise", level: "étudié" },
      { name: "Droit de l'entreprise et du travail", level: "étudié" },
      { name: "Communication", level: "étudié" },
      { name: "Entrepreneuriat", level: "en cours cette année" },
      { name: "Marketing", level: "en cours cette année" },
    ],
  },
];
