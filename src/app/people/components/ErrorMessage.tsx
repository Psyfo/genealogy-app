'use client';
import { XIcon } from '@phosphor-icons/react';

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export default function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className='flex justify-between items-center bg-mandys-pink mb-6 px-6 py-4 border-brown-rust border-l-4 rounded-lg text-brown-rust'>
      <p className='font-body font-medium text-sm'>{error}</p>
      <button
        onClick={onDismiss}
        className='flex justify-center items-center bg-transparent hover:bg-brown-rust/10 p-0 border-none rounded w-6 h-6 text-brown-rust text-xl transition-colors duration-200 cursor-pointer'
        aria-label='Dismiss error'
      >
        <XIcon className='w-4 h-4' weight='bold' />
      </button>
    </div>
  );
}
