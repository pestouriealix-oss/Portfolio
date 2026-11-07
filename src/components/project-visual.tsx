import type { ProjectTheme } from "@/content/project-themes";

/**
 * Image animée de chaque projet, en pur CSS et SVG : aucune ressource externe,
 * aucun JavaScript. Elle imite le sujet du projet (le regard du hibou de Gufo,
 * le radar de la bataille navale, l'avant/après d'une refonte, l'empreinte d'un
 * fichier qui change). Purement décorative : masquée aux lecteurs d'écran, et
 * immobile si l'utilisateur a demandé à réduire les animations.
 */
type Variant = "card" | "hero";

export function ProjectVisual({ theme, variant }: { theme: ProjectTheme; variant: Variant }) {
  switch (theme.visual) {
    case "gufo":
      return <GufoEye theme={theme} variant={variant} />;
    case "radar":
      return <Radar theme={theme} variant={variant} />;
    case "before-after":
      return <BeforeAfter theme={theme} variant={variant} />;
    case "hash":
      return <HashCheck theme={theme} variant={variant} />;
  }
}

/** Le G de Gufo, dessiné par Alix-Pierre pour le projet : son creux devient l'œil d'un hibou. */
function GufoMark({ className, pupil }: { className: string; pupil: string }) {
  return (
    <svg viewBox="3 3 18 18" className={className}>
      <path
        d="M19.6 7.6 A8.6 8.6 0 1 0 20.6 12.9 L20.6 11 H13.2 V13.8 H17.4 A5.7 5.7 0 1 1 16.9 8.9 Z"
        fill="currentColor"
      />
      <circle className="pupil" cx="11.3" cy="12.4" r="2.3" fill={pupil} />
    </svg>
  );
}

function GufoEye({ theme, variant }: { theme: ProjectTheme; variant: Variant }) {
  if (variant === "card") {
    return (
      <div
        aria-hidden="true"
        className="flex h-full items-center justify-center"
        style={{
          background: `radial-gradient(circle at 50% 120%, ${theme.accent}8c, transparent 62%), ${theme.bg}`,
          color: theme.text,
        }}
      >
        <GufoMark className="h-28 w-auto" pupil={theme.accent} />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="iris relative flex aspect-square w-full max-w-[440px] items-center justify-center rounded-full"
      style={{
        background: `radial-gradient(circle at 50% 55%, #3a2018 0%, ${theme.surface} 58%, ${theme.bg} 100%)`,
        border: `1px solid ${theme.accent}40`,
        boxShadow: `0 0 120px -20px ${theme.accent}59, inset 0 0 80px rgb(0 0 0 / 0.5)`,
        color: theme.text,
      }}
    >
      <div className="absolute inset-[14%] rounded-full border border-dashed border-white/10" />
      <div className="absolute inset-[28%] rounded-full border border-white/5" />
      <GufoMark className="relative w-[46%]" pupil={theme.accent} />
    </div>
  );
}

function Radar({ theme, variant }: { theme: ProjectTheme; variant: Variant }) {
  const size = variant === "card" ? "w-40" : "w-full max-w-[400px]";
  const cells = variant === "card" ? "16px 16px" : "10% 10%";
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${theme.accent}38, transparent 65%), ${variant === "card" ? theme.bg : "transparent"}`,
      }}
    >
      <div
        className={`relative aspect-square overflow-hidden rounded-full ${size}`}
        style={{
          border: `1px solid ${theme.accent}66`,
          backgroundImage: `linear-gradient(${theme.accent}29 1px, transparent 1px), linear-gradient(90deg, ${theme.accent}29 1px, transparent 1px)`,
          backgroundSize: cells,
        }}
      >
        <div
          className="sweep absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 290deg, ${theme.accent}8c 360deg)`,
          }}
        />
        {/* Un navire touché (rouge, qui pulse) et deux tirs dans l'eau. */}
        <span className="ping absolute top-[26%] left-[34%] size-[6%] rounded-full bg-[#ff6b7a]" />
        <span className="absolute top-[26%] left-[34%] size-[6%] rounded-full bg-[#ff6b7a]" />
        <span
          className="absolute top-[57%] left-[65%] size-[6%] rounded-full"
          style={{ background: theme.accent }}
        />
        <span
          className="absolute top-[67%] left-[25%] size-[6%] rounded-full"
          style={{ background: theme.accent }}
        />
      </div>
    </div>
  );
}

