import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useProfile: vi.fn(),
  useTryOn: vi.fn(),
}));

vi.mock("../../../features/profile/hooks/useProfile", () => ({
  useProfile: mocks.useProfile,
}));
vi.mock("@/features/try-on/hooks/useTryOn", () => ({
  useTryOn: mocks.useTryOn,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import DigitalTwinTab from "../../../features/profile/components/DigitalTwinTab";

function renderTab(image: string | null) {
  mocks.useProfile.mockReturnValue({
    profile: { digitalTwin: { image } },
    uploadImage: vi.fn(),
    removeImage: vi.fn(),
  });
  return renderToStaticMarkup(createElement(DigitalTwinTab));
}

function openingTagForButton(html: string, label: string) {
  const labelIndex = html.indexOf(label);
  expect(labelIndex).toBeGreaterThan(-1);
  const buttonIndex = html.lastIndexOf("<button", labelIndex);
  expect(buttonIndex).toBeGreaterThan(-1);
  return html.slice(buttonIndex, html.indexOf(">", buttonIndex) + 1);
}

describe("Digital Twin outfit and photo layout", () => {
  beforeEach(() => {
    mocks.useTryOn.mockReturnValue({ openTryOn: vi.fn(), state: { resumeAfterTwin: false, selectedProduct: null } });
  });

  it("shows clothing and photo columns, a guidelines control, and the existing upload flow", () => {
    const html = renderTab(null);

    expect(html).toContain("lg:grid-cols-2");
    expect(html).toContain("Choose an outfit in Explore");
    expect(html).toContain("Your Photo");
    expect(html).toContain('aria-label="Photo guidelines"');
    expect(html).toContain("Drag &amp; drop or click to upload");
    expect(html).toContain("At least 400 × 600 pixels");
    expect(openingTagForButton(html, "Generate My Look")).toContain("disabled");
  });

  it("keeps the saved photo preview and replacement control, but requires an outfit", () => {
    const html = renderTab("/saved-twin.jpg");

    expect(html).toContain('alt="Digital twin upload preview"');
    expect(html).toContain("Replace Photo");
    expect(html).toContain("Delete Photo");
    expect(html).not.toContain("Photo uploaded successfully");
    expect(html).not.toContain("Digital Twin photo ready");
    expect(html).not.toContain("View photo preview");
    expect(openingTagForButton(html, "Generate My Look")).toContain("disabled");
  });
});
