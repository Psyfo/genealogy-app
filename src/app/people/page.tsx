import type { Metadata } from 'next';

import { PageHeading } from '@/components/layout/page-heading';
import { PeopleExplorer } from '@/components/people/people-explorer';
import { requireUser } from '@/lib/auth/current-user';
import { listPeople } from '@/lib/people';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'People',
  description: 'Everyone in your family tree.',
};

export default async function PeoplePage() {
  const user = await requireUser('/people');
  const people = await listPeople(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHeading
        eyebrow={`${people.length} ${people.length === 1 ? 'person' : 'people'}`}
        title="Your people"
        description="Everyone in your family tree. Search the living and the remembered, or add someone new."
      />
      <div className="mt-10">
        <PeopleExplorer initialPeople={people} />
      </div>
    </div>
  );
}
