"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PixelIcon, type PixelIconName } from "@/components/pixel-icon";
import { navigation, siteConfig } from "@/config/site";
import { projectThemes } from "@/content/project-themes";

/** Icône de jeu affichée au bout de la barre, selon la page. */
function iconFor(pathname: string): PixelIconName | null {
  if (pathname === "/") return "invader";
  if (pathname.startsWith("/projets")) return "tetris";
  if (pathname.startsWith("/competences")) return "heart";
  if (pathname.startsWith("/experience")) return "coin";
  if (pathname.startsWith("/formation")) return "snake";
  if (pathname.startsWith("/contact")) return "ghost";
  return null;
}

/** Sur une fiche projet, la barre prend l'accent de l'univers du projet. */
function accentFor(pathname: string): { accent: string; onAccent: string } | null {
  const slug = pathname.match(/^\/projets\/([^/]+)/)?.[1];
  const theme = slug ? projectThemes[slug] : undefined;
  return theme ? { accent: theme.accent, onAccent: theme.onAccent } : null;
}

/**
 * Barre de navigation flottante en verre. Composant client : elle lit l'URL
 * pour marquer la page active, et suit le défilement pour la barre de progression.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const icon = iconFor(pathname);
  const projectAccent = accentFor(pathname);
  const progressRef = useRef<HTMLDivElement>(null);

  // La progression est écrite directement dans le style : aucun rendu React par défilement.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressRef.current?.style.setProperty("transform", `scaleX(${ratio})`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const accent = projectAccent?.accent ?? "var(--color-amber)";
  const onAccent = projectAccent?.onAccent ?? "var(--color-ink)";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="glass pointer-events-auto relative mx-auto flex max-w-5xl items-center gap-3 overflow-hidden rounded-full py-2 pr-2 pl-4 sm:gap-6 sm:pl-6">
        <Link
          href="/"
          aria-label="Accueil"
          className="shrink-0 font-mono text-[13px] font-semibold tracking-tight text-text"
        >
          <span aria-hidden="true" style={{ color: accent }}>
            ~/
          </span>
          <span className="hidden md:inline">{siteConfig.handle}</span>
        </Link>

        {/* Sur téléphone, le menu défile à l'horizontale : un fondu au bord le signale. */}
        <nav
          aria-label="Navigation principale"
          className="no-scrollbar ml-auto overflow-x-auto [mask-image:linear-gradient(to_right,#000_85%,transparent)] sm:[mask-image:none]"
        >
          <ul className="flex items-center gap-1 whitespace-nowrap">
            {navigation.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-3 py-2 text-sm transition-colors sm:px-3.5 ${
                      active ? "font-semibold" : "text-dim hover:text-text"
                    }`}
                    style={active ? { background: accent, color: onAccent } : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {icon ? (
          <span className="hidden shrink-0 pr-2 sm:block">
            <PixelIcon name={icon} />
          </span>
        ) : null}

        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-0 h-0.5 overflow-hidden rounded-full bg-white/5"
        >
          <div
            ref={progressRef}
            className="h-full origin-left"
            style={{ background: accent, transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </header>
  );
}
