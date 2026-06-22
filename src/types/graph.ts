import type { Gender } from '@/lib/validation';

export type GraphLinkType = 'PARENT_OF' | 'MARRIED_TO';

export type GraphNode = {
  id: string;
  name: string;
  familyName: string;
  gender: Gender;
  birthYear: number | null;
  deathYear: number | null;
  living: boolean;
  /** 0 = oldest known generation, increasing toward descendants. */
  generation: number;
};

export type GraphLink = {
  source: string;
  target: string;
  type: GraphLinkType;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};
