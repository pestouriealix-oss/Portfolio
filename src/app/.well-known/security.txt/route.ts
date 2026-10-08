import { siteConfig } from "@/config/site";

// Généré une fois au build : l'expiration est donc repoussée à chaque déploiement.
export const dynamic = "force-static";

/** security.txt conforme à la RFC 9116 : où signaler une vulnérabilité sur ce site. */
export function GET() {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const contact = siteConfig.links.email
    ? `mailto:${siteConfig.links.email}`
    : `${siteConfig.url}/contact`;

  const body = [
    `Contact: ${contact}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: fr, en",
    `Canonical: ${siteConfig.url}/.well-known/security.txt`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
