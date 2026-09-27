import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSelectedProduct,
  loadSelectedProduct,
  saveSelectedProduct,
} from "../../../features/catalogue/utils/selectedProductRestore";

describe("selected product restore", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
        clear: () => store.clear(),
      },
    });
  });

  it("stores and clears the selected product path", () => {
    saveSelectedProduct("product-123");

    expect(loadSelectedProduct()).toEqual({
      productId: "product-123",
      path: "/products/product-123",
    });

    clearSelectedProduct();
    expect(loadSelectedProduct()).toBeNull();
  });

  it("ignores malformed stored values", () => {
    window.localStorage.setItem("tryvora-selected-product", "{\"path\":\"https://evil.example\"}");

    expect(loadSelectedProduct()).toBeNull();
  });
});
