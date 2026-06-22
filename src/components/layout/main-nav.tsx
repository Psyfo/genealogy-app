'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavUser = { name: string } | null;

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative px-2 py-1 text-sm transition-colors sm:px-3',
        active ? 'text-ink' : 'text-muted-foreground hover:text-ink',
      )}
    >
      {label}
      {active && (
        <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-evergreen sm:inset-x-3" />
      )}
    </Link>
  );
}

export function MainNav({ user }: { user: NavUser }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout(): Promise<void> {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {user ? (
        <>
          <NavLink href="/people" label="People" />
          <NavLink href="/tree" label="Family tree" />
          <button
            type="button"
            onClick={() => void logout()}
            disabled={loggingOut}
            className="ml-1 px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-ink disabled:opacity-50 sm:px-3"
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </>
      ) : (
        <>
          <NavLink href="/about" label="About" />
          <Link
            href="/login"
            className="px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-ink sm:px-3"
          >
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            Sign up
          </Link>
        </>
      )}
    </nav>
  );
}
