'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import { PersonForm } from './person-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fullName } from '@/lib/format';
import type { Person } from '@/types/person';

export function PersonActions({ person }: { person: Person }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      const response = await fetch(`/api/people/${person.id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/people');
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
        <Pencil />
        Edit
      </Button>
      <Button variant="ghost" size="icon" aria-label="Remove person" onClick={() => setConfirming(true)}>
        <Trash2 className="text-vermilion" />
      </Button>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {person.givenName}</DialogTitle>
            <DialogDescription>Update this person’s details.</DialogDescription>
          </DialogHeader>
          <PersonForm
            person={person}
            onCancel={() => setEditing(false)}
            onSuccess={() => {
              setEditing(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {fullName(person)}?</DialogTitle>
            <DialogDescription>
              This permanently removes them and every relationship linking them to
              the family. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
