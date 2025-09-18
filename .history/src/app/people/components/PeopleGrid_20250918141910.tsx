"use client";
import PersonCard from "@/components/PersonCard";
import { Person } from "@/types/person";

interface PeopleGridProps {
  people: Person[];
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onManageRelationships: (person: Person) => void;
}

export default function PeopleGrid({ 
  people, 
  onEdit, 
  onDelete, 
  onManageRelationships 
}: PeopleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageRelationships={onManageRelationships}
        />
      ))}
    </div>
  );
}
