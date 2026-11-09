import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// Polices auto-hébergées : aucune requête vers un tiers, ce qui permet une CSP en 'self'.
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/martian-mono";
import "./globals.css";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} : ${siteConfig.role}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
  // L'image d'aperçu vient de src/app/opengraph-image.png (convention de fichier Next.js).
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0f1424" };

/** Données structurées schema.org pour les moteurs de recherche. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  url: siteConfig.url,
  jobTitle: siteConfig.role,
  alumniOf: { "@type": "CollegeOrUniversity", name: siteConfig.school },
  sameAs: [siteConfig.links.github, siteConfig.links.linkedin].filter(Boolean),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-20 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-ink"
        >
          Aller au contenu
        </a>
        <SiteHeader />
        {/* Pleine largeur : chaque page centre son contenu, et une fiche projet peint son fond. */}
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <script
          type="application/ld+json"
          // "<" est échappé pour empêcher toute fermeture prématurée de la balise script.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
