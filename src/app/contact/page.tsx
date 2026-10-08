import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Alix-Pierre Pestourie.",
  alternates: { canonical: "/contact" },
};

const stripProtocol = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function ContactPage() {
  const { email, github, linkedin } = siteConfig.links;

  const channels = [
    email ? { label: "E-mail", value: email, href: `mailto:${email}` } : null,
    { label: "Où je suis", value: siteConfig.locations, href: null },
    linkedin ? { label: "LinkedIn", value: stripProtocol(linkedin), href: linkedin } : null,
    github ? { label: "GitHub", value: stripProtocol(github), href: github } : null,
  ].filter((channel) => channel !== null);

  return (
    <>
      <PageHeader title="Contact" command="nc -lvnp 4444">
        Une question, une proposition ou un challenge à partager : écris-moi.
      </PageHeader>

      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[2fr_3fr]">
        <dl className="border-t border-line">
          {channels.map((channel) => (
            <div key={channel.label} className="border-b border-line py-5">
              <dt className="text-sm text-dim">{channel.label}</dt>
              <dd className="mt-1 break-words">
                {channel.href ? (
                  <a
                    href={channel.href}
                    rel="noopener noreferrer me"
                    className="font-mono text-sm text-amber underline underline-offset-4"
                  >
                    {channel.value}
                  </a>
                ) : (
                  channel.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="titre-formulaire">
          <h2 id="titre-formulaire" className="mb-6 font-mono text-lg font-semibold">
            Écris-moi
          </h2>
          <ContactForm />
        </section>
      </div>
    </>
  );
}
