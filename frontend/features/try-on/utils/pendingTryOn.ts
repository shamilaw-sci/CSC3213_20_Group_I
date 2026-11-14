import type { TryOnProduct } from "../types/tryon";

const STORAGE_KEY = "tryvora-pending-try-on";

export function savePendingTryOn(product: TryOnProduct, size: string | null) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ product, size }));
}

export function takePendingTryOn(): { product: TryOnProduct; size: string | null } | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as { product?: Partial<TryOnProduct>; size?: unknown };
    const product = value.product;
    if (
      !product ||
      (typeof product.id !== "string" && typeof product.id !== "number") ||
      typeof product.title !== "string" ||
      typeof product.image !== "string" ||
      typeof product.category !== "string" ||
      typeof product.store !== "string" ||
      typeof product.price !== "number"
    ) return null;
    return { product: product as TryOnProduct, size: typeof value.size === "string" ? value.size : null };
  } catch {
    return null;
  }
}
