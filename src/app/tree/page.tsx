import type { Metadata } from 'next';

import { FamilyGraph } from '@/components/tree/family-graph';
import { PageHeading } from '@/components/layout/page-heading';
import { requireUser } from '@/lib/auth/current-user';
import { getGraph } from '@/lib/graph';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Family tree',
  description: 'Your family, drawn as a living graph.',
};

export default async function TreePage() {
  const user = await requireUser('/tree');
  const data = await getGraph(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeading
        eyebrow={`${data.nodes.length} people · ${data.links.length} ties`}
        title="Your family tree"
        description="Generations flow from top to bottom. Drag to rearrange, scroll to zoom, and click anyone to open their story."
      />
      <div className="mt-8">
        {data.nodes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-hairline bg-parchment/40 px-6 py-20 text-center">
            <p className="font-display text-xl font-semibold">Nothing to draw yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add people and link them together, and your tree will grow here.
            </p>
          </div>
        ) : (
          <FamilyGraph data={data} />
        )}
      </div>
    </div>
  );
}
