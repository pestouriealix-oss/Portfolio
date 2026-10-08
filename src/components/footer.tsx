import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-between gap-x-8 gap-y-2 px-5 py-6 text-sm text-dim sm:px-8">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <p>
          Signaler une faille :{" "}
          <a href="/.well-known/security.txt" className="text-text underline underline-offset-4">
            security.txt
          </a>
        </p>
      </div>
    </footer>
  );
}
