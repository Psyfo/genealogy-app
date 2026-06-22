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
      className="group flex items-center gap-2.5 rounded-lg border border-hairline bg-paper px-2.5 py-2 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-evergreen"
    >
      <Avatar initials={initials(person)} seed={person.id} className="size-9 text-sm" />
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold leading-tight">
          {fullName(person)}
        </p>
        <p className="truncate text-[11px] tabular-nums text-muted-foreground">
          {note ?? span ?? '—'}
        </p>
      </div>
    </Link>
  );
}
