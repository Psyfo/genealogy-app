import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none',
  {
    variants: {
      tone: {
        neutral: 'border-hairline bg-parchment text-ink-soft',
        ink: 'border-ink bg-ink text-ivory',
        evergreen: 'border-evergreen/25 bg-evergreen/10 text-evergreen-deep',
        amber: 'border-amber/40 bg-amber/15 text-clay',
        sage: 'border-sage/30 bg-sage/15 text-evergreen-deep',
        terracotta: 'border-terracotta/30 bg-terracotta/10 text-clay',
        outline: 'border-hairline bg-transparent text-ink-soft',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
