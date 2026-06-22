import { BrandMark } from './brand-mark';
import { SITE } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-hairline bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-6 w-6" />
          <span className="font-display text-lg font-semibold tracking-tight">
            {SITE.name}
          </span>
        </div>
        <p className="max-w-md text-sm text-muted-foreground text-pretty">
          {SITE.tagline} A calm, private place to gather your family’s names,
          dates and stories.
        </p>
      </div>
    </footer>
  );
}
