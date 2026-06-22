'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/people', label: 'People' },
  { href: '/tree', label: 'Family Tree' },
  { href: '/about', label: 'About' },
] as const;

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative px-2 py-1 text-sm font-medium tracking-tight transition-colors sm:px-3',
              active
                ? 'text-ink'
                : 'text-muted-foreground hover:text-ink',
            )}
          >
            {link.label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 bg-cobalt sm:inset-x-3" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
