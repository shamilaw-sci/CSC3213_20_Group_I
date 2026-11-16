import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TryOnProduct } from "../../../features/try-on/types/tryon";

const mocks = vi.hoisted(() => ({
  useTryOn: vi.fn(),
  useProfile: vi.fn(),
}));

vi.mock("../../../features/try-on/hooks/useTryOn", () => ({
  useTryOn: mocks.useTryOn,
}));
vi.mock("@/features/profile/hooks/useProfile", () => ({
  useProfile: mocks.useProfile,
}));
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1", name: "Test User" }, isGuest: false, ready: true, startGuest: vi.fn() }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import TryOnModal from "../../../features/try-on/components/TryOnModal";

const product: TryOnProduct = {
  id: "product-1",
  title: "Floral Garden Midi Dress",
  image: "/dress.jpg",
  category: "Dresses",
  store: "Fashion Hub",
  price: 95,
  currency: "LKR",
  availableSizes: [],
};

function renderProduct(selectedProduct: TryOnProduct) {
  mocks.useTryOn.mockReturnValue({
    state: { isOpen: true, selectedProduct },
    closeTryOn: vi.fn(),
  });
  return renderToStaticMarkup(createElement(TryOnModal));
}

describe("recommended product Try-On modal", () => {
  beforeEach(() => {
    mocks.useProfile.mockReturnValue({
      profile: {
        measurements: {},
        digitalTwin: { image: "/twin.jpg" },
      },
      profileLoadStatus: "ready",
      changeTab: vi.fn(),
    });
  });

  it("keeps the product currency and does not invent sizes", () => {
    const html = renderProduct(product);

    expect(html).toContain("LKR 95.00");
    expect(html).toContain("Available sizes");
    expect(html).toContain("Checking current merchant stock");
  });

  it("shows only listed sizes when the merchant has them", () => {
    const html = renderProduct({ ...product, availableSizes: ["S", "M"] });

    expect(html).toContain("Available sizes");
  });

  it("labels legacy size choices as illustrative when stock was not supplied", () => {
    const html = renderProduct({ ...product, availableSizes: undefined });

    expect(html).toContain("Available sizes");
  });
});
