import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-mono text-3xl font-semibold tracking-tight sm:text-4xl">
        404 : page introuvable
      </h1>
      <pre className="mt-8 overflow-x-auto border border-line bg-panel p-5 font-mono text-sm leading-7 text-dim">
        {`Note: Host seems down.\nNmap done: 1 IP address (0 hosts up)`}
      </pre>
      <p className="mt-8">
        Cette adresse ne répond pas.{" "}
        <Link href="/" className="text-amber underline underline-offset-4">
          Revenir à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
