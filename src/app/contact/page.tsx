import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Alix-Pierre Pestourie.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, github, linkedin } = siteConfig.links;

  const channels = [
    email ? { label: "E-mail", value: email, href: `mailto:${email}` } : null,
    github ? { label: "GitHub", value: github.replace(/^https?:\/\//, ""), href: github } : null,
    linkedin
      ? { label: "LinkedIn", value: linkedin.replace(/^https?:\/\//, ""), href: linkedin }
      : null,
  ].filter((channel) => channel !== null);

  return (
    <>
      <PageHeader title="Contact" command={`nc -v ${siteConfig.handle} 587`}>
        Une question, une proposition ou un challenge à partager : écris-moi.
      </PageHeader>

      {channels.length > 0 ? (
        <dl className="max-w-2xl border-t border-line">
          {channels.map((channel) => (
            <div
              key={channel.label}
              className="grid gap-1 border-b border-line py-5 sm:grid-cols-[8rem_1fr]"
            >
              <dt className="text-dim">{channel.label}</dt>
              <dd>
                <a
                  href={channel.href}
                  rel="noopener noreferrer me"
                  className="font-mono text-sm text-amber underline underline-offset-4"
                >
                  {channel.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="max-w-2xl border-l-2 border-alert pl-4">
          Aucune coordonnée n&apos;est encore renseignée. Ajoute ton e-mail, ton GitHub et ton
          LinkedIn dans <code className="font-mono text-sm">src/config/site.ts</code>.
        </p>
      )}
    </>
  );
}
