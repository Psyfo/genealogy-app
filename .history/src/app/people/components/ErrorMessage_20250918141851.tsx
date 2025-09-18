"use client";
import { X } from "@phosphor-icons/react";

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export default function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-between bg-mandys-pink text-brown-rust px-6 py-4 rounded-lg mb-6 border-l-4 border-brown-rust">
      <p className="font-body text-sm font-medium">{error}</p>
      <button
        onClick={onDismiss}
        className="bg-transparent border-none text-brown-rust text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center hover:bg-brown-rust/10 rounded transition-colors duration-200"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" weight="bold" />
      </button>
    </div>
  );
}
