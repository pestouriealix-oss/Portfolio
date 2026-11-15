import type { MDXComponents } from "mdx/types";
import { Caption, Flow, Note, Specs } from "@/components/case/blocks";
import { DraftDemo } from "@/components/case/draft-demo";
import { Architecture } from "@/components/case/architecture";

/**
 * Point d'extension requis par @next/mdx. Les briques des études de cas sont
 * déclarées ici : les fichiers MDX les utilisent sans les importer.
 */
const caseComponents = {
  Architecture,
  Caption,
  DraftDemo,
  Flow,
  Note,
  Specs,
};

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return { ...caseComponents, ...components };
}
