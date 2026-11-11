import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/auth/context/AuthContext", () => ({ useAuth: mocks.useAuth }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/features/cart/components/CartButton", () => ({ default: () => <button type="button">Cart</button> }));

import Navbar from "../../../app/components/Navbar";

function setSession(role?: "CUSTOMER" | "MERCHANT" | "ADMIN") {
  mocks.useAuth.mockReturnValue({
    ready: true,
    user: role ? { id: "user-1", name: "Test User", role } : null,
    logout: vi.fn(),
  });
}

describe("customer navigation", () => {
  beforeEach(() => vi.resetAllMocks());

  it("shows public links and the existing merchant page for guests", () => {
    setSession();
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain('href="/explore"');
    expect(html).toContain('href="/#how-it-works"');
    expect(html).toContain('href="/merchant"');
    expect(html).toContain("Login as Merchant");
    expect(html).toContain("Cart");
    expect(html).not.toContain('href="/dashboard"');
  });

  it("shows the customer dashboard and account menu", () => {
    setSession("CUSTOMER");
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Account menu");
    expect(html).toContain('href="/merchant"');
    expect(html).toContain("Login as Merchant");
    expect(html).not.toContain('href="/pricing"');
  });

  it("keeps merchants out of the customer dashboard navigation", () => {
    setSession("MERCHANT");
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain('href="/merchant"');
    expect(html).not.toContain('href="/dashboard"');
    expect(html).not.toContain("Login as Merchant");
  });

  it("keeps admins on the existing admin route", () => {
    setSession("ADMIN");
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain('href="/admin"');
    expect(html).not.toContain('href="/dashboard"');
  });
});
