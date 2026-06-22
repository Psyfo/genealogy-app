'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Link2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/input';
import { fullName } from '@/lib/format';
import type { Person, Relatives, RelationshipInput } from '@/types/person';

type RelType = 'parent' | 'child' | 'spouse';

function roleFromGender(gender: Person['gender']): 'father' | 'mother' | 'parent' {
  if (gender === 'male') return 'father';
  if (gender === 'female') return 'mother';
  return 'parent';
}

export function RelationshipManager({
  person,
  people,
  relatives,
}: {
  person: Person;
  people: Person[];
  relatives: Relatives;
}) {
  const router = useRouter();
  const [relType, setRelType] = useState<RelType>('parent');
  const [targetId, setTargetId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people],
  );
  const options = useMemo(
    () => people.filter((p) => p.id !== person.id),
    [people, person.id],
  );

  async function send(method: 'POST' | 'DELETE', payload: RelationshipInput): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/relationships', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? 'Could not update the relationship.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  function payloadFor(method: 'add', type: RelType, otherId: string): RelationshipInput {
    if (type === 'spouse') {
      return { kind: 'marriage', aId: person.id, bId: otherId, status: 'married' };
    }
    if (type === 'parent') {
      return {
        kind: 'parent',
        parentId: otherId,
        childId: person.id,
        role: roleFromGender(byId.get(otherId)?.gender ?? 'unknown'),
      };
    }
    return {
      kind: 'parent',
      parentId: person.id,
      childId: otherId,
      role: roleFromGender(person.gender),
    };
  }

  async function handleAdd(): Promise<void> {
    if (!targetId) return;
    await send('POST', payloadFor('add', relType, targetId));
    setTargetId('');
  }

  function removeRow(label: string, items: { id: string; name: string; remove: RelationshipInput }[]) {
    if (items.length === 0) return null;
    return (
      <div className="flex flex-col gap-1.5">
        <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </h4>
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={`${label}-${item.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm"
            >
              <span className="truncate font-medium">{item.name}</span>
              <button
                type="button"
                onClick={() => void send('DELETE', item.remove)}
                disabled={busy}
                aria-label={`Remove ${item.name}`}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger hover:text-primary-foreground disabled:opacity-50"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <Field label="Relationship" htmlFor="rel-type" className="sm:w-36">
          <Select
            id="rel-type"
            value={relType}
            onChange={(e) => setRelType(e.target.value as RelType)}
          >
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="spouse">Spouse</option>
          </Select>
        </Field>
        <Field label="Person" htmlFor="rel-target">
          <Select
            id="rel-target"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">Choose a person…</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {fullName(p)}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="button" onClick={() => void handleAdd()} disabled={busy || !targetId}>
          <Link2 />
          Link
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {removeRow(
          'Parents',
          relatives.parents.map((p) => ({
            id: p.id,
            name: fullName(p),
            remove: { kind: 'parent', parentId: p.id, childId: person.id },
          })),
        )}
        {removeRow(
          'Children',
          relatives.children.map((p) => ({
            id: p.id,
            name: fullName(p),
            remove: { kind: 'parent', parentId: person.id, childId: p.id },
          })),
        )}
        {removeRow(
          'Spouses',
          relatives.spouses.map((s) => ({
            id: s.person.id,
            name: fullName(s.person),
            remove: { kind: 'marriage', aId: person.id, bId: s.person.id },
          })),
        )}
      </div>
    </div>
  );
}
