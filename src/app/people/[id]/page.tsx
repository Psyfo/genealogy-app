import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Briefcase, Cake, Flower2 } from 'lucide-react';

import { FamilyBoard } from '@/components/people/family-board';
import { PersonActions } from '@/components/people/person-actions';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NdebeleBand } from '@/components/layout/ndebele-band';
import { getPerson, listPeople } from '@/lib/people';
import { getRelatives } from '@/lib/relationships';
import { ageOf, formatDate, fullName, initials, isLiving, lifespan } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getPerson(id);
  return { title: person ? fullName(person) : 'Person not found' };
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-cobalt">{icon}</span>
      <div>
        <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const [relatives, people] = await Promise.all([getRelatives(id), listPeople()]);
  const living = isLiving(person);
  const age = ageOf(person);
  const bornValue = [formatDate(person.birthDate), person.birthPlace].filter(Boolean).join(' · ');
  const diedValue = [formatDate(person.deathDate), person.deathPlace].filter(Boolean).join(' · ');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/people"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        All people
      </Link>

      {/* Header */}
      <header className="mt-5 overflow-hidden rounded-lg border-2 border-ink bg-paper shadow-block">
        <NdebeleBand height={12} />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <Avatar
              initials={initials(person)}
              seed={person.id}
              className="size-16 text-2xl sm:size-20 sm:text-3xl"
            />
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
                {fullName(person)}
              </h1>
              {person.maidenName && (
                <p className="mt-1 text-sm italic text-muted-foreground">
                  née {person.maidenName}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {lifespan(person) && (
                  <Badge tone="ink" className="font-mono tabular-nums">
                    {lifespan(person)}
                  </Badge>
                )}
                <Badge tone={living ? 'emerald' : 'neutral'}>
                  {living ? 'Living' : 'In memory'}
                </Badge>
                {age !== null && (
                  <Badge tone="neutral">
                    {living ? `${age} years` : `${age} years lived`}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <PersonActions person={person} />
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Story & details */}
        <div className="flex flex-col gap-8">
          {person.clanPraise && (
            <blockquote className="border-l-4 border-marigold bg-marigold/10 py-2 pl-4 font-display text-lg font-semibold italic leading-snug text-ink">
              “{person.clanPraise}”
            </blockquote>
          )}

          {person.bio && (
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight">Story</h2>
              <p className="leading-relaxed text-ink-soft text-pretty">{person.bio}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight">Details</h2>
            <dl className="divide-y divide-hairline">
              {bornValue && <DetailRow icon={<Cake className="size-4" />} label="Born" value={bornValue} />}
              {diedValue && <DetailRow icon={<Flower2 className="size-4" />} label="Died" value={diedValue} />}
              {person.occupation && (
                <DetailRow icon={<Briefcase className="size-4" />} label="Occupation" value={person.occupation} />
              )}
              {!bornValue && !diedValue && !person.occupation && (
                <p className="py-2 text-sm text-muted-foreground">No further details recorded yet.</p>
              )}
            </dl>
          </div>
        </div>

        {/* Family */}
        <FamilyBoard person={person} people={people} relatives={relatives} />
      </div>
    </div>
  );
}
