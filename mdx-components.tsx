import type { MDXComponents } from "mdx/types";

/** Point d'extension requis par @next/mdx : on y branchera les composants MDX sur mesure. */
export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return components;
}
