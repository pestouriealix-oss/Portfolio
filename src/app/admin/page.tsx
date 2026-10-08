import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="max-w-2xl">
      <h1 className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
        403 : accès refusé
      </h1>
      <pre className="mt-8 overflow-x-auto border border-line bg-panel p-5 font-mono text-sm leading-7 text-dim">
        {`$ curl -s /robots.txt | grep Disallow\nDisallow: /admin`}
      </pre>
      <p className="mt-8">
        Bien vu. Un <code className="font-mono text-sm">robots.txt</code> n&apos;a jamais protégé
        quoi que ce soit : il indique surtout où regarder. Ici, il n&apos;y a rien à administrer.
      </p>
      <p className="mt-4">
        Si tu es arrivé jusqu&apos;ici, on a sûrement des choses à se dire.{" "}
        <Link href="/contact" className="text-amber underline underline-offset-4">
          Écris-moi
        </Link>
      </p>
    </div>
  );
}
