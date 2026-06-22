import { cn } from '@/lib/utils';

// Soft tiles, each a warm ground with a legible foreground.
const TILES = [
  'bg-evergreen text-primary-foreground',
  'bg-amber text-ink',
  'bg-terracotta text-primary-foreground',
  'bg-sage text-primary-foreground',
  'bg-clay text-primary-foreground',
  'bg-evergreen-deep text-primary-foreground',
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
        'inline-flex select-none items-center justify-center rounded-full font-display font-semibold uppercase leading-none ring-1 ring-black/5',
        tileFor(seed),
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
