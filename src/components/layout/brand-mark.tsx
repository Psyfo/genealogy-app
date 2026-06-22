import { cn } from '@/lib/utils';

/** A small family-tree glyph: one node branching into two. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      role="presentation"
    >
      <g fill="none" stroke="#2f5d50" strokeWidth="2" strokeLinecap="round">
        <path d="M16 12 V17" />
        <path d="M16 17 L8.5 21.4" />
        <path d="M16 17 L23.5 21.4" />
      </g>
      <circle cx="16" cy="8" r="4" fill="#2f5d50" />
      <circle cx="8" cy="24" r="3.2" fill="#c88a3a" />
      <circle cx="24" cy="24" r="3.2" fill="#bf6242" />
    </svg>
  );
}
