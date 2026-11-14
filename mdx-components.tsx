import type { MDXComponents } from "mdx/types";
import { Caption, Flow, Note, Specs } from "@/components/case/blocks";
import { DraftDemo } from "@/components/case/draft-demo";
import { GufoArchitecture } from "@/components/case/gufo-architecture";

/**
 * Point d'extension requis par @next/mdx. Les briques des études de cas sont
 * déclarées ici : les fichiers MDX les utilisent sans les importer.
 */
const caseComponents = {
  Caption,
  DraftDemo,
  Flow,
  GufoArchitecture,
  Note,
  Specs,
};

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return { ...caseComponents, ...components };
}
