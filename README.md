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

| Je veux…                           | Fichier                               |
| ---------------------------------- | ------------------------------------- |
| Changer mon identité, mes liens    | `src/config/site.ts`                  |
| Ajouter un projet                  | `src/content/projects/<slug>.mdx`     |
| Modifier la matrice de compétences | `src/content/skills.ts`               |
| Modifier expérience et formation   | `src/content/timeline.ts`             |
| Changer couleurs et polices        | `src/app/globals.css` (bloc `@theme`) |

### Ajouter un projet

Crée `src/content/projects/mon-projet.mdx`. Le nom du fichier devient l'URL (`/projets/mon-projet`).

```mdx
export const metadata = {
  id: "PRJ-2026-03",
  title: "Titre",
  summary: "Une phrase, 200 caractères maximum.",
  date: "2026-10-01",
  status: "En cours", // "En production" | "En cours" | "Terminé" | "Planifié" | "Archivé"
  stack: ["Python"],
  repo: "https://github.com/…", // facultatif
};

## Problème

…
```

Le schéma est dans `src/lib/projects.ts`. Un champ invalide fait échouer `npm run build`, donc la CI.
Ajoute `draft: true` tant qu'une fiche est incomplète : un bandeau l'indique et la page n'est pas indexée. `date` est facultative.

## Choix d'architecture

- **Tout est statique.** Chaque page est pré-rendue au build ; le seul composant client est la navigation (page active).
- **Contenu dans Git.** Pas de base de données ni de CMS : les projets sont des fichiers MDX typés.
- **Aucune ressource tierce.** Les polices sont auto-hébergées (`@fontsource`), ce qui permet une CSP en `'self'`.
- **En-têtes de sécurité** définis dans `next.config.ts` : CSP, HSTS, `nosniff`, `frame-ancestors 'none'`, Permissions-Policy.
  `script-src` garde `'unsafe-inline'` : une CSP à nonce imposerait un rendu dynamique. C'est le compromis à lever en priorité si le site devient dynamique.
- **`/.well-known/security.txt`** (RFC 9116) généré depuis la configuration.

## Déployer

**Vercel** : importer le dépôt, définir `NEXT_PUBLIC_SITE_URL` avec l'URL de production.

**Docker / VPS** :

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://mon-domaine.fr -t portfolio .
docker run -p 3000:3000 portfolio
```

À placer derrière un reverse proxy qui termine le TLS (Caddy, Traefik, nginx).
