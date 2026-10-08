import Link from "next/link";
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";

export type ScanRow = { port: string; service: string; href: string; detail: string };

/** Position de la ligne dans la séquence d'apparition (voir .scan-line dans globals.css). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Navigation de la page d'accueil, présentée comme la sortie d'un `nmap -sV` :
 * chaque "port ouvert" est une section du site. C'est une vraie liste de liens,
 * donc elle reste utilisable au clavier et par un lecteur d'écran.
 */
export function ScanOutput({ rows }: { rows: ScanRow[] }) {
  return (
    <nav
      aria-label="Sections du site"
      className="border border-line bg-panel font-mono text-[0.8rem] leading-7 sm:text-sm sm:leading-8"
    >
      <div className="border-b border-line px-4 py-2 text-dim sm:px-6">
        <span className="text-amber">$</span> nmap -sV {siteConfig.handle}
      </div>

      <div className="px-4 py-4 sm:px-6">
        <p className="scan-line text-dim" style={step(0)}>
          Rapport pour {siteConfig.handle} ({siteConfig.school}, {siteConfig.city})
        </p>
        <p className="scan-line text-dim" style={step(1)}>
          Hôte actif : {siteConfig.year}, cycle ingénieur informatique
        </p>

        <div
          aria-hidden="true"
          className="scan-line mt-4 grid grid-cols-[5.5rem_1fr] gap-x-4 text-dim sm:grid-cols-[6rem_4.5rem_9rem_1fr]"
          style={step(2)}
        >
          <span>PORT</span>
          <span className="hidden sm:block">ÉTAT</span>
          <span>SERVICE</span>
          <span className="hidden sm:block">DÉTAIL</span>
        </div>

        <ul>
          {rows.map((row, i) => (
            <li key={row.href} className="scan-line" style={step(i + 3)}>
              <Link
                href={row.href}
                className="group grid grid-cols-[5.5rem_1fr] gap-x-4 hover:bg-ink focus-visible:bg-ink sm:grid-cols-[6rem_4.5rem_9rem_1fr]"
              >
                <span aria-hidden="true">{row.port}</span>
                <span aria-hidden="true" className="hidden text-open sm:block">
                  open
                </span>
                <span className="text-amber underline-offset-4 group-hover:underline">
                  {row.service}
                </span>
                <span className="col-start-2 text-dim sm:col-start-4">{row.detail}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="scan-line mt-4 text-dim" style={step(rows.length + 3)}>
          {rows.length} services détectés.{" "}
          <span aria-hidden="true" className="scan-cursor text-amber">
            ▍
          </span>
        </p>
      </div>
    </nav>
  );
}
