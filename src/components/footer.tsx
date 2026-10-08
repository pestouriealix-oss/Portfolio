import { siteConfig } from "@/config/site";

export function Footer() {
  const { github, linkedin } = siteConfig.links;
  const links = [
    github ? { label: "GitHub", href: github } : null,
    linkedin ? { label: "LinkedIn", href: linkedin } : null,
  ].filter((link) => link !== null);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-between gap-x-8 gap-y-2 px-5 py-6 text-sm text-dim sm:px-8">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <ul className="flex gap-x-6">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                rel="noopener noreferrer me"
                className="underline-offset-4 hover:text-text hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
