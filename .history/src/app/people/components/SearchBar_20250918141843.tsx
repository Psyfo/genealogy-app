"use client";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="mb-8">
      <div className="relative max-w-md">
        <MagnifyingGlass 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brown-rust/60" 
          weight="regular" 
        />
        <input
          type="text"
          placeholder="Search people by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-brown-rust/20 rounded-lg font-body text-sm bg-white/80 text-brown-rust transition-all duration-200 focus:outline-none focus:border-brown-rust focus:bg-white/95 focus:shadow-lg focus:ring-4 focus:ring-brown-rust/10"
        />
      </div>
    </div>
  );
}
