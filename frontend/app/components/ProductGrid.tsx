import ProductCard from "./ProductCard";
import { Product } from "../data/products";

interface ProductGridProps {
  products: Product[];
  selectedCompareIds?: Set<string | number>;
  compareDisabled?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  selectedCompareIds,
  compareDisabled,
  onToggleCompare,
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
        />
      ))}
    </div>
  );
}
