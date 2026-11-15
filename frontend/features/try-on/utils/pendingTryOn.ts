import type { TryOnProduct } from "../types/tryon";

const STORAGE_KEY = "tryvora-pending-try-on";

type PendingTryOn = { product: TryOnProduct; size: string | null; returnTo: string };

export function savePendingTryOn(product: TryOnProduct, size: string | null, returnTo: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ product, size, returnTo }));
}

function readPendingTryOn(): PendingTryOn | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as { product?: Partial<TryOnProduct>; size?: unknown; returnTo?: unknown };
    const product = value.product;
    if (
      !product ||
      (typeof product.id !== "string" && typeof product.id !== "number") ||
      typeof product.title !== "string" ||
      typeof product.image !== "string" ||
      typeof product.category !== "string" ||
      typeof product.store !== "string" ||
      typeof product.price !== "number"
    ) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (typeof value.returnTo !== "string" || !value.returnTo.startsWith("/") || value.returnTo.startsWith("//")) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      product: product as TryOnProduct,
      size: typeof value.size === "string" ? value.size : null,
      returnTo: value.returnTo,
    };
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function peekPendingTryOn() {
  return readPendingTryOn();
}

export function takePendingTryOn(currentPath: string): { product: TryOnProduct; size: string | null } | null {
  const pending = readPendingTryOn();
  if (!pending || pending.returnTo !== currentPath) return null;
  window.sessionStorage.removeItem(STORAGE_KEY);
  return { product: pending.product, size: pending.size };
}
