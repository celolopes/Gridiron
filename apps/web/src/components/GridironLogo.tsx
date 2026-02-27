/**
 * GridironLogo — SVG component fiel ao logo oficial.
 * Design: ícone circular de rede/futebol à esquerda + wordmark "Gridiron" + subtítulo opcional.
 *
 * Tratamento de tema:
 *  - variant="dark"  → wordmark branco, ícone branco/transparente (para fundos escuros)
 *  - variant="light" → wordmark navy (#1a2f52), ícone navy          (para fundos claros)
 *  - variant="auto"  → dark por padrão, inverte com .light-theme class no body (via CSS)
 */

interface GridironLogoProps {
  variant?: "dark" | "light" | "auto";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: { iconSize: 28, textSize: 18, tagSize: 9, gap: 8 },
  md: { iconSize: 36, textSize: 24, tagSize: 11, gap: 10 },
  lg: { iconSize: 48, textSize: 32, tagSize: 13, gap: 12 },
  xl: { iconSize: 64, textSize: 42, tagSize: 16, gap: 16 },
};

export function GridironLogo({ variant = "dark", showTagline = false, size = "md", className = "" }: GridironLogoProps) {
  const { iconSize, textSize, tagSize, gap } = SIZES[size];

  const navy = "#1a2f52";
  const white = "#ffffff";
  const iconColor = variant === "light" ? navy : white;
  const textColor = variant === "light" ? navy : white;
  const tagColor = variant === "light" ? "#4a6fa5" : "rgba(255,255,255,0.55)";

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ gap }}>
      {/* ── Icon ── football-network / grid circular emblem */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Outer ring */}
        <circle cx="32" cy="32" r="30" stroke={iconColor} strokeWidth="2.5" opacity="0.35" />
        {/* Inner ring */}
        <circle cx="32" cy="32" r="20" stroke={iconColor} strokeWidth="2" opacity="0.55" />

        {/* Football laces / grid lines */}
        <line x1="32" y1="2" x2="32" y2="62" stroke={iconColor} strokeWidth="1.5" opacity="0.25" />
        <line x1="2" y1="32" x2="62" y2="32" stroke={iconColor} strokeWidth="1.5" opacity="0.25" />

        {/* Diagonal network lines (corner to edge) */}
        <line x1="10" y1="10" x2="54" y2="54" stroke={iconColor} strokeWidth="1" opacity="0.18" />
        <line x1="54" y1="10" x2="10" y2="54" stroke={iconColor} strokeWidth="1" opacity="0.18" />

        {/* Node dots */}
        <circle cx="32" cy="32" r="4.5" fill={iconColor} />
        <circle cx="32" cy="12" r="2.5" fill={iconColor} opacity="0.7" />
        <circle cx="32" cy="52" r="2.5" fill={iconColor} opacity="0.7" />
        <circle cx="12" cy="32" r="2.5" fill={iconColor} opacity="0.7" />
        <circle cx="52" cy="32" r="2.5" fill={iconColor} opacity="0.7" />

        <circle cx="17" cy="17" r="2" fill={iconColor} opacity="0.5" />
        <circle cx="47" cy="17" r="2" fill={iconColor} opacity="0.5" />
        <circle cx="17" cy="47" r="2" fill={iconColor} opacity="0.5" />
        <circle cx="47" cy="47" r="2" fill={iconColor} opacity="0.5" />

        {/* Network spokes from center node */}
        <line x1="32" y1="32" x2="32" y2="12" stroke={iconColor} strokeWidth="1.5" opacity="0.6" />
        <line x1="32" y1="32" x2="32" y2="52" stroke={iconColor} strokeWidth="1.5" opacity="0.6" />
        <line x1="32" y1="32" x2="12" y2="32" stroke={iconColor} strokeWidth="1.5" opacity="0.6" />
        <line x1="32" y1="32" x2="52" y2="32" stroke={iconColor} strokeWidth="1.5" opacity="0.6" />

        <line x1="32" y1="32" x2="17" y2="17" stroke={iconColor} strokeWidth="1.5" opacity="0.45" />
        <line x1="32" y1="32" x2="47" y2="17" stroke={iconColor} strokeWidth="1.5" opacity="0.45" />
        <line x1="32" y1="32" x2="17" y2="47" stroke={iconColor} strokeWidth="1.5" opacity="0.45" />
        <line x1="32" y1="32" x2="47" y2="47" stroke={iconColor} strokeWidth="1.5" opacity="0.45" />
      </svg>

      {/* ── Wordmark ── */}
      <div className="flex flex-col leading-none">
        <span
          style={{
            fontSize: textSize,
            fontWeight: 800,
            color: textColor,
            letterSpacing: "-0.02em",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            lineHeight: 1,
          }}
        >
          Gridiron
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: tagSize,
              color: tagColor,
              marginTop: 3,
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Gerenciador de Lojas Virtuais
          </span>
        )}
      </div>
    </div>
  );
}
