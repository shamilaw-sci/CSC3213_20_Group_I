import type { CartItem } from "@/features/cart/types/cart";

const STORAGE_KEY = "tryvora-guest-cart";

export function saveGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadGuestCart() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => (
      item &&
      typeof item.title === "string" &&
      typeof item.store === "string" &&
      typeof item.category === "string" &&
      typeof item.image === "string" &&
      typeof item.price === "number" &&
      typeof item.quantity === "number"
    ));
  } catch {
    return [];
  }
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
