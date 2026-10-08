import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          <span aria-hidden="true" className="text-amber">
            ~/
          </span>
          {siteConfig.handle}
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
