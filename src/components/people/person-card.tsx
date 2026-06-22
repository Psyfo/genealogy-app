import Link from 'next/link';
import { Briefcase, MapPin } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { fullName, initials, isLiving, lifespan } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Person } from '@/types/person';

const ACCENTS = ['bg-cobalt', 'bg-vermilion', 'bg-emerald', 'bg-magenta', 'bg-marigold'] as const;

function accentFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

export function PersonCard({ person }: { person: Person }) {
  const living = isLiving(person);
  const span = lifespan(person);

  return (
    <Link
      href={`/people/${person.id}`}
      className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
    >
      <article className="h-full overflow-hidden rounded-sm border-2 border-ink bg-paper shadow-block-sm transition-all duration-150 group-hover:-translate-x-px group-hover:-translate-y-px group-hover:shadow-block">
        <div className={cn('h-1.5 w-full', accentFor(person.id))} />
        <div className="flex items-start gap-3 p-4">
          <Avatar
            initials={initials(person)}
            seed={person.id}
            className="size-12 text-lg"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-bold leading-tight">
              {fullName(person)}
            </h3>
            {person.maidenName && (
              <p className="truncate text-xs italic text-muted-foreground">
                née {person.maidenName}
              </p>
            )}
            {span && (
              <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                {span}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-4">
          {person.occupation && (
            <Badge tone="neutral">
              <Briefcase className="size-3" />
              {person.occupation}
            </Badge>
          )}
          {person.birthPlace && (
            <Badge tone="neutral">
              <MapPin className="size-3" />
              {person.birthPlace}
            </Badge>
          )}
          <Badge tone={living ? 'emerald' : 'neutral'}>
            {living ? 'Living' : 'In memory'}
          </Badge>
        </div>
      </article>
    </Link>
  );
}
