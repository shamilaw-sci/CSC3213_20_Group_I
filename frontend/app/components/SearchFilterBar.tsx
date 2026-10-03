"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface SearchFilterBarProps {
  value: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  merchant: string;
  size: string;
  color: string;
  inStock: boolean;
  merchants: { id: string; name: string; productCount: number }[];
  onChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onMerchantChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onClear: () => void;
}

export default function SearchFilterBar({
  value,
  minPrice,
  maxPrice,
  sort,
  merchant,
  size,
  color,
  inStock,
  merchants,
  onChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onMerchantChange,
  onSizeChange,
  onColorChange,
  onInStockChange,
  onClear,
}: SearchFilterBarProps) {
  const hasFilters = Boolean(value || minPrice || maxPrice || merchant || size || color || inStock || sort !== "newest");

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
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
        <option value="name_asc">Name: A to Z</option>
      </select>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <select
          value={merchant}
          onChange={(e) => onMerchantChange(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All stores</option>
          {merchants.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.productCount})
            </option>
          ))}
        </select>

        <select
          value={size}
          onChange={(e) => onSizeChange(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Any size</option>
          {["XS", "S", "M", "L", "XL", "XXL"].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          placeholder="Color"
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 md:w-28"
        />

        <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => onInStockChange(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          In stock
        </label>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
