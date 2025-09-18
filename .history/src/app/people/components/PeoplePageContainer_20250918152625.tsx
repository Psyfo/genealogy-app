"use client";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import LoadingState from "./LoadingState";
import PeopleGrid from "./PeopleGrid";
import PeoplePageHeader from "./PeoplePageHeader";
import PersonForm from "@/components/PersonForm";
import RelationshipManager from "@/components/RelationshipManager";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { Person } from "@/types/person";

// Modal Components

// Modular Components

export default function PeoplePageContainer() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletePerson, setDeletePerson] = useState<Person | null>(null);
  const [relationshipPerson, setRelationshipPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch people from API
  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/people');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to fetch people');
      }
      
      setPeople(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load people on component mount
  useEffect(() => {
    fetchPeople();
  }, []);

  // Handle adding a new person
  const handleAddPerson = async (personData: Omit<Person, 'id'>) => {
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to add person');
      }

      await fetchPeople(); // Refresh the list
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add person');
    }
  };

  // Handle updating a person
  const handleUpdatePerson = async (personData: Person | Omit<Person, 'id'>) => {
    const person = personData as Person; // Safe cast since we only use this for updates
    try {
      const response = await fetch(`/api/people/${person.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to update person');
      }

      await fetchPeople(); // Refresh the list
      setEditingPerson(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person');
    }
  };

  // Handle deleting a person
  const handleDeletePerson = async (personId: string) => {
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to delete person');
      }

      await fetchPeople(); // Refresh the list
      setDeletePerson(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete person');
    }
  };

  // Filter people based on search term
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ml-0 lg:ml-[280px] p-4 lg:p-8 min-h-screen bg-gradient-to-br from-dairy-cream to-pigeon-post">
      <PeoplePageHeader onAddPerson={() => setShowForm(true)} />
      
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      {loading && <LoadingState />}

      {!loading && (
        <>
          {filteredPeople.length === 0 ? (
            <EmptyState 
              searchTerm={searchTerm} 
              onAddPerson={() => setShowForm(true)} 
            />
          ) : (
            <PeopleGrid
              people={filteredPeople}
              onEdit={setEditingPerson}
              onDelete={setDeletePerson}
              onManageRelationships={setRelationshipPerson}
            />
          )}
        </>
      )}

      {/* Modal Components */}
      {showForm && (
        <PersonForm
          person={null}
          onSave={handleAddPerson}
          onCancel={() => setShowForm(false)}
          title="Add New Person"
        />
      )}

      {editingPerson && (
        <PersonForm
          person={editingPerson}
          onSave={handleUpdatePerson}
          onCancel={() => setEditingPerson(null)}
          title="Edit Person"
        />
      )}

      {deletePerson && (
        <DeleteConfirmation
          person={deletePerson}
          onConfirm={() => handleDeletePerson(deletePerson.id)}
          onCancel={() => setDeletePerson(null)}
        />
      )}

      {relationshipPerson && (
        <RelationshipManager
          person={relationshipPerson}
          onClose={() => setRelationshipPerson(null)}
          onUpdate={fetchPeople}
        />
      )}
    </div>
  );
}
