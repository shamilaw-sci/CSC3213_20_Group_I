import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  loadCustomerOverview: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`redirect:${destination}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/app/components/Navbar", () => ({ default: () => null }));
vi.mock("@/app/dashboard/CustomerSidebar", () => ({ default: () => null }));
vi.mock("@/server/auth/session", () => ({ getCurrentSession: mocks.getCurrentSession }));
vi.mock("@/server/dashboard/load-customer-overview", () => ({
  loadCustomerOverview: mocks.loadCustomerOverview,
}));

import CustomerDashboardPage from "../../../app/dashboard/page";

describe("customer dashboard access", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects signed-out visitors to login before loading customer data", async () => {
    mocks.getCurrentSession.mockResolvedValue(null);

    await expect(CustomerDashboardPage()).rejects.toThrow("redirect:/login");
    expect(mocks.loadCustomerOverview).not.toHaveBeenCalled();
  });

  it.each([
    ["ADMIN", "/admin"],
    ["MERCHANT", "/merchant"],
  ])("redirects %s users to their own area", async (role, destination) => {
    mocks.getCurrentSession.mockResolvedValue({ user: { id: "user-1", name: "User", role } });

    await expect(CustomerDashboardPage()).rejects.toThrow(`redirect:${destination}`);
    expect(mocks.loadCustomerOverview).not.toHaveBeenCalled();
  });

  it("loads only the authenticated customer's overview", async () => {
    mocks.getCurrentSession.mockResolvedValue({ user: { id: "customer-1", name: "Customer", role: "CUSTOMER" } });
    mocks.loadCustomerOverview.mockResolvedValue({
      hasProfile: false,
      savedMeasurementCount: 0,
      digitalTwinCreatedAt: null,
      favoritesCount: 0,
      recentTryOns: [],
    });

    await expect(CustomerDashboardPage()).resolves.toBeTruthy();
    expect(mocks.loadCustomerOverview).toHaveBeenCalledExactlyOnceWith("customer-1");
  });
});
