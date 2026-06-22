import Link from 'next/link';
import { Briefcase, MapPin } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { fullName, initials, isLiving, lifespan } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Person } from '@/types/person';

const ACCENTS = ['bg-evergreen', 'bg-amber', 'bg-terracotta', 'bg-sage', 'bg-clay'] as const;

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
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-evergreen"
    >
      <article className="h-full overflow-hidden rounded-lg border border-hairline bg-paper shadow-soft transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-soft-lg">
        <div className={cn('h-1.5 w-full', accentFor(person.id))} />
        <div className="flex items-start gap-3 p-4">
          <Avatar initials={initials(person)} seed={person.id} className="size-12 text-lg" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-semibold leading-tight">
              {fullName(person)}
            </h3>
            {person.maidenName && (
              <p className="truncate text-xs italic text-muted-foreground">
                née {person.maidenName}
              </p>
            )}
            {span && (
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">{span}</p>
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
          <Badge tone={living ? 'sage' : 'neutral'}>{living ? 'Living' : 'In memory'}</Badge>
        </div>
      </article>
    </Link>
  );
}
