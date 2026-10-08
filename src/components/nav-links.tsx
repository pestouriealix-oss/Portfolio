"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelIcon, type PixelIconName } from "@/components/pixel-icon";
import { navigation } from "@/config/site";

/** Icône affichée sous le menu, selon la page. */
function iconFor(pathname: string): PixelIconName | null {
  if (pathname === "/") return "invader";
  if (pathname.startsWith("/projets")) return "tetris";
  if (pathname.startsWith("/competences")) return "heart";
  if (pathname.startsWith("/experience")) return "coin";
  if (pathname.startsWith("/formation")) return "snake";
  if (pathname.startsWith("/contact")) return "ghost";
  return null;
}

/** Composant client : il lit l'URL pour marquer la page active et choisir l'icône. */
export function NavLinks() {
  const pathname = usePathname();
  const icon = iconFor(pathname);

  return (
    <nav aria-label="Navigation principale" className="flex flex-col items-end gap-2">
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
      {icon ? <PixelIcon name={icon} /> : null}
    </nav>
  );
}
