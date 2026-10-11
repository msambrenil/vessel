import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { BrutalistModal } from "@/components/ui/BrutalistModal";

describe("Modal & Fullscreen Z-Index Hierarchy", () => {
  it("BrutalistModal renders with z-[70] to supersede both sticky header (z-50) and fullscreen views (z-[60])", () => {
    const { container } = render(
      <BrutalistModal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </BrutalistModal>
    );

    const backdrop = container.querySelector('[role="dialog"]');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.className).toContain("z-[70]");
  });
});
