"use client";

export type CatalogueCategory = {
  name: string;
  slug: string;
};

interface CategoryTabsProps {
  active: string;
  categories: CatalogueCategory[];
  onChange: (category: string) => void;
}

export default function CategoryTabs({ active, categories, onChange }: CategoryTabsProps) {
  const tabs = [{ name: "All", slug: "all" }, ...categories];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onChange(cat.slug)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            active === cat.slug
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
