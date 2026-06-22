import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium leading-none',
  {
    variants: {
      tone: {
        neutral: 'border-ink/20 bg-sand text-ink-soft',
        ink: 'border-ink bg-ink text-bone',
        cobalt: 'border-cobalt/30 bg-cobalt/10 text-cobalt-deep',
        marigold: 'border-marigold/50 bg-marigold/20 text-ink',
        emerald: 'border-emerald/30 bg-emerald/10 text-emerald',
        vermilion: 'border-vermilion/30 bg-vermilion/10 text-vermilion',
        magenta: 'border-magenta/30 bg-magenta/10 text-magenta',
        outline: 'border-ink bg-transparent text-ink',
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
