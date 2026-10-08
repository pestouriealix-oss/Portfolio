"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/site";

/** Seul composant client du site : il lit l'URL pour marquer la page active. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale">
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {navigation.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-amber underline decoration-2 underline-offset-8"
                    : "text-dim transition-colors hover:text-text"
                }
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
