'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Search, UsersRound } from 'lucide-react';

import { PersonCard } from './person-card';
import { PersonForm } from './person-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Person } from '@/types/person';

export function PeopleExplorer({ initialPeople }: { initialPeople: Person[] }) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const firstRun = useRef(true);

  async function load(search: string): Promise<void> {
    setLoading(true);
    try {
      const url = search
        ? `/api/people?search=${encodeURIComponent(search)}`
        : '/api/people';
      const response = await fetch(url);
      const body = await response.json();
      if (response.ok) setPeople(body.data as Person[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const handle = setTimeout(() => void load(query), 220);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name…"
            className="pl-9"
            aria-label="Search people"
          />
        </div>
        <Button onClick={() => setAdding(true)} className="sm:w-auto">
          <Plus />
          Add person
        </Button>
      </div>

      {people.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-hairline bg-parchment/40 px-6 py-16 text-center">
          <UsersRound className="size-8 text-muted-foreground" />
          <p className="font-display text-xl font-bold">
            {query ? 'No one by that name' : 'No people yet'}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {query
              ? 'Try a different spelling, or add them to the family record.'
              : 'Start the family record by adding the first person.'}
          </p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy={loading}
        >
          {people.map((person) => (
            <li key={person.id}>
              <PersonCard person={person} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a person</DialogTitle>
            <DialogDescription>
              Add a new name to the family record. Only given and family names are required.
            </DialogDescription>
          </DialogHeader>
          <PersonForm
            onCancel={() => setAdding(false)}
            onSuccess={() => {
              setAdding(false);
              void load(query);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
