import type { MDXComponents } from "mdx/types";
import { Caption, Choices, Figures, Flow, Note, Pitch } from "@/components/case/blocks";
import { CodeMap } from "@/components/case/code-map";
import { DraftDemo } from "@/components/case/draft-demo";
import { GufoPlan } from "@/components/case/gufo-plan";

/**
 * Point d'extension requis par @next/mdx. Les briques des études de cas sont
 * déclarées ici : les fichiers MDX les utilisent sans les importer.
 */
const caseComponents = {
  Caption,
  Choices,
  CodeMap,
  DraftDemo,
  Figures,
  Flow,
  GufoPlan,
  Note,
  Pitch,
};

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return { ...caseComponents, ...components };
}
