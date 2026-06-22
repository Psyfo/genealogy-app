'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { GENDERS, personInputSchema } from '@/lib/validation';
import type { Person } from '@/types/person';

type FormState = Record<string, string>;

const FIELDS = [
  'givenName', 'familyName', 'otherNames', 'maidenName', 'gender',
  'birthDate', 'birthPlace', 'deathDate', 'deathPlace',
  'occupation', 'clanPraise', 'bio', 'photoUrl',
] as const;

function toFormState(person?: Person): FormState {
  const state: FormState = {};
  for (const key of FIELDS) state[key] = (person?.[key] as string | undefined) ?? '';
  if (!person) state.gender = 'unknown';
  return state;
}

type PersonFormProps = {
  person?: Person;
  onSuccess: (person: Person) => void;
  onCancel: () => void;
};

export function PersonForm({ person, onSuccess, onCancel }: PersonFormProps) {
  const [state, setState] = useState<FormState>(() => toFormState(person));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(person);
  const set = (key: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setState((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setServerError(null);

    const parsed = personInputSchema.safeParse(state);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(
        isEdit ? `/api/people/${person!.id}` : '/api/people',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(parsed.data),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        setServerError(body?.error?.message ?? 'Could not save this person.');
        return;
      }
      onSuccess(body.data as Person);
    } catch {
      setServerError('Could not reach the server. Is the app running?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Given name" htmlFor="givenName" required error={errors.givenName}>
          <Input id="givenName" value={state.givenName} onChange={set('givenName')} autoFocus />
        </Field>
        <Field label="Family name" htmlFor="familyName" required error={errors.familyName}>
          <Input id="familyName" value={state.familyName} onChange={set('familyName')} />
        </Field>
        <Field label="Other names" htmlFor="otherNames" error={errors.otherNames}>
          <Input id="otherNames" value={state.otherNames} onChange={set('otherNames')} />
        </Field>
        <Field label="Maiden name" htmlFor="maidenName" error={errors.maidenName}>
          <Input id="maidenName" value={state.maidenName} onChange={set('maidenName')} />
        </Field>
        <Field label="Gender" htmlFor="gender" error={errors.gender}>
          <Select id="gender" value={state.gender} onChange={set('gender')}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Occupation" htmlFor="occupation" error={errors.occupation}>
          <Input id="occupation" value={state.occupation} onChange={set('occupation')} />
        </Field>
        <Field label="Born" htmlFor="birthDate" hint="Year, month or full date" error={errors.birthDate}>
          <Input id="birthDate" value={state.birthDate} onChange={set('birthDate')} placeholder="1942-02-27" />
        </Field>
        <Field label="Birthplace" htmlFor="birthPlace" error={errors.birthPlace}>
          <Input id="birthPlace" value={state.birthPlace} onChange={set('birthPlace')} />
        </Field>
        <Field label="Died" htmlFor="deathDate" hint="Leave blank if living" error={errors.deathDate}>
          <Input id="deathDate" value={state.deathDate} onChange={set('deathDate')} placeholder="2011-05-03" />
        </Field>
        <Field label="Place of death" htmlFor="deathPlace" error={errors.deathPlace}>
          <Input id="deathPlace" value={state.deathPlace} onChange={set('deathPlace')} />
        </Field>
      </div>

      <Field label="Clan praise (isithakazelo)" htmlFor="clanPraise" error={errors.clanPraise}>
        <Input id="clanPraise" value={state.clanPraise} onChange={set('clanPraise')} placeholder="Mahlangu, Mnguni…" />
      </Field>
      <Field label="Story" htmlFor="bio" hint="A few lines about their life" error={errors.bio}>
        <Textarea id="bio" value={state.bio} onChange={set('bio')} rows={4} />
      </Field>

      {serverError && (
        <p className="rounded-sm border-2 border-vermilion bg-vermilion/10 px-3 py-2 text-sm font-medium text-vermilion">
          {serverError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add person'}
        </Button>
      </div>
    </form>
  );
}
