import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-lg border border-hairline bg-paper px-3 text-sm text-ink transition-colors placeholder:text-muted-foreground/70 focus-visible:border-evergreen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/20 disabled:cursor-not-allowed disabled:opacity-50';

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-11', className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldBase, 'min-h-24 resize-y py-2.5 leading-relaxed', className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(fieldBase, 'h-11 cursor-pointer appearance-none pr-9', className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-ink-soft"
      >
        <path
          d="M2 4.5 6 8.5 10 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
