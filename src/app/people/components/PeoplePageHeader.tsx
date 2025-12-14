'use client';
import { PlusIcon } from '@phosphor-icons/react';

interface PeoplePageHeaderProps {
  onAddPerson: () => void;
}

export default function PeoplePageHeader({
  onAddPerson,
}: PeoplePageHeaderProps) {
  return (
    <div className='flex justify-between items-start mb-8 pb-6 border-brown-rust/20 border-b-2'>
      <div className='flex-1'>
        <h1 className='text-shadow mb-2 font-heading font-semibold text-brown-rust text-4xl'>
          People Management
        </h1>
        <p className='font-body text-brown-rust/80 text-lg'>
          Add, edit, and manage family members in your genealogy tree
        </p>
      </div>
      <button
        className='flex items-center gap-2 bg-brown-rust hover:bg-brown-rust/80 shadow-lg hover:shadow-xl px-6 py-3 border-none rounded-lg font-body font-medium text-dairy-cream text-sm transition-all hover:-translate-y-0.5 duration-200 cursor-pointer'
        onClick={onAddPerson}
      >
        <PlusIcon className='w-4 h-4' weight='bold' />
        Add Person
      </button>
    </div>
  );
}
