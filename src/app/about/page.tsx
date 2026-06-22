import type { Metadata } from 'next';

import { PageHeading } from '@/components/layout/page-heading';
import { NdebeleBand } from '@/components/layout/ndebele-band';

export const metadata: Metadata = {
  title: 'About',
  description: 'About this family record and the Ndebele-inspired design behind it.',
};

const PALETTE = [
  { name: 'Cobalt', hex: '#1f44c2', text: 'text-primary-foreground' },
  { name: 'Marigold', hex: '#f3b324', text: 'text-ink' },
  { name: 'Vermilion', hex: '#df3b2c', text: 'text-primary-foreground' },
  { name: 'Emerald', hex: '#1b8f5d', text: 'text-primary-foreground' },
  { name: 'Magenta', hex: '#c3338a', text: 'text-primary-foreground' },
  { name: 'Ink', hex: '#15110d', text: 'text-bone' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
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
        title="A family, drawn in geometry"
        description="This is a living record of the Mahlangu family — a place for names, dates and stories to be kept, connected and passed on."
      />

      <div className="mt-12 flex flex-col gap-12">
        <Section title="The idea">
          <p>
            Family history is really a graph: people connected by birth and
            marriage across generations. So this app stores it as one. Rather
            than spreadsheets and duplicated columns, every person is a node and
            every relationship is an edge — and questions like “who are her
            siblings?” or “show me four generations of ancestors” become a walk
            across the graph.
          </p>
        </Section>

        <Section title="The design — Ndebele Modernism">
          <p>
            The look is drawn from Ndebele mural art and beadwork: a warm bone
            ground, saturated primaries, and the heavy black keyline that
            outlines every shape. Hard edges, confident colour blocks, and the
            triangular frieze you’ll see banding the pages. It’s a modern
            interpretation, not a costume — structure and restraint carrying a
            bold, joyful palette.
          </p>
          <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PALETTE.map((swatch) => (
              <div
                key={swatch.name}
                className={`flex aspect-square flex-col justify-end rounded-sm border-2 border-ink p-2 ${swatch.text}`}
                style={{ backgroundColor: swatch.hex }}
              >
                <span className="font-mono text-[10px] font-medium uppercase tracking-wide">
                  {swatch.name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="How it’s built">
          <p>
            A Next.js App Router frontend in TypeScript, with a Neo4j graph
            database as the single source of truth for relationships. Every input
            is validated with Zod at the boundary, queries are parameterised
            Cypher, and the interactive tree is rendered on canvas. The whole
            thing is type-checked, linted and built in CI before anything merges.
          </p>
        </Section>

        <Section title="The data">
          <p>
            The names shown are an illustrative sample family — four invented
            generations rooted in KwaNdebele and Pretoria — there to show the app
            in motion. Replace them with your own: add people, link them, and the
            tree redraws itself.
          </p>
        </Section>
      </div>

      <div className="mt-16">
        <NdebeleBand height={14} offset={2} />
      </div>
    </div>
  );
}
