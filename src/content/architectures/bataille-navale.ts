import type { CircuitInput } from "@/lib/circuit";

/**
 * Architecture de la bataille navale, relevée dans le dépôt
 * (github.com/pestouriealix-oss/Bataille-navale) : une puce par module C, une
 * piste par module qui appelle les fonctions d'un autre, pondérée par le nombre
 * d'appels. Les connecteurs sont ce que le programme utilise hors de son code :
 * le terminal, le tas, le générateur aléatoire et les fichiers.
 */
export const batailleNavaleCircuit: CircuitInput = {
  rows: [
    {
      name: "Entrée",
      nodes: [
        {
          id: "main",
          label: "Point d'entrée",
          sublabel: "main.c",
          text: "Initialise le générateur aléatoire avec l'heure (srand), puis ouvre le menu principal.",
          details: ["main.c"],
        },
      ],
    },
    {
      name: "Interface",
      nodes: [
        {
          id: "affichage",
          label: "Menus et affichage",
          sublabel: "affichage.c",
          text: "Menu principal, choix du mode et de la difficulté, règles, bandeau de partie (tour et temps écoulé), classements.",
          details: ["affichage.c", "affichage.h"],
        },
      ],
    },
    {
      name: "Partie",
      nodes: [
        {
          id: "jeu",
          label: "Boucles de jeu",
          sublabel: "jeu.c",
          text: "Création des joueurs, préparation, tours en 1 contre 1 ou contre l'ordinateur, victoire, les trois niveaux de l'ordinateur et la sauvegarde en cours de partie.",
          details: ["jeu.c", "jeu.h"],
        },
      ],
    },
    {
      name: "Données",
      nodes: [
        {
          id: "grille",
          label: "Grilles",
          sublabel: "grille.c",
          text: "Plateaux de 10 × 10 alloués dynamiquement. Chaque case vaut 0 (eau), 1 (navire), 2 (raté) ou 3 (touché). Résout un tir. Module que j'ai écrit.",
          details: ["grille.c", "grille.h"],
        },
        {
          id: "bateau",
          label: "Flotte",
          sublabel: "bateau.c",
          text: "Les cinq navires : création, placement vérifié ou aléatoire, dégâts et détection du navire coulé. Module que j'ai écrit.",
          details: ["bateau.c", "bateau.h"],
        },
        {
          id: "sauvegarde",
          label: "Sauvegarde",
          sublabel: "sauvegarde.c",
          text: "Écriture binaire d'une partie : un en-tête, puis les deux joueurs avec leurs grilles et leurs flottes.",
          details: ["sauvegarde.c", "sauvegarde.h"],
        },
      ],
    },
  ],
  connectors: {
    name: "Système",
    nodes: [
      {
        id: "terminal",
        label: "Terminal",
        text: "Saisies au clavier (scanf) et affichage en couleurs ANSI.",
        details: ["stdin", "stdout"],
      },
      {
        id: "tas",
        label: "malloc / free",
        text: "Joueurs, grilles et flottes alloués sur le tas, puis libérés à la fin de chaque partie.",
        details: ["stdlib.h"],
      },
      {
        id: "hasard",
        label: "rand()",
        text: "Placement aléatoire des navires et tirs de l'ordinateur.",
        details: ["stdlib.h", "time.h"],
      },
      {
        id: "fichiers",
        label: "save_N.bin",
        text: "Fichiers de sauvegarde binaires, sur 20 emplacements.",
        details: ["save_1.bin … save_20.bin"],
      },
      {
        id: "classement",
        label: "Classements .txt",
        text: "Victoires de chaque joueur, en 1 contre 1 et contre l'ordinateur, réécrites par fichier temporaire.",
        details: ["registre_1vs1.txt"],
      },
    ],
  },
  links: [
    { from: "main", to: "affichage", weight: 1 },
    { from: "affichage", to: "jeu", weight: 5 },
    { from: "jeu", to: "affichage", weight: 26 },
    { from: "jeu", to: "bateau", weight: 21 },
    { from: "jeu", to: "grille", weight: 14 },
    { from: "jeu", to: "sauvegarde", weight: 1 },
    { from: "sauvegarde", to: "jeu", weight: 2 },
    { from: "bateau", to: "grille", weight: 1 },
    { from: "main", to: "hasard", weight: 1 },
    { from: "jeu", to: "hasard", weight: 6 },
    { from: "bateau", to: "hasard", weight: 3 },
    { from: "affichage", to: "terminal", weight: 24 },
    { from: "jeu", to: "terminal", weight: 25 },
    { from: "bateau", to: "terminal", weight: 2 },
    { from: "grille", to: "terminal", weight: 1 },
    { from: "jeu", to: "tas", weight: 1 },
    { from: "grille", to: "tas", weight: 1 },
    { from: "bateau", to: "tas", weight: 2 },
    { from: "sauvegarde", to: "fichiers", weight: 3 },
    { from: "affichage", to: "classement", weight: 8 },
  ],
  journeys: [
    {
      id: "placement",
      name: "Placer un navire",
      steps: [
        {
          node: "jeu",
          text: "La phase de préparation propose un placement au hasard, ou navire par navire.",
        },
        {
          node: "bateau",
          text: "positionnerBateau demande l'orientation (H ou V) et la première case, par exemple A5.",
        },
        { node: "terminal", text: "Le joueur répond au clavier ; -1 annule." },
        {
          node: "grille",
          text: "Avant d'écrire quoi que ce soit : la case existe, le navire ne dépasse pas du plateau, aucune de ses cases n'est occupée.",
        },
        {
          node: "bateau",
          text: "Seulement alors, ses cases passent à 1 et sa position est gardée dans la structure du navire.",
        },
      ],
    },
    {
      id: "tir",
      name: "Un tour contre l'ordinateur",
      steps: [
        {
          node: "jeu",
          text: "tourJoueurOrdi affiche les grilles du joueur et attend une case.",
        },
        {
          node: "terminal",
          text: "Le joueur tape une case, « save » pour sauvegarder, ou -1 pour quitter.",
        },
        {
          node: "grille",
          text: "tirer() : hors grille ou case déjà jouée, on redemande ; sinon la case passe à 2 (raté) ou 3 (touché).",
        },
        {
          node: "bateau",
          text: "Touché : trouverBateau retrouve le navire, enregistrerTouche compte le dégât, estCoule annonce s'il est coulé.",
        },
        {
          node: "jeu",
          text: "Flotte adverse entièrement coulée : victoire, et le classement est réécrit. Sinon, l'ordinateur joue selon sa difficulté.",
        },
        {
          node: "hasard",
          text: "Niveau facile : une case tirée au hasard, jamais une case déjà visée. Le niveau moyen vise ensuite autour de ses touches.",
        },
      ],
    },
    {
      id: "sauvegarde",
      name: "Sauvegarder la partie",
      steps: [
        { node: "terminal", text: "Le joueur tape « save » à la place d'une case." },
        {
          node: "jeu",
          text: "gestionSauvegarde demande un nom et un emplacement, de 1 à 20.",
        },
        {
          node: "sauvegarde",
          text: "sauvegarderPartie écrit l'en-tête : nom (50 octets), temps de jeu, difficulté (15 octets), tour.",
        },
        {
          node: "fichiers",
          text: "Puis chaque joueur, en blocs de taille fixe (fwrite) : nom, victoires, ses deux grilles et sa flotte.",
        },
      ],
    },
  ],
};
