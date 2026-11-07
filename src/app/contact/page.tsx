import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Container } from "@/components/container";
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
    <Container className="pt-36 pb-28 sm:pt-44">
      <PageHeader title="Contact" command="nc -lvnp 4444">
        Une question, une proposition ou un challenge à partager : écris-moi.
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
        <dl className="glass reveal self-start rounded-3xl px-6 py-2">
          {channels.map((channel) => (
            <div key={channel.label} className="border-b border-white/[0.08] py-4 last:border-b-0">
              <dt className="font-mono text-[11px] tracking-[0.06em] text-dim uppercase">
                {channel.label}
              </dt>
              <dd className="mt-1 break-words">
                {channel.href ? (
                  <a
                    href={channel.href}
                    rel="noopener noreferrer me"
                    className="font-mono text-sm text-amber underline-offset-4 hover:underline"
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

        <section aria-labelledby="titre-formulaire" className="glass reveal rounded-3xl p-6 sm:p-8">
          <h2 id="titre-formulaire" className="mb-6 text-2xl font-semibold tracking-[-0.02em]">
            Écris-moi
          </h2>
          <ContactForm />
        </section>
      </div>
    </Container>
  );
}
