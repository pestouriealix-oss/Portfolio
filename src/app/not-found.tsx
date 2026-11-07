import Link from "next/link";
import { Container } from "@/components/container";
import { delay } from "@/lib/style";

export default function NotFound() {
  return (
    <Container className="pt-40 pb-28 sm:pt-48">
      <div className="max-w-2xl">
        <p className="rise font-mono text-xs text-alert">HTTP 404</p>
        <h1
          className="rise mt-4 text-5xl leading-[0.95] font-semibold tracking-[-0.045em] sm:text-7xl"
          style={delay(1)}
        >
          Page introuvable.
        </h1>
        <pre
          className="glass rise mt-10 overflow-x-auto rounded-[22px] p-6 font-mono text-sm leading-7 text-dim"
          style={delay(2)}
        >
          {`Note: Host seems down.\nNmap done: 1 IP address (0 hosts up)`}
        </pre>
        <p className="rise mt-8" style={delay(3)}>
          Cette adresse ne répond pas.{" "}
          <Link href="/" className="text-amber underline underline-offset-4">
            Revenir à l&apos;accueil
          </Link>
        </p>
      </div>
    </Container>
  );
}
