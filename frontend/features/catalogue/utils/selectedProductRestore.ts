const STORAGE_KEY = "tryvora-selected-product";

type SelectedProduct = {
  productId: string;
  path: string;
};

export function saveSelectedProduct(productId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ productId, path: `/products/${productId}` }));
}

export function loadSelectedProduct() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SelectedProduct>;
    if (!parsed.productId || !parsed.path?.startsWith("/products/")) return null;
    return { productId: parsed.productId, path: parsed.path };
  } catch {
    return null;
  }
}

export function clearSelectedProduct() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
