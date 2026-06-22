import Link from 'next/link';

import { BrandMark } from './brand-mark';
import { MainNav } from './main-nav';
import { NdebeleBand } from './ndebele-band';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <NdebeleBand height={10} />
      <div className="border-b-2 border-ink bg-bone/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="Mahlangu — home"
          >
            <BrandMark className="h-7 w-7 transition-transform duration-300 ease-out group-hover:rotate-45" />
            <span className="font-display text-xl font-extrabold uppercase tracking-tight">
              Mahlangu
            </span>
          </Link>
          <MainNav />
        </div>
      </div>
    </header>
  );
}
