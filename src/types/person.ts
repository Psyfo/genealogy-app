export type {
  Person,
  PersonInput,
  PersonUpdate,
  Gender,
  RelationshipInput,
} from '@/lib/validation';

import type { Person } from '@/lib/validation';

export type MarriageStatus = 'married' | 'divorced' | 'widowed';

export type SpouseLink = {
  person: Person;
  status: MarriageStatus;
  since?: string | null;
  until?: string | null;
};

/** A person together with everyone one hop away in the graph. */
export type Relatives = {
  parents: Person[];
  children: Person[];
  siblings: Person[];
  spouses: SpouseLink[];
};

export type PersonWithRelatives = {
  person: Person;
  relatives: Relatives;
};
