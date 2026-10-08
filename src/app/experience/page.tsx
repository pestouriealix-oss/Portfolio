import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Timeline } from "@/components/timeline";
import { experience } from "@/content/timeline";

export const metadata: Metadata = {
  title: "Expérience",
  description: "Expériences professionnelles et engagement associatif d'Alix-Pierre Pestourie.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader title="Expérience" command="journalctl --since 2021 --reverse">
        Une société cofondée, un emploi saisonnier et un engagement associatif.
      </PageHeader>
      <Timeline entries={experience} />
    </>
  );
}
