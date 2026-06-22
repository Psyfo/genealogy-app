import { cn } from '@/lib/utils';

/** A small Ndebele rosette: a keyline diamond quartered into four colours. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      role="presentation"
    >
      <g stroke="#15110d" strokeWidth={1.75} strokeLinejoin="round">
        <polygon points="16,2 30,16 16,16" fill="#1f44c2" />
        <polygon points="30,16 16,30 16,16" fill="#f3b324" />
        <polygon points="16,30 2,16 16,16" fill="#df3b2c" />
        <polygon points="2,16 16,2 16,16" fill="#1b8f5d" />
      </g>
    </svg>
  );
}
