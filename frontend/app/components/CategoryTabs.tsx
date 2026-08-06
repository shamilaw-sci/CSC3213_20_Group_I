"use client";

// Local Category type to avoid relying on external module during build
type Category = "Dresses" | "Tops" | "Bottoms" | "Accessories";

const categories: ("All" | Category)[] = ["All", "Dresses", "Tops", "Bottoms", "Accessories"];

interface CategoryTabsProps {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            active === cat
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
