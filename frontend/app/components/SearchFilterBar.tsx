"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface SearchFilterBarProps {
  value: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  onChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function SearchFilterBar({
  value,
  minPrice,
  maxPrice,
  sort,
  onChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
}: SearchFilterBarProps) {
  return (
    <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
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

      <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600">
        <SlidersHorizontal size={16} />
        <input
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          inputMode="decimal"
          placeholder="Min price"
          className="w-24 bg-transparent text-gray-700 outline-none"
        />
      </label>

      <input
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        inputMode="decimal"
        placeholder="Max price"
        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 lg:w-28"
      />

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  );
}
