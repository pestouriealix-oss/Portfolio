/**
 * Mise en page d'un schéma de circuit imprimé : des puces rangées par étages,
 * des connecteurs sur le bord du circuit, et des pistes à angles droits entre eux.
 *
 * Tout est calculé au build, dans un composant serveur : le navigateur ne reçoit
 * que des coordonnées et des chemins SVG, et le composant client ne fait que
 * réagir (survol, parcours). Le module est pur : mêmes données, même schéma,
 * donc pas d'écart d'hydratation.
 *
 * Routage, en trois passes :
 * 1. les broches : chaque piste reçoit un point d'attache sur le bord d'une
 *    puce, trié selon la position de l'autre extrémité pour limiter les croisements ;
 * 2. les canaux : une piste qui saute un étage descend entre les puces de cet
 *    étage, dans un intervalle libre, à distance des autres pistes ;
 * 3. les couloirs : entre deux étages, les tronçons horizontaux sont répartis
 *    sur des voies parallèles (coloration d'intervalles, gloutonne).
 * Les angles sont ensuite coupés à 45°, comme sur un vrai circuit.
 */

export type CircuitInputNode = {
  id: string;
  label: string;
  /** Ligne secondaire, en police à chasse fixe (un dossier, par exemple). */
  sublabel?: string;
  text: string;
  /** Détails affichés à la sélection : dossiers, domaines appelés… */
  details: string[];
};

export type CircuitInput = {
  /** Étages de puces, de haut en bas. */
  rows: { name: string; nodes: CircuitInputNode[] }[];
  /** Connecteurs, sur le bord bas du circuit : les services extérieurs. */
  connectors: { name: string; nodes: CircuitInputNode[] };
  /** Liaisons orientées (appelant → appelé), pondérées. */
  links: { from: string; to: string; weight: number }[];
  journeys: { id: string; name: string; steps: { node: string; text: string }[] }[];
};

type Point = { x: number; y: number };
type Side = "top" | "bottom";

