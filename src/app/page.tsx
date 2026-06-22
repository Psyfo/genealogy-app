import Link from 'next/link';
import { ArrowRight, GitFork, Users } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { NdebeleBand } from '@/components/layout/ndebele-band';
import { getGraph } from '@/lib/graph';

export const dynamic = 'force-dynamic';

function Gable() {
  // A Ndebele gable: nested keyline triangles in the house-front tradition.
  const colors = ['#1f44c2', '#f3b324', '#df3b2c', '#1b8f5d'];
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <rect width="200" height="200" fill="#fffdf8" />
      {colors.map((color, i) => {
        const inset = i * 22;
        return (
          <polygon
            key={i}
            points={`100,${20 + inset} ${180 - inset},${180 - inset} ${20 + inset},${180 - inset}`}
            fill={color}
            stroke="#15110d"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        );
      })}
      <circle cx="100" cy="142" r="9" fill="#fffdf8" stroke="#15110d" strokeWidth={2.5} />
    </svg>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-sm border-2 border-ink bg-paper px-4 py-3 shadow-block-sm">
      <p className="font-display text-3xl font-extrabold tabular-nums leading-none">{value}</p>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export default async function HomePage() {
  const graph = await getGraph();
  const generations = new Set(graph.nodes.map((node) => node.generation)).size;
  const marriages = graph.links.filter((link) => link.type === 'MARRIED_TO').length;

  return (
    <div>
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:py-24">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-cobalt">
            Ndebele roots · a living record
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            The Mahlangu family, kept in one place.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Names, dates and stories — held together in a family graph and drawn
            in the bold geometry of Ndebele art. Every person a node, every bond
            an edge, every generation a colour.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/tree" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Explore the tree
              <ArrowRight />
            </Link>
            <Link href="/people" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Browse the people
            </Link>
          </div>
          <div className="mt-2 grid max-w-md grid-cols-3 gap-3">
            <Stat value={String(graph.nodes.length)} label="People" />
            <Stat value={String(generations)} label="Generations" />
            <Stat value={String(marriages)} label="Marriages" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border-2 border-ink bg-paper shadow-block-lg">
          <NdebeleBand height={14} />
          <div className="aspect-square p-6">
            <Gable />
          </div>
          <NdebeleBand height={14} offset={3} />
        </div>
      </section>

      <NdebeleBand height={12} offset={1} />

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {[
          {
            icon: <GitFork className="size-6" />,
            title: 'Graph-native',
            body: 'Built on a Neo4j graph, so siblings, ancestors and descendants are discovered by following the edges — never copied or kept in sync by hand.',
          },
          {
            icon: <Users className="size-6" />,
            title: 'Made for stories',
            body: 'Each person carries their names, places, work and a short story — and their clan praise, the isithakazelo that names the line.',
          },
          {
            icon: <ArrowRight className="size-6" />,
            title: 'Yours to grow',
            body: 'Add people, draw connections, and watch the tree redraw itself. The sample family is only a starting point — replace it with your own.',
          },
        ].map((pillar) => (
          <div key={pillar.title} className="flex flex-col gap-3 rounded-lg border-2 border-ink bg-paper p-6 shadow-block-sm">
            <span className="inline-flex size-11 items-center justify-center rounded-sm border-2 border-ink bg-marigold text-ink">
              {pillar.icon}
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight">{pillar.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{pillar.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
