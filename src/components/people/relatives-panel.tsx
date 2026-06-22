import { RelativeChip } from './relative-chip';
import { lifespan } from '@/lib/format';
import type { Relatives, SpouseLink } from '@/types/person';

function spouseNote(link: SpouseLink): string {
  const span = lifespan(link.person);
  const status = link.status !== 'married' ? link.status : null;
  return [status, span].filter(Boolean).join(' · ') || '—';
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h3>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function RelativesPanel({ relatives }: { relatives: Relatives }) {
  const { parents, siblings, spouses, children } = relatives;
  const isEmpty =
    !parents.length && !siblings.length && !spouses.length && !children.length;

  if (isEmpty) {
    return (
      <p className="rounded-lg border border-dashed border-hairline bg-parchment/40 px-4 py-6 text-sm text-muted-foreground">
        No relationships recorded yet. Use “Manage connections” to link parents,
        children or a spouse.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {parents.length > 0 && (
        <Group label="Parents">
          {parents.map((p) => (
            <RelativeChip key={p.id} person={p} />
          ))}
        </Group>
      )}
      {spouses.length > 0 && (
        <Group label={spouses.length > 1 ? 'Spouses' : 'Spouse'}>
          {spouses.map((s) => (
            <RelativeChip key={s.person.id} person={s.person} note={spouseNote(s)} />
          ))}
        </Group>
      )}
      {siblings.length > 0 && (
        <Group label="Siblings">
          {siblings.map((p) => (
            <RelativeChip key={p.id} person={p} />
          ))}
        </Group>
      )}
      {children.length > 0 && (
        <Group label="Children">
          {children.map((p) => (
            <RelativeChip key={p.id} person={p} />
          ))}
        </Group>
      )}
    </div>
  );
}
