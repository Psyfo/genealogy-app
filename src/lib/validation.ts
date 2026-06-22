import { z } from 'zod';

/**
 * Zod is the single source of truth for the domain. Types are inferred from
 * these schemas (never hand-written), and every API boundary parses with them.
 */

/** Treat blank form strings as "not provided". */
const blankToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

/** Accepts a full or partial calendar date: YYYY, YYYY-MM or YYYY-MM-DD. */
const partialDate = z
  .string()
  .trim()
  .regex(
    /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/,
    'Use a year (1880), month (1880-04) or full date (1880-04-12).',
  );

const optionalDate = z.preprocess(blankToUndefined, partialDate.optional());

export const GENDERS = ['female', 'male', 'other', 'unknown'] as const;
export const genderSchema = z.enum(GENDERS);

/** Full stored record, as it lives on a :Person node. */
export const personSchema = z.object({
  id: z.uuid(),
  givenName: z.string().trim().min(1, 'A given name is required.').max(80),
  familyName: z.string().trim().min(1, 'A family name is required.').max(80),
  otherNames: optionalText(120),
  maidenName: optionalText(80),
  gender: genderSchema,
  birthDate: optionalDate,
  birthPlace: optionalText(160),
  deathDate: optionalDate,
  deathPlace: optionalText(160),
  occupation: optionalText(120),
  // isithakazelo / clan praise names — central to Nguni & Ndebele identity.
  clanPraise: optionalText(400),
  bio: optionalText(2000),
  photoUrl: z.preprocess(blankToUndefined, z.url().optional()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const yearOf = (value?: string): number | undefined =>
  value ? Number.parseInt(value.slice(0, 4), 10) : undefined;

/** Shared rule: a death cannot precede a birth. */
const chronological = <T extends { birthDate?: string; deathDate?: string }>(
  data: T,
  ctx: z.RefinementCtx,
): void => {
  const birth = yearOf(data.birthDate);
  const death = yearOf(data.deathDate);
  if (birth !== undefined && death !== undefined && death < birth) {
    ctx.addIssue({
      code: 'custom',
      path: ['deathDate'],
      message: 'Death date cannot be before birth date.',
    });
  }
};

export const personInputSchema = personSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ gender: genderSchema.default('unknown') })
  .superRefine(chronological);

export const personUpdateSchema = personSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial()
  .superRefine(chronological);

const parentRelationship = z.object({
  kind: z.literal('parent'),
  parentId: z.uuid(),
  childId: z.uuid(),
  role: z.enum(['father', 'mother', 'parent']).default('parent'),
});

const marriageRelationship = z.object({
  kind: z.literal('marriage'),
  aId: z.uuid(),
  bId: z.uuid(),
  status: z.enum(['married', 'divorced', 'widowed']).default('married'),
  since: optionalDate,
  until: optionalDate,
});

export const relationshipInputSchema = z
  .discriminatedUnion('kind', [parentRelationship, marriageRelationship])
  .superRefine((data, ctx) => {
    const [a, b] =
      data.kind === 'parent'
        ? [data.parentId, data.childId]
        : [data.aId, data.bId];
    if (a === b) {
      ctx.addIssue({
        code: 'custom',
        message: 'A person cannot be related to themselves.',
      });
    }
  });

export type Person = z.infer<typeof personSchema>;
export type PersonInput = z.input<typeof personInputSchema>;
export type PersonUpdate = z.input<typeof personUpdateSchema>;
export type Gender = z.infer<typeof genderSchema>;
// Input shape (defaults like role/status optional) — what callers construct.
export type RelationshipInput = z.input<typeof relationshipInputSchema>;
