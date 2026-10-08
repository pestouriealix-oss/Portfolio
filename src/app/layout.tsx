import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// Polices auto-hébergées : aucune requête vers un tiers, ce qui permet une CSP en 'self'.
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/martian-mono";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-amber focus:px-3 focus:py-2 focus:text-ink"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" className="mx-auto w-full max-w-5xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
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
