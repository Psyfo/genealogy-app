'use client';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
}: SearchBarProps) {
  return (
    <div className='mb-8'>
      <div className='relative max-w-md'>
        <MagnifyingGlassIcon
          className='top-1/2 left-4 absolute w-5 h-5 text-brown-rust/60 -translate-y-1/2 transform'
          weight='regular'
        />
        <input
          type='text'
          placeholder='Search people by name...'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='bg-white/80 focus:bg-white/95 focus:shadow-lg py-3 pr-4 pl-12 border-2 border-brown-rust/20 focus:border-brown-rust rounded-lg focus:outline-none focus:ring-4 focus:ring-brown-rust/10 w-full font-body text-brown-rust text-sm transition-all duration-200'
        />
      </div>
    </div>
  );
}
