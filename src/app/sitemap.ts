import type { MetadataRoute } from "next";
import { navigation, siteConfig } from "@/config/site";
import { getProjects } from "@/lib/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  return [
    { url: siteConfig.url, priority: 1 },
    ...navigation.map(({ href }) => ({ url: `${siteConfig.url}${href}`, priority: 0.8 })),
    ...projects
      .filter(({ meta }) => !meta.draft)
      .map(({ slug, meta }) => ({
        url: `${siteConfig.url}/projets/${slug}`,
        lastModified: meta.date,
        priority: 0.6,
      })),
  ];
}