export type CircuitNode = CircuitInputNode & {
  /** Repère de sérigraphie : U1, U2… pour les puces, J1, J2… pour les connecteurs. */
  ref: string;
  kind: "chip" | "connector";
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CircuitTrace = {
  id: string;
  /** Sens dominant de l'appel : la piste est tracée de `from` vers `to`. */
  from: string;
  to: string;
  weight: number;
  /** Des appels existent aussi dans l'autre sens. */
  both: boolean;
  d: string;
  length: number;
  start: Point;
  end: Point;
};

export type CircuitRoute = { d: string; length: number; traces: string[] };

export type CircuitJourney = {
  id: string;
  name: string;
  steps: { node: string; text: string; route: CircuitRoute | null }[];
};

export type CircuitBoardData = {
  width: number;
  height: number;
  rows: { name: string; y: number }[];
  nodes: CircuitNode[];
  traces: CircuitTrace[];
  journeys: CircuitJourney[];
};

/** Dimensions, en unités du viewBox SVG. */
const G = {
  labelWidth: 92,
  margin: 24,
  top: 30,
  pitch: 146,
  chip: { w: 210, h: 58, gap: 76 },
  connector: { h: 34, gap: 12, minW: 84, charW: 6.1, padX: 26 },
  pinPad: 18,
  /** Distance minimale entre deux pistes parallèles. */
  laneGap: 9,
  /** Garde entre les puces et la première voie d'un couloir. */
  laneMargin: 18,
  /** Écart entre une piste de canal et une puce. */
  channelClearance: 16,
  chamfer: 7,
  minWidth: 1080,
} as const;

export function layoutCircuit(input: CircuitInput): CircuitBoardData {
  const { nodes, width } = placeNodes(input);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rowCount = input.rows.length + 1;
  const connectorRow = input.rows.length;
  const height = G.top + connectorRow * G.pitch + G.connector.h + G.top;

  const pairs = mergeLinks(input.links, byId);
  const routed = routeTraces(pairs, nodes, byId, rowCount, width);

  const traces: CircuitTrace[] = routed.map((r) => {
    const { d, length, points } = chamfered(r.points);
    return {
      id: r.id,
      from: r.from,
      to: r.to,
      weight: r.weight,
      both: r.both,
      d,
      length,
      start: points[0]!,
      end: points.at(-1)!,
    };
  });

  return {
    width,
    height,
    rows: [
      ...input.rows.map((row, i) => ({ name: row.name, y: rowTop(i) + G.chip.h / 2 })),
      { name: input.connectors.name, y: rowTop(connectorRow) + G.connector.h / 2 },
    ],
    nodes,
    traces,
    journeys: input.journeys.map((journey) => ({
      id: journey.id,
      name: journey.name,
      steps: journey.steps.map((step, i) => ({
        ...step,
        route: i === 0 ? null : routeBetween(journey.steps[i - 1]!.node, step.node, routed, byId),
      })),
    })),
  };
}

const rowTop = (row: number) => G.top + row * G.pitch;

// ------------------------------------------------------------ Placement

function placeNodes(input: CircuitInput): { nodes: CircuitNode[]; width: number } {
  const chipRowWidth = (n: number) => n * G.chip.w + (n - 1) * G.chip.gap;
  const connectorWidth = (label: string) =>
    Math.max(G.connector.minW, Math.round(label.length * G.connector.charW + G.connector.padX));
  const connectorsWidth =
    input.connectors.nodes.reduce((sum, n) => sum + connectorWidth(n.label), 0) +
    (input.connectors.nodes.length - 1) * G.connector.gap;

  const contentWidth = Math.max(
    ...input.rows.map((r) => chipRowWidth(r.nodes.length)),
    connectorsWidth,
  );
  const width = Math.max(G.minWidth, G.labelWidth + 2 * G.margin + contentWidth);
  const areaLeft = G.labelWidth + G.margin;
  const areaWidth = width - G.margin - areaLeft;

  let chipCount = 0;
  const chips: CircuitNode[] = input.rows.flatMap((row, r) => {
    const left = areaLeft + (areaWidth - chipRowWidth(row.nodes.length)) / 2;
    return row.nodes.map((node, i) => ({
      ...node,
      ref: `U${++chipCount}`,
      kind: "chip" as const,
      row: r,
      x: left + i * (G.chip.w + G.chip.gap),
      y: rowTop(r),
      w: G.chip.w,
      h: G.chip.h,
    }));
  });

  // Chaque connecteur se place sous les puces qu'il relie (barycentre) : pistes plus courtes.
  const chipCenter = new Map(chips.map((c) => [c.id, c.x + c.w / 2]));
  const barycenter = (id: string) => {
    const xs = input.links.flatMap((l) => {
      const other = l.from === id ? l.to : l.to === id ? l.from : null;
      const x = other ? chipCenter.get(other) : undefined;
      return x === undefined ? [] : [x];
    });
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : areaLeft + areaWidth / 2;
  };
  const ordered = input.connectors.nodes
    .map((node, index) => ({ node, index, x: barycenter(node.id) }))
    .sort((a, b) => a.x - b.x || a.index - b.index);

  const connectorRow = input.rows.length;
  let x = areaLeft + (areaWidth - connectorsWidth) / 2;
  const connectors: CircuitNode[] = ordered.map(({ node }, i) => {
    const w = connectorWidth(node.label);
    const placed = {
      ...node,
      ref: `J${i + 1}`,
      kind: "connector" as const,
      row: connectorRow,
      x,
      y: rowTop(connectorRow),
      w,
      h: G.connector.h,
    };
    x += w + G.connector.gap;
    return placed;
  });

  return { nodes: [...chips, ...connectors], width };
}

// ------------------------------------------------------------ Liaisons

type Pair = { id: string; from: string; to: string; weight: number; both: boolean };

/** Les deux sens d'une liaison deviennent une seule piste, orientée dans le sens dominant. */
function mergeLinks(links: CircuitInput["links"], byId: Map<string, CircuitNode>): Pair[] {
  const pairs = new Map<string, { a: string; b: string; ab: number; ba: number }>();
  for (const link of links) {
    for (const id of [link.from, link.to]) {
      if (!byId.has(id)) throw new Error(`Schéma de circuit : bloc inconnu « ${id} »`);
    }
    if (link.from === link.to) continue;
    const [a, b] = [link.from, link.to].sort() as [string, string];
    const key = `${a}~${b}`;
    const pair = pairs.get(key) ?? { a, b, ab: 0, ba: 0 };
    if (link.from === a) pair.ab += link.weight;
    else pair.ba += link.weight;
    pairs.set(key, pair);
  }
  return [...pairs.entries()].map(([id, p]) => ({
    id,
    from: p.ab >= p.ba ? p.a : p.b,
    to: p.ab >= p.ba ? p.b : p.a,
    weight: p.ab + p.ba,
    both: p.ab > 0 && p.ba > 0,
  }));
}

// ------------------------------------------------------------ Routage

type Segment = { gap: number; x1: number; x2: number; y: number };
type Routed = Pair & {
  /** Puce du haut (ou de gauche, sur un même étage), et celle du bas. */
  upper: string;
  lower: string;
  points: Point[];
};

function routeTraces(
  pairs: Pair[],
  nodes: CircuitNode[],
  byId: Map<string, CircuitNode>,
  rowCount: number,
  width: number,
): Routed[] {
  const center = (n: CircuitNode) => n.x + n.w / 2;
  const lastRow = rowCount - 1;

  // Géométrie de chaque piste : extrémité haute u, basse v, et côté d'attache.
  const drafts = pairs.map((pair) => {
    let u = byId.get(pair.from)!;
    let v = byId.get(pair.to)!;
    if (v.row < u.row || (v.row === u.row && center(v) < center(u))) [u, v] = [v, u];
    const sameRow = u.row === v.row;
    // Sur un même étage, la piste passe par le couloir du dessous (du dessus pour les connecteurs).
    const sideU: Side = sameRow && u.row === lastRow ? "top" : "bottom";
    const sideV: Side = sameRow ? sideU : "top";
    return { pair, u, v, sideU, sideV, ux: 0, vx: 0 };
  });

  // 1. Broches : réparties sur le bord, triées selon l'autre extrémité.
  const sides = new Map<
    string,
    { draft: (typeof drafts)[number]; end: "u" | "v"; other: number }[]
  >();
  for (const draft of drafts) {
    for (const end of ["u", "v"] as const) {
      const node = end === "u" ? draft.u : draft.v;
      const other = end === "u" ? draft.v : draft.u;
      const key = `${node.id}:${end === "u" ? draft.sideU : draft.sideV}`;
      const list = sides.get(key) ?? [];
      list.push({ draft, end, other: center(other) });
      sides.set(key, list);
    }
  }
  for (const [key, list] of sides) {
    const node = byId.get(key.split(":")[0]!)!;
    list.sort((a, b) => a.other - b.other || a.draft.pair.id.localeCompare(b.draft.pair.id));
    const pad = Math.min(G.pinPad, node.w / 4);
    const span = node.w - 2 * pad;
    list.forEach((item, i) => {
      const x = round(node.x + pad + ((i + 0.5) * span) / list.length);
      if (item.end === "u") item.draft.ux = x;
      else item.draft.vx = x;
    });
  }

  // Deux broches face à face (bas d'un étage, haut du suivant) ne doivent pas se
  // superposer : on décale légèrement celle du dessous.
  for (const draft of drafts) {
    if (draft.sideV !== "top") continue;
    const facing = drafts.flatMap((other) =>
      other.sideU === "bottom" && other.u.row === draft.v.row - 1 ? [other.ux] : [],
    );
    const clash = facing.find((x) => Math.abs(x - draft.vx) < G.laneGap / 2);
    if (clash !== undefined) {
      const shift = draft.vx >= clash ? G.laneGap / 2 : -G.laneGap / 2;
      draft.vx = round(clamp(draft.vx + shift, draft.v.x + 6, draft.v.x + draft.v.w - 6));
    }
  }

  // 2. Canaux : intervalles libres de chaque étage, et verticales déjà prises dans
  // chaque couloir (broches et autres canaux), pour qu'aucune piste n'en recouvre une autre.
  const freeByRow = Array.from({ length: rowCount }, (_, row) =>
    freeIntervals(
      nodes.filter((n) => n.row === row),
      G.labelWidth + G.margin / 2,
      width - G.margin / 2,
    ),
  );
  const verticalsByGap = Array.from({ length: rowCount - 1 }, () => [] as number[]);
  for (const draft of drafts) {
    if (draft.sideU === "bottom") verticalsByGap[draft.u.row]?.push(draft.ux);
    else verticalsByGap[draft.u.row - 1]?.push(draft.ux);
    if (draft.sideV === "top") verticalsByGap[draft.v.row - 1]?.push(draft.vx);
    else verticalsByGap[draft.v.row]?.push(draft.vx);
  }

  const channelFor = (fromRow: number, toRow: number, ideal: number) => {
    const rows = range(fromRow + 1, toRow);
    const gaps = range(fromRow, toRow);
    const fits = (x: number) =>
      rows.every((r) => freeByRow[r]!.some(([a, b]) => x >= a && x <= b)) &&
      gaps.every((g) => verticalsByGap[g]!.every((used) => Math.abs(used - x) >= G.laneGap));
    for (let offset = 0; offset < width; offset += 3) {
      for (const x of [ideal + offset, ideal - offset]) {
        if (fits(x)) {
          const channel = round(x);
          gaps.forEach((g) => verticalsByGap[g]!.push(channel));
          return channel;
        }
      }
    }
    throw new Error("Schéma de circuit : aucun canal libre");
  };

  const segments: Segment[] = [];
  const segment = (gap: number, x1: number, x2: number) => {
    const s = { gap, x1, x2, y: 0 };
    segments.push(s);
    return s;
  };

  const plans = drafts.map((draft) => {
    const { u, v, ux, vx } = draft;
    if (u.row === v.row) {
      const gap = draft.sideU === "bottom" ? u.row : u.row - 1;
      return { draft, kind: "same" as const, lane: segment(gap, ux, vx) };
    }
    if (v.row === u.row + 1) {
      return { draft, kind: "adjacent" as const, lane: segment(u.row, ux, vx) };
    }
    const channel = channelFor(u.row, v.row, (ux + vx) / 2);
    return {
      draft,
      kind: "skip" as const,
      channel,
      first: segment(u.row, ux, channel),
      second: segment(v.row - 1, channel, vx),
    };
  });

  // 3. Couloirs : voies parallèles, centrées dans l'espace entre deux étages.
  for (let gap = 0; gap < rowCount - 1; gap++) {
    assignLanes(
      segments.filter((s) => s.gap === gap),
      rowTop(gap) + G.chip.h,
      rowTop(gap + 1),
    );
  }

  return plans.map((plan) => {
    const { u, v, ux, vx, pair } = plan.draft;
    const edge = (n: CircuitNode, side: Side) => (side === "top" ? n.y : n.y + n.h);
    const start = { x: ux, y: edge(u, plan.draft.sideU) };
    const end = { x: vx, y: edge(v, plan.draft.sideV) };
    const points: Point[] =
      plan.kind === "skip"
        ? [
            start,
            { x: ux, y: plan.first.y },
            { x: plan.channel, y: plan.first.y },
            { x: plan.channel, y: plan.second.y },
            { x: vx, y: plan.second.y },
            end,
          ]
        : [start, { x: ux, y: plan.lane.y }, { x: vx, y: plan.lane.y }, end];

    // Tracée dans le sens de l'appel, pour que l'impulsion aille de l'appelant à l'appelé.
    const forward = pair.from === u.id;
    return {
      ...pair,
      upper: u.id,
      lower: v.id,
      points: forward ? points : [...points].reverse(),
    };
  });
}

/** Intervalles horizontaux libres d'un étage, entre ses puces (garde comprise). */
function freeIntervals(rowNodes: CircuitNode[], left: number, right: number): [number, number][] {
  const blocked = rowNodes
    .map((n) => [n.x - G.channelClearance, n.x + n.w + G.channelClearance] as const)
    .sort((a, b) => a[0] - b[0]);
  const free: [number, number][] = [];
  let cursor = left;
  for (const [a, b] of blocked) {
    if (a > cursor) free.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (cursor < right) free.push([cursor, right]);
  return free;
}

/**
 * Coloration d'intervalles : deux tronçons qui ne se chevauchent pas partagent
 * une voie. Les voies sont ensuite réparties dans la hauteur du couloir.
 */
function assignLanes(segments: Segment[], top: number, bottom: number) {
  const sorted = [...segments].sort(
    (a, b) =>
      Math.min(a.x1, a.x2) - Math.min(b.x1, b.x2) || Math.max(a.x1, a.x2) - Math.max(b.x1, b.x2),
  );
  const laneEnds: number[] = [];
  const laneOf = new Map<Segment, number>();
  for (const s of sorted) {
    const [a, b] = [Math.min(s.x1, s.x2), Math.max(s.x1, s.x2)];
    let lane = laneEnds.findIndex((end) => end + G.laneGap <= a);
    if (lane === -1) lane = laneEnds.push(b) - 1;
    else laneEnds[lane] = b;
    laneOf.set(s, lane);
  }
  const count = laneEnds.length;
  const room = bottom - top - 2 * G.laneMargin;
  const spacing = count > 1 ? Math.min(G.laneGap + 2, room / (count - 1)) : 0;
  const middle = (top + bottom) / 2;
  for (const [s, lane] of laneOf) s.y = round(middle + (lane - (count - 1) / 2) * spacing);
}

// ------------------------------------------------------------ Parcours

/**
 * Chemin d'une étape à la suivante, par le plus petit nombre de pistes (parcours
 * en largeur). Entre deux pistes, l'impulsion traverse la puce par son centre.
 */
function routeBetween(
  fromId: string,
  toId: string,
  traces: Routed[],
  byId: Map<string, CircuitNode>,
): CircuitRoute | null {
  if (fromId === toId || !byId.has(fromId) || !byId.has(toId)) return null;

  const adjacency = new Map<string, { next: string; trace: Routed }[]>();
  for (const trace of traces) {
    for (const [a, b] of [
      [trace.from, trace.to],
      [trace.to, trace.from],
    ] as const) {
      const list = adjacency.get(a) ?? [];
      list.push({ next: b, trace });
      adjacency.set(a, list);
    }
  }
  for (const list of adjacency.values()) list.sort((x, y) => x.next.localeCompare(y.next));

  const previous = new Map<string, { node: string; trace: Routed }>();
  const queue = [fromId];
  const seen = new Set(queue);
  while (queue.length > 0 && !seen.has(toId)) {
    const node = queue.shift()!;
    for (const { next, trace } of adjacency.get(node) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      previous.set(next, { node, trace });
      queue.push(next);
    }
  }
  if (!seen.has(toId)) return null;

  const hops: { from: string; trace: Routed }[] = [];
  for (let node = toId; node !== fromId;) {
    const step = previous.get(node)!;
    hops.unshift({ from: step.node, trace: step.trace });
    node = step.node;
  }

  const points: Point[] = [];
  for (const { from, trace } of hops) {
    // Les points d'une piste vont de `from` à `to` : on les retourne si on la remonte.
    const pts = trace.from === from ? trace.points : [...trace.points].reverse();
    const last = points.at(-1);
    const first = pts[0]!;
    if (last) {
      const node = byId.get(from)!;
      const middle = node.y + node.h / 2;
      points.push({ x: last.x, y: middle }, { x: first.x, y: middle });
    }
    points.push(...pts);
  }
  const { d, length } = chamfered(points);
  return { d, length, traces: hops.map((h) => h.trace.id) };
}

// ------------------------------------------------------------ Géométrie

/** Chemin SVG d'une ligne brisée, angles coupés à 45°, et sa longueur exacte. */
function chamfered(input: Point[]): { d: string; length: number; points: Point[] } {
  const pts = simplify(input);
  const out: Point[] = [pts[0]!];
  for (let i = 1; i < pts.length - 1; i++) {
    const [prev, cur, next] = [pts[i - 1]!, pts[i]!, pts[i + 1]!];
    const cut = Math.min(G.chamfer, distance(prev, cur) / 2, distance(cur, next) / 2);
    out.push(towards(cur, prev, cut), towards(cur, next, cut));
  }
  if (pts.length > 1) out.push(pts.at(-1)!);

  const d = out.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`).join("");
  const length = out.slice(1).reduce((sum, p, i) => sum + distance(out[i]!, p), 0);
  return { d, length: round(length), points: out };
}

/** Retire les points répétés et ceux alignés avec leurs voisins. */
function simplify(points: Point[]): Point[] {
  const unique = points.filter(
    (p, i) => i === 0 || p.x !== points[i - 1]!.x || p.y !== points[i - 1]!.y,
  );
  return unique.filter((p, i) => {
    const prev = unique[i - 1];
    const next = unique[i + 1];
    if (!prev || !next) return true;
    return !((prev.x === p.x && p.x === next.x) || (prev.y === p.y && p.y === next.y));
  });
}

const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

function towards(from: Point, to: Point, length: number): Point {
  const d = distance(from, to);
  return d === 0
    ? from
    : { x: from.x + ((to.x - from.x) * length) / d, y: from.y + ((to.y - from.y) * length) / d };
}

const round = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);
