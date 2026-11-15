import type { CircuitInput } from "@/lib/circuit";

/**
 * Architecture du site de la base de canoë, relevée dans le dépôt
 * (github.com/pestouriealix-oss/Refonte_Canoe) : une puce par groupe de
 * fichiers, une piste par groupe qui en importe un autre, pondérée par le
 * nombre d'imports. Les composants d'interface génériques (src/components/ui)
 * ne sont pas représentés : presque tout les importe.
 */
export const canoeCircuit: CircuitInput = {
  rows: [
    {
      name: "Routes",
      nodes: [
        {
          id: "pages",
          label: "Pages vitrine",
          sublabel: "src/routes",
          text: "Accueil, canoë, vélo, formules combinées, infos, accès, avis, FAQ et contact, en français et en anglais.",
          details: ["src/routes/index.tsx", "src/routes/canoe.tsx", "src/routes/acces.tsx", "…"],
        },
        {
          id: "booking",
          label: "Réservation",
          sublabel: "routes/reservation",
          text: "Parcours en étapes : activité, date sur un calendrier des places restantes, nombre de personnes, paiement en ligne ou sur place.",
          details: ["src/routes/reservation.tsx"],
        },
        {
          id: "auth",
          label: "Connexion",
          sublabel: "routes/auth",
          text: "Connexion de l'équipe par Supabase Auth.",
          details: ["src/routes/auth.tsx"],
        },
        {
          id: "admin",
          label: "Administration",
          sublabel: "routes/_authenticated",
          text: "Tableau de bord, réservations, activités et stock par jour. Sans session, redirection vers la connexion.",
          details: ["src/routes/_authenticated"],
        },
      ],
    },
    {
      name: "Interface",
      nodes: [
        {
          id: "components",
          label: "Composants du site",
          sublabel: "components/site",
          text: "En-tête, pied de page, barre d'actions fixe sur téléphone (appeler, réserver), galerie, météo, FAQ.",
          details: ["src/components/site"],
        },
        {
          id: "i18n",
          label: "Traductions",
          sublabel: "lib/i18n.tsx",
          text: "Dictionnaire français et anglais dans un contexte React ; la langue choisie est gardée dans le navigateur.",
          details: ["src/lib/i18n.tsx"],
        },
        {
          id: "content",
          label: "Contenu du site",
          sublabel: "lib/site.ts",
          text: "Coordonnées, liens et photos, réunis dans un seul fichier.",
          details: ["src/lib/site.ts"],
        },
      ],
    },
    {
      name: "Serveur",
      nodes: [
        {
          id: "bookingfn",
          label: "Fonctions de réservation",
          sublabel: "reservation.functions",
          text: "Fonctions serveur TanStack Start, entrées validées par Zod : activités publiques, places par jour, création d'une réservation et de sa session de paiement.",
          details: ["src/lib/reservation.functions.ts"],
        },
        {
          id: "adminfn",
          label: "Fonctions d'admin",
          sublabel: "admin.functions",
          text: "Fonctions serveur derrière un middleware qui exige une session Supabase : réservations, statistiques du jour, activités, stock.",
          details: ["src/lib/admin.functions.ts"],
        },
        {
          id: "webhook",
          label: "Webhook paiement",
          sublabel: "api/public/payments",
          text: "Reçoit l'issue du paiement et passe la réservation à confirmée ou annulée.",
          details: ["src/routes/api/public/payments/webhook.ts"],
        },
      ],
    },
    {
      name: "Données",
      nodes: [
        {
          id: "supabase",
          label: "Clients Supabase",
          sublabel: "integrations/supabase",
          text: "Client navigateur, client serveur à droits étendus, middleware d'authentification et types générés depuis le schéma.",
          details: ["src/integrations/supabase"],
        },
      ],
    },
  ],
  connectors: {
    name: "Services",
    nodes: [
      {
        id: "db",
        label: "Supabase",
        text: "PostgreSQL et authentification. Les règles d'accès sont dans la base : un visiteur peut créer une réservation, seul un administrateur peut les lire.",
        details: ["supabase/migrations"],
      },
      {
        id: "stripe",
        label: "Stripe Checkout",
        text: "Page de paiement hébergée par Stripe.",
        details: ["checkout.stripe.com"],
      },
      {
        id: "meteo",
        label: "Open-Meteo",
        text: "Température et vent du moment, affichés sur l'accueil.",
        details: ["api.open-meteo.com"],
      },
      {
        id: "osm",
        label: "OpenStreetMap",
        text: "Carte de la page d'accès.",
        details: ["openstreetmap.org"],
      },
    ],
  },
  links: [
    { from: "pages", to: "components", weight: 40 },
    { from: "pages", to: "content", weight: 9 },
    { from: "pages", to: "i18n", weight: 9 },
    { from: "booking", to: "components", weight: 4 },
    { from: "booking", to: "content", weight: 1 },
    { from: "booking", to: "i18n", weight: 1 },
    { from: "booking", to: "bookingfn", weight: 1 },
    { from: "booking", to: "stripe", weight: 1 },
    { from: "auth", to: "i18n", weight: 1 },
    { from: "auth", to: "adminfn", weight: 1 },
    { from: "auth", to: "supabase", weight: 1 },
    { from: "admin", to: "adminfn", weight: 4 },
    { from: "admin", to: "supabase", weight: 2 },
    { from: "components", to: "content", weight: 6 },
    { from: "components", to: "i18n", weight: 6 },
    { from: "components", to: "meteo", weight: 1 },
    { from: "pages", to: "osm", weight: 1 },
    { from: "bookingfn", to: "supabase", weight: 3 },
    { from: "bookingfn", to: "stripe", weight: 1 },
    { from: "adminfn", to: "supabase", weight: 2 },
    { from: "webhook", to: "supabase", weight: 1 },
    { from: "stripe", to: "webhook", weight: 1 },
    { from: "supabase", to: "db", weight: 4 },
  ],
  journeys: [
    {
      id: "reserver",
      name: "Réserver et payer en ligne",
      steps: [
        {
          node: "booking",
          text: "Le client choisit une activité ; le calendrier demande les places du mois.",
        },
        {
          node: "bookingfn",
          text: "getMonthAvailability : places du jour = stock (ou capacité de l'activité) moins les réservations non annulées ; jours bloqués, passés ou hors saison à zéro.",
        },
        {
          node: "db",
          text: "Activité, stock et réservations du mois, lus en trois requêtes parallèles.",
        },
        {
          node: "bookingfn",
          text: "createBooking revérifie les places, puis enregistre la réservation « en attente » (20 personnes au plus).",
        },
        {
          node: "stripe",
          text: "Paiement en ligne : une session Stripe Checkout est créée et le client y est redirigé.",
        },
        {
          node: "webhook",
          text: "Paiement terminé : le webhook reçoit l'événement et retrouve la réservation par son identifiant.",
        },
        { node: "db", text: "La réservation passe à « confirmée », avec la date du paiement." },
      ],
    },
    {
      id: "admin",
      name: "Consulter les réservations",
      steps: [
        {
          node: "admin",
          text: "La zone /admin vérifie la session Supabase avant de s'afficher ; sinon, direction la page de connexion.",
        },
        {
          node: "adminfn",
          text: "listBookings passe par le middleware d'authentification, puis interroge la base avec la session de l'utilisateur.",
        },
        {
          node: "db",
          text: "La règle « bookings admin read » de la base ne laisse lire les réservations qu'à un administrateur.",
        },
        {
          node: "admin",
          text: "Jusqu'à 200 réservations s'affichent, triées par date, avec leur activité.",
        },
      ],
    },
    {
      id: "langue",
      name: "Passer en anglais",
      steps: [
        { node: "components", text: "Le bouton FR / EN de l'en-tête change la langue." },
        {
          node: "i18n",
          text: "Le contexte de traduction bascule et garde le choix dans le navigateur.",
        },
        {
          node: "pages",
          text: "Chaque page relit ses textes dans le dictionnaire : tout le site passe en anglais, sans rechargement.",
        },
      ],
    },
  ],
};
