import { cn } from '@/lib/utils';

// Keyline tiles, each a saturated ground with a legible foreground.
const TILES = [
  'bg-cobalt text-primary-foreground',
  'bg-vermilion text-primary-foreground',
  'bg-emerald text-primary-foreground',
  'bg-magenta text-primary-foreground',
  'bg-marigold text-ink',
  'bg-sky text-ink',
] as const;

function tileFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return TILES[Math.abs(hash) % TILES.length];
}

type AvatarProps = {
  initials: string;
  seed: string;
  className?: string;
};

export function Avatar({ initials, seed, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-center justify-center rounded-sm border-2 border-ink font-display font-bold uppercase leading-none',
        tileFor(seed),
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
