'use client';
import { PlusIcon } from '@phosphor-icons/react';

interface EmptyStateProps {
  searchTerm: string;
  onAddPerson: () => void;
}

export default function EmptyState({
  searchTerm,
  onAddPerson,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col justify-center items-center col-span-full px-8 py-16 text-brown-rust text-center'>
      <div className='flex justify-center items-center bg-brown-rust/10 mb-6 rounded-full w-20 h-20'>
        <PlusIcon className='opacity-60 w-10 h-10' weight='regular' />
      </div>
      <h3 className='mb-2 font-heading font-semibold text-2xl'>
        No people found
      </h3>
      <p className='opacity-80 mb-6 font-body text-base'>
        {searchTerm
          ? 'No people match your search criteria'
          : 'Start by adding your first family member'}
      </p>
      {!searchTerm && (
        <button
          className='bg-brown-rust hover:bg-brown-rust/80 px-6 py-3 border-none rounded-lg font-body font-medium text-dairy-cream text-sm transition-all hover:-translate-y-0.5 duration-200 cursor-pointer'
          onClick={onAddPerson}
        >
          Add First Person
        </button>
      )}
    </div>
  );
}
