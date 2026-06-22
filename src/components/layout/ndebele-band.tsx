/**
 * The signature motif: a seamless triangular frieze in the Ndebele tradition —
 * saturated peaks on a bone ground, each outlined with the heavy black keyline.
 * Rendered as a tiling SVG <pattern> (no viewBox) so it repeats crisply across
 * any width. Purely decorative.
 */
const PALETTE = ['#1f44c2', '#f3b324', '#df3b2c', '#1b8f5d', '#c3338a'] as const;
const INK = '#15110d';
const BONE = '#f5efe2';

type NdebeleBandProps = {
  height?: number;
  /** Shift the colour cycle so stacked bands don't line up. */
  offset?: number;
  className?: string;
};

export function NdebeleBand({
  height = 14,
  offset = 0,
  className,
}: NdebeleBandProps) {
  const base = height; // triangle base ≈ height → near-equilateral peaks
  const colors = [...PALETTE.slice(offset % PALETTE.length), ...PALETTE.slice(0, offset % PALETTE.length)];
  const tile = base * colors.length;
  const patternId = `ndebele-${height}-${offset}`;

  return (
    <svg
      aria-hidden="true"
      width="100%"
      height={height}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <pattern
          id={patternId}
          width={tile}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <rect width={tile} height={height} fill={BONE} />
          {colors.map((color, i) => (
            <polygon
              key={i}
              points={`${i * base},${height} ${i * base + base / 2},0 ${i * base + base},${height}`}
              fill={color}
              stroke={INK}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      <line x1="0" y1={height - 0.75} x2="100%" y2={height - 0.75} stroke={INK} strokeWidth={1.5} />
    </svg>
  );
}
