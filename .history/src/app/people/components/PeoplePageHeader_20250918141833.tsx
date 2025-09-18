"use client";
import { Plus } from "@phosphor-icons/react";

interface PeoplePageHeaderProps {
  onAddPerson: () => void;
}

export default function PeoplePageHeader({ onAddPerson }: PeoplePageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-brown-rust/20">
      <div className="flex-1">
        <h1 className="font-heading text-4xl font-semibold text-brown-rust mb-2 text-shadow">
          People Management
        </h1>
        <p className="font-body text-lg text-brown-rust/80">
          Add, edit, and manage family members in your genealogy tree
        </p>
      </div>
      <button
        className="flex items-center gap-2 bg-brown-rust text-dairy-cream border-none rounded-lg px-6 py-3 font-body text-sm font-medium cursor-pointer transition-all duration-200 shadow-lg hover:bg-brown-rust/80 hover:-translate-y-0.5 hover:shadow-xl"
        onClick={onAddPerson}
      >
        <Plus className="w-4 h-4" weight="bold" />
        Add Person
      </button>
    </div>
  );
}