function BeforeAfter({ theme, variant }: { theme: ProjectTheme; variant: Variant }) {
  const frame =
    variant === "card"
      ? "absolute inset-x-10 inset-y-7"
      : "relative aspect-[4/3] w-full max-w-[460px]";
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center"
      style={{ background: variant === "card" ? theme.bg : "transparent" }}
    >
      <div
        className={`${frame} overflow-hidden rounded-2xl border border-white/10`}
        style={{ background: "#2a2620" }}
      >
        {/* Avant : un menu en couleurs vives sur trois lignes, un titre jaune. */}
        <div className="absolute top-[12%] right-[8%] left-[8%] flex flex-wrap gap-1.5">
          {["#d9c45a", "#b5584a", "#6e8f3d", "#b98a3e", "#6a6a9e", "#c0627c"].map((c) => (
            <span key={c} className="h-2 w-[16%] rounded-sm" style={{ background: c }} />
          ))}
        </div>
        <div className="absolute top-[38%] left-[8%] h-3.5 w-3/5 rounded-sm bg-[#e3cf3a]" />
        <div className="absolute top-[52%] left-[8%] h-2 w-2/5 rounded-sm bg-white/25" />

        {/* Après : le volet balaye la maquette, bleu rivière, pierre claire, ocre. */}
        <div
          className="wipe absolute inset-y-0 left-0 w-1/2 overflow-hidden"
          style={{ borderRight: `2px solid ${theme.accent}` }}
        >
          <div
            className="absolute inset-y-0 left-0 w-[1000px]"
            style={{ background: "linear-gradient(180deg, #0e282c8c, #0e282cd9), #1f4a4f" }}
          >
            <div className="absolute top-[12%] left-4 flex gap-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-8 rounded-sm bg-[#f0ece0b3]" />
              ))}
            </div>
            <div className="absolute top-[30%] left-4 h-4 w-64 rounded-sm bg-[#f0ece0]" />
            <div className="absolute top-[44%] left-4 h-4 w-48 rounded-sm bg-[#f0ece0]" />
            <div className="absolute top-[64%] left-4 h-6 w-24 rounded-full bg-[#d9a441]" />
          </div>
        </div>
      </div>
      {variant === "card" ? (
        <>
          <span
            className="absolute bottom-1.5 left-10 font-mono text-[11px]"
            style={{ color: theme.accent }}
          >
            après
          </span>
          <span className="absolute right-10 bottom-1.5 font-mono text-[11px] text-dim">avant</span>
        </>
      ) : null}
    </div>
  );
}

function HashCheck({ theme, variant }: { theme: ProjectTheme; variant: Variant }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-full w-full flex-col justify-center gap-2.5 font-mono ${
        variant === "card" ? "px-9 text-[13px]" : "max-w-[440px] text-sm"
      }`}
      style={{
        background:
          variant === "card"
            ? `radial-gradient(circle at 50% 100%, ${theme.accent}33, transparent 65%), ${theme.bg}`
            : "transparent",
      }}
    >
      <div style={{ color: theme.dim }}>$ fim verify /etc/ssh</div>
      <div style={{ color: theme.text }}>sshd_config</div>
      <div className="relative h-5">
        <div className="flip-a absolute inset-0 text-open">sha256 9f2c…41ab · intact</div>
        <div className="flip-b absolute inset-0 opacity-0" style={{ color: theme.accent }}>
          sha256 e07d…b3c9 · MODIFIÉ
        </div>
      </div>
      <div style={{ color: theme.dim }}>
        authorized_keys · <span className="text-open">intact</span>
      </div>
    </div>
  );
}
