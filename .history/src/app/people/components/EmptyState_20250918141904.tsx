"use client";
import { Plus } from "@phosphor-icons/react";

interface EmptyStateProps {
  searchTerm: string;
  onAddPerson: () => void;
}

export default function EmptyState({ searchTerm, onAddPerson }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-8 text-center text-brown-rust">
      <div className="w-20 h-20 bg-brown-rust/10 rounded-full flex items-center justify-center mb-6">
        <Plus className="w-10 h-10 opacity-60" weight="regular" />
      </div>
      <h3 className="font-heading text-2xl font-semibold mb-2">No people found</h3>
      <p className="font-body text-base opacity-80 mb-6">
        {searchTerm 
          ? 'No people match your search criteria'
          : 'Start by adding your first family member'
        }
      </p>
      {!searchTerm && (
        <button
          className="bg-brown-rust text-dairy-cream border-none rounded-lg px-6 py-3 font-body text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-rust/80 hover:-translate-y-0.5"
          onClick={onAddPerson}
        >
          Add First Person
        </button>
      )}
    </div>
  );
}
