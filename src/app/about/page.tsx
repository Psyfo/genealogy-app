import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeading } from '@/components/layout/page-heading';
import { buttonVariants } from '@/components/ui/button';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE.name} and how it works.`,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-ink-soft text-pretty">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeading
        eyebrow="About"
        title={`Family history, kept simply`}
        description={`${SITE.name} is a calm, private place to gather your family — names, dates, relationships and stories — and see how everyone connects.`}
      />

      <div className="mt-12 flex flex-col gap-12">
        <Section title="A family is a graph">
          <p>
            Family history is really a network: people connected by birth and
            marriage across generations. {SITE.name} stores it that way. Every
            person is a node and every relationship is a link, so questions like
            “who are her siblings?” or “show me four generations” are answered by
            following the connections — not by copying data into rows and keeping
            it in sync by hand.
          </p>
        </Section>

        <Section title="Private by default">
          <p>
            You sign in to your own account and build your own tree. Your
            family’s names and stories are visible only to you. Each person can
            carry their names, places, work, an optional family motto, and a
            short story — as much or as little as you know.
          </p>
        </Section>

        <Section title="How it’s built">
          <p>
            A Next.js app in TypeScript with a Neo4j graph database as the source
            of truth for relationships. Every input is validated, queries are
            parameterised, and the interactive tree is drawn on canvas. It’s
            type-checked, linted and built in CI before anything ships.
          </p>
        </Section>

        <Section title="Start your tree">
          <p>
            Begin with a single name — yourself, a parent, a grandparent — and
            let it branch out from there.
          </p>
          <div className="pt-1">
            <Link href="/signup" className={buttonVariants({ variant: 'primary' })}>
              Create an account
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
