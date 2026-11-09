import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { delay } from "@/lib/style";

export const metadata: Metadata = {
  title: "Accès refusé",
  robots: { index: false, follow: false },
};

/**
 * Pot de miel assumé : robots.txt interdit /admin, et c'est justement la première
 * ligne qu'on lit quand on audite un site. Il n'y a rien à administrer ici.
 */
export default function AdminPage() {
  return (
    <Container className="pt-40 pb-28 sm:pt-48">
      <div className="max-w-2xl">
        <p className="rise font-mono text-xs text-alert">HTTP 403</p>
        <h1
          className="rise mt-4 text-5xl leading-[0.95] font-semibold tracking-[-0.045em] sm:text-7xl"
          style={delay(1)}
        >
          Accès refusé.
        </h1>
        <pre
          className="glass rise mt-10 overflow-x-auto rounded-[22px] p-6 font-mono text-sm leading-7 text-dim"
          style={delay(2)}
        >
          {`$ curl -s /robots.txt | grep Disallow\nDisallow: /admin`}
        </pre>
        <p className="rise mt-8" style={delay(3)}>
          Bien vu. Un <code className="font-mono text-sm">robots.txt</code> n&apos;a jamais protégé
          quoi que ce soit : il indique surtout où regarder. Ici, il n&apos;y a rien à administrer.
        </p>
        <p className="rise mt-4" style={delay(3)}>
          Si tu es arrivé jusqu&apos;ici, on a sûrement des choses à se dire.{" "}
          <Link href="/contact" className="text-amber underline underline-offset-4">
            Écris-moi
          </Link>
        </p>
      </div>
    </Container>
  );
}
