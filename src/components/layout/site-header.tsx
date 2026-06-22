import Link from 'next/link';

import { BrandMark } from './brand-mark';
import { MainNav } from './main-nav';
import { getCurrentUser } from '@/lib/auth/current-user';
import { SITE } from '@/lib/site';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-ivory/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
          <BrandMark className="h-7 w-7 transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="font-display text-xl font-semibold tracking-tight">
            {SITE.name}
          </span>
        </Link>
        <MainNav user={user ? { name: user.name } : null} />
      </div>
    </header>
  );
}
