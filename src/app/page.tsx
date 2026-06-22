import Link from 'next/link';
import { ArrowRight, GitFork, Lock, Sprout } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

function TreeIllustration() {
  // A calm little family graph: nodes joined by branches.
  const ever = '#2f5d50';
  const amber = '#c88a3a';
  const terra = '#bf6242';
  const sage = '#7d9384';
  return (
    <svg viewBox="0 0 320 280" className="h-full w-full" aria-hidden="true">
      <g stroke="#cdbfa6" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M160 56 V96" />
        <path d="M160 96 H96 V128 M160 96 H224 V128" />
        <path d="M96 152 V184 H64 V212 M96 184 H128 V212" />
        <path d="M224 152 V212" />
      </g>
      <circle cx="160" cy="44" r="16" fill={ever} />
      <circle cx="196" cy="44" r="11" fill={amber} />
      <line x1="176" y1="44" x2="185" y2="44" stroke="#cdbfa6" strokeWidth="2" />
      <circle cx="96" cy="140" r="12" fill={amber} />
      <circle cx="224" cy="140" r="12" fill={terra} />
      <circle cx="64" cy="224" r="9" fill={sage} />
      <circle cx="128" cy="224" r="9" fill={ever} />
      <circle cx="224" cy="224" r="9" fill={amber} />
    </svg>
  );
}

const PILLARS = [
  {
    icon: <GitFork className="size-6" />,
    title: 'Built as a graph',
    body: 'People are connected by birth and marriage. Siblings, ancestors and descendants are discovered by following the links — never typed twice.',
  },
  {
    icon: <Lock className="size-6" />,
    title: 'Private by default',
    body: 'Each account keeps its own tree. Your family’s names and stories are yours, visible only to you.',
  },
  {
    icon: <Sprout className="size-6" />,
    title: 'Grows with you',
    body: 'Add a person, draw a connection, and the tree redraws itself. Start with one name and let it branch out.',
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-24">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-evergreen">
            {SITE.tagline}
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl">
            Every family has a story. Keep it in one place.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            {SITE.name} is a calm home for your family history — every person,
            every connection, every story, held together in one living tree you
            can explore and grow over time.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {user ? (
              <Link href="/people" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Open your tree
                <ArrowRight />
              </Link>
            ) : (
              <>
                <Link href="/signup" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  Start your tree
                  <ArrowRight />
                </Link>
                <Link href="/login" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-lg border border-hairline bg-paper p-8 shadow-soft-lg">
          <div className="aspect-square">
            <TreeIllustration />
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex flex-col gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-evergreen/10 text-evergreen">
                {pillar.icon}
              </span>
              <h2 className="font-display text-xl font-semibold tracking-tight">{pillar.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
