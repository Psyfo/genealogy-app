import { cn } from '@/lib/utils';

type PageHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  className,
  children,
}: PageHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-evergreen">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
