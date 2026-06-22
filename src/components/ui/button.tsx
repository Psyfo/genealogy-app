import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Shared "pressable block" motion for the solid, keyline variants.
const press =
  'shadow-block-sm transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-block active:translate-x-0 active:translate-y-0 active:shadow-block-sm';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: cn('keyline bg-cobalt text-primary-foreground hover:bg-cobalt-deep', press),
        accent: cn('keyline bg-marigold text-ink hover:brightness-105', press),
        secondary: cn('keyline bg-paper text-ink hover:bg-sand', press),
        danger: cn('keyline bg-vermilion text-primary-foreground hover:brightness-105', press),
        ghost: 'text-ink hover:bg-sand',
        link: 'text-cobalt underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
