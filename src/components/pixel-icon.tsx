/**
 * Petites icônes en pixel art, dessinées à partir d'une grille de caractères :
 * `#` est un pixel plein, tout autre caractère est vide. Chaque page a la sienne,
 * en clin d'œil à un classique du jeu vidéo.
 */
const icons = {
  invader: {
    label: "Space Invaders",
    className: "text-open",
    grid: [
      "..#.....#..",
      "...#...#...",
      "..#######..",
      ".##.###.##.",
      "###########",
      "#.#######.#",
      "#.#.....#.#",
      "...##.##...",
    ],
  },
  tetris: {
    label: "Tetris",
    className: "text-amber",
    grid: ["..###...", "...#....", "........", "#....##.", "###.###.", "###.####"],
  },
  heart: {
    label: "Cœur de vie",
    className: "text-alert",
    grid: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  },
  coin: {
    label: "Pièce d'expérience",
    className: "text-amber",
    grid: [
      "..####..",
      ".#....#.",
      "#..##..#",
      "#..#...#",
      "#..#...#",
      "#..##..#",
      ".#....#.",
      "..####..",
    ],
  },
  snake: {
    label: "Snake",
    className: "text-open",
    grid: ["#####..", "....#..", "###.#.#", "#...#..", "#####.."],
  },
  ghost: {
    label: "Fantôme de Pac-Man",
    className: "text-alert",
    grid: [".#####.", "#######", "#.##.##", "#######", "#######", "#######", "#.#.#.#"],
  },
} as const;

export type PixelIconName = keyof typeof icons;

export function PixelIcon({ name }: { name: PixelIconName }) {
  const { grid, label, className } = icons[name];
  const width = grid[0].length;

  return (
    // Décoratif : le nom du jeu n'apparaît qu'au survol.
    <span aria-hidden="true" title={label} className={`inline-block ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${grid.length}`}
        className="h-4 w-auto fill-current"
        shapeRendering="crispEdges"
      >
        {grid.flatMap((row, y) =>
          [...row].map((cell, x) =>
            cell === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null,
          ),
        )}
      </svg>
    </span>
  );
}
