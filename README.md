# Portfolio d'Alix-Pierre Pestourie

Site personnel statique : Next.js 16 (App Router), TypeScript strict, Tailwind CSS 4, contenu en MDX validé par Zod.

## Démarrer

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

| Commande            | Rôle                                          |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Build de production (valide aussi le contenu) |
| `npm run lint`      | ESLint                                        |
| `npm run typecheck` | Vérification TypeScript                       |
| `npm run format`    | Prettier                                      |

## Où modifier quoi

| Je veux…                           | Fichier                                           |
| ---------------------------------- | ------------------------------------------------- |
| Changer mon identité, mes liens    | `src/config/site.ts`                              |
| Ajouter un projet                  | `src/content/projects/<slug>.mdx`                 |
| Modifier la matrice de compétences | `src/content/skills.ts`                           |
| Modifier expérience et formation   | `src/content/timeline.ts`                         |
| Changer couleurs et polices        | `src/app/globals.css` (bloc `@theme`)             |
| Donner un univers à un projet      | `src/content/project-themes.ts`                   |
| Ajouter une brique d'étude de cas  | `src/components/case/`, puis `mdx-components.tsx` |

### Ajouter un projet

Crée `src/content/projects/mon-projet.mdx`. Le nom du fichier devient l'URL (`/projets/mon-projet`).

```mdx
export const metadata = {
  id: "PRJ-2026-06",
  title: "Titre",
  kind: "projet personnel", // cadre affiché au-dessus du titre
  period: "2026", // facultatif
  tagline: "Une accroche", // facultatif ; taglineAccent en est la fin, mise en couleur
  summary: "Une phrase, 200 caractères maximum.",
  date: "2026-10-01",
  status: "En cours", // "En production" | "En cours" | "Terminé" | "Planifié" | "Archivé"
  stack: ["Python"],
  repo: "https://github.com/…", // facultatif
};

<Pitch
  items={[
    { label: "Le problème", title: "…", text: "…" },
    { label: "La question", title: "…", text: "…" },
    { label: "La réponse", title: "…", text: "…" },
  ]}
/>

## Contexte

…
```

Le schéma est dans `src/lib/projects.ts`. Un champ invalide fait échouer `npm run build`, donc la CI.
Ajoute `draft: true` tant qu'une fiche est incomplète : un bandeau l'indique et la page n'est pas indexée. `date` est facultative.

Les briques disponibles dans un fichier MDX, sans import : `Pitch` (problème, question, réponse), `Figures` (chiffres mesurés, avec leur source), `Flow` (chaîne d'étapes), `Choices` (choix d'ingénieur), `Caption`, `Note`, et pour Gufo `DraftDemo` et `GufoPlan`. L'univers du projet (couleurs, image animée, police de titre) se déclare dans `src/content/project-themes.ts`, sous le nom du fichier.

## Choix d'architecture

- **Presque tout est statique.** Chaque page est pré-rendue au build. Les composants client se limitent à ce qui réagit : la barre de navigation (page active, progression du défilement), le formulaire de contact, la relance du scan et les deux démos de la fiche Gufo.
- **Un univers par projet.** Chaque fiche redéfinit des variables CSS (`--u-accent`, `--u-bg`…) : les composants des études de cas s'y adaptent sans réglage. Les images animées sont en CSS et SVG, sans ressource externe.
- **Animations sobres.** Toutes s'arrêtent si l'utilisateur a demandé à réduire les mouvements, et le contenu reste visible sans elles.
- **Contenu dans Git.** Pas de base de données ni de CMS : les projets sont des fichiers MDX typés.
- **Aucune ressource tierce.** Les polices sont auto-hébergées (`@fontsource`, et les polices de Gufo sous licence OFL dans `src/app/fonts`), ce qui permet une CSP en `'self'`.
- **En-têtes de sécurité** définis dans `next.config.ts` : CSP, HSTS, `nosniff`, `frame-ancestors 'none'`, Permissions-Policy.
  `script-src` garde `'unsafe-inline'` : une CSP à nonce imposerait un rendu dynamique. C'est le compromis à lever en priorité si le site devient dynamique.
- **Formulaire de contact** : Server Action validée par Zod, champ piège anti-robots, limite de débit par IP, envoi par l'API HTTP de Resend. La clé `RESEND_API_KEY` ne quitte jamais le serveur.
- **`/.well-known/security.txt`** (RFC 9116) généré depuis la configuration.

## Déployer

**Vercel** : importer le dépôt, définir `NEXT_PUBLIC_SITE_URL` avec l'URL de production.

**Docker / VPS** :

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://mon-domaine.fr -t portfolio .
docker run -p 3000:3000 portfolio
```

À placer derrière un reverse proxy qui termine le TLS (Caddy, Traefik, nginx).
