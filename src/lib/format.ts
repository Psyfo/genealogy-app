import type { Person } from '@/lib/validation';

/** Year component of a partial date string (YYYY / YYYY-MM / YYYY-MM-DD). */
export function yearOf(date?: string | null): number | null {
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export function isLiving(person: { deathDate?: string | null }): boolean {
  return !person.deathDate;
}

/** Given + other names + family name, e.g. "Themba Sipho Mahlangu". */
export function fullName(
  person: Pick<Person, 'givenName' | 'otherNames' | 'familyName'>,
): string {
  return [person.givenName, person.otherNames, person.familyName]
    .filter(Boolean)
    .join(' ');
}

export function initials(
  person: Pick<Person, 'givenName' | 'familyName'>,
): string {
  return `${person.givenName.charAt(0)}${person.familyName.charAt(0)}`.toUpperCase();
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Human-readable date that respects partial precision. */
export function formatDate(date?: string | null): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  const monthName = month ? MONTHS[Number.parseInt(month, 10) - 1] : undefined;
  if (day && monthName) return `${Number.parseInt(day, 10)} ${monthName} ${year}`;
  if (monthName) return `${monthName} ${year}`;
  return year;
}

/** Compact lifespan badge: "1940–2012", "b. 1985", "1940–", or "". */
export function lifespan(
  person: Pick<Person, 'birthDate' | 'deathDate'>,
): string {
  const birth = yearOf(person.birthDate);
  const death = yearOf(person.deathDate);
  if (birth && death) return `${birth}–${death}`;
  if (birth) return `${birth}–`;
  if (death) return `–${death}`;
  return '';
}

/** Age in years (at death if deceased, today if living). Null if unknown. */
export function ageOf(
  person: Pick<Person, 'birthDate' | 'deathDate'>,
): number | null {
  const birth = yearOf(person.birthDate);
  if (!birth) return null;
  const end = yearOf(person.deathDate) ?? new Date().getFullYear();
  const age = end - birth;
  return age >= 0 ? age : null;
}
