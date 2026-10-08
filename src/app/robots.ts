import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /admin n'existe que pour ceux qui lisent ce fichier.
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
