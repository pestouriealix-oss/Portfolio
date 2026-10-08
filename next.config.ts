import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * Compromis assumé : le site est rendu statiquement (SSG), or une CSP à nonce
 * impose un rendu dynamique par requête. On garde donc 'unsafe-inline' sur
 * script-src (Next injecte des scripts inline pour l'hydratation) et on
 * verrouille tout le reste. Aucune ressource tierce n'est chargée : les polices
 * sont auto-hébergées, d'où le 'self' partout.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Clin d'oeil a ceux qui inspectent les en-tetes. ASCII uniquement.
  { key: "X-Curious", value: "Tu lis les en-tetes ? Ecris-moi : /contact" },
];

const nextConfig: NextConfig = {
  // Serveur autonome minimal pour l'image Docker (ignoré par Vercel).
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Les plugins sont passés par leur nom : Turbopack exige des options sérialisables.
const withMDX = createMDX({ options: { remarkPlugins: ["remark-gfm"] } });

export default withMDX(nextConfig);
