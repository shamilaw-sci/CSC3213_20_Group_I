import ProductCard from "./ProductCard";
import type { Product } from "../data/products";

interface ProductGridProps {
  products: Product[];
  selectedCompareIds?: Set<string | number>;
  compareDisabled?: boolean;
  onToggleCompare?: (product: Product) => void;
  favoriteIds: ReadonlySet<string>;
  favoriteStateUnavailable?: boolean;
  onFavoriteChange: (productId: string, nextFavorite: boolean) => Promise<void>;
}

export default function ProductGrid({
  products,
  selectedCompareIds,
  compareDisabled,
  onToggleCompare,
  favoriteIds,
  favoriteStateUnavailable,
  onFavoriteChange,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16">
        No items match your search.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          compareSelected={selectedCompareIds?.has(product.id)}
          compareDisabled={compareDisabled}
          onToggleCompare={onToggleCompare}
          isFavorite={favoriteIds.has(String(product.id))}
          favoriteStateUnavailable={favoriteStateUnavailable}
          onFavoriteChange={onFavoriteChange}
        />
      ))}
    </div>
  );
}
