import Link from 'next/link';

import { Avatar } from '@/components/ui/avatar';
import { fullName, initials, lifespan } from '@/lib/format';
import type { Person } from '@/types/person';

export function RelativeChip({
  person,
  note,
}: {
  person: Person;
  note?: string;
}) {
  const span = lifespan(person);
  return (
    <Link
      href={`/people/${person.id}`}
      className="group flex items-center gap-2.5 rounded-sm border-2 border-ink bg-paper px-2.5 py-2 shadow-block-sm transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
    >
      <Avatar initials={initials(person)} seed={person.id} className="size-9 text-sm" />
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold leading-tight">
          {fullName(person)}
        </p>
        <p className="truncate font-mono text-[11px] tabular-nums text-muted-foreground">
          {note ?? span ?? '—'}
        </p>
      </div>
    </Link>
  );
}
