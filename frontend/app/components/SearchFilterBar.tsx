"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchFilterBar({ value, onChange }: SearchFilterBarProps) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for items or stores..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
        <SlidersHorizontal size={16} />
        Filters
      </button>
    </div>
  );
}
