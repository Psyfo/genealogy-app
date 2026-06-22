'use client';

import { useState } from 'react';
import { Network } from 'lucide-react';

import { RelationshipManager } from './relationship-manager';
import { RelativesPanel } from './relatives-panel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Person, Relatives } from '@/types/person';

export function FamilyBoard({
  person,
  people,
  relatives,
}: {
  person: Person;
  people: Person[];
  relatives: Relatives;
}) {
  const [managing, setManaging] = useState(false);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold tracking-tight">Family</h2>
        <Button variant="secondary" size="sm" onClick={() => setManaging(true)}>
          <Network />
          Manage connections
        </Button>
      </div>

      <RelativesPanel relatives={relatives} />

      <Dialog open={managing} onOpenChange={setManaging}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connections for {person.givenName}</DialogTitle>
            <DialogDescription>
              Link parents, children and a spouse. Siblings are worked out
              automatically from shared parents.
            </DialogDescription>
          </DialogHeader>
          <RelationshipManager person={person} people={people} relatives={relatives} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
