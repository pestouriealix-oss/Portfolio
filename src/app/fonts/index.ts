import localFont from "next/font/local";

/**
 * Polices de l'univers Gufo, reprises du projet lui-même (licence SIL OFL, voir
 * les fichiers OFL-*.txt de ce dossier). Elles ne sont chargées que sur la fiche
 * de Gufo : `next/font` ne précharge une police que sur les pages qui l'utilisent.
 *
 * Auto-hébergées comme le reste : la CSP `font-src 'self'` reste valable.
 * Seul le sous-ensemble latin (qui couvre le français) est embarqué.
 */
export const gufoDisplay = localFont({
  src: "./sofia-sans-extra-condensed-latin.woff2",
  weight: "1 1000",
  display: "swap",
  variable: "--font-gufo-display-face",
});

export const gufoText = localFont({
  src: "./atkinson-hyperlegible-next-latin.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-gufo-text-face",
});
