export type RelationshipType = 'PARENT_OF' | 'MARRIED_TO' | 'SIBLING_OF';

export interface Relationship {
  fromId: string;
  toId: string;
  type: RelationshipType;
}
