import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

import CustomerSidebar from "../../../app/dashboard/CustomerSidebar";

describe("customer dashboard sidebar", () => {
  it("groups real destinations and labels missing features unavailable", () => {
    const html = renderToStaticMarkup(<CustomerSidebar />);

    expect(html).toContain("Main menu");
    expect(html).toContain("Account &amp; support");
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('href="/profile?tab=digitalTwin"');
    expect(html).toContain('href="/profile?tab=measurements"');
    expect(html).toContain('href="/favorites"');
    expect(html).toContain('href="/recommendations"');
    expect(html).toContain('href="/profile?tab=account"');
    expect(html).toContain("Virtual Try-On History");
    expect(html).toContain("Help &amp; FAQ");
    expect(html).toContain("My Plan");
    expect(html).toContain("Support");
    expect(html).toContain("Unavailable");
    expect(html).not.toContain('href="/profile/try-on-history"');
    expect(html).not.toContain('href="/pricing"');
  });

  it("provides desktop collapse and mobile drawer controls", () => {
    const html = renderToStaticMarkup(<CustomerSidebar />);

    expect(html).toContain('aria-label="Collapse dashboard sidebar"');
    expect(html).toContain('aria-label="Open dashboard menu"');
    expect(html).toContain('aria-controls="customer-mobile-sidebar"');
    expect(html).toContain("Log out");
  });
});
