import type { Metadata } from "next";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Timeline } from "@/components/timeline";
import { formation } from "@/content/timeline";

export const metadata: Metadata = {
  title: "Formation",
  description:
    "Formation d'Alix-Pierre Pestourie : EILCO, classe préparatoire TSI, baccalauréat STI2D.",
  alternates: { canonical: "/formation" },
};

export default function FormationPage() {
  return (
    <Container className="pt-36 pb-28 sm:pt-44">
      <PageHeader title="Formation" command={'ldapsearch -x -b "ou=formation"'}>
        Du baccalauréat technologique au cycle ingénieur, en passant par la classe préparatoire.
      </PageHeader>
      <Timeline entries={formation} />
    </Container>
  );
}
