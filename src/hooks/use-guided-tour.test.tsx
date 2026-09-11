import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGuidedTour } from "./use-guided-tour";

vi.mock("driver.js", () => ({
  driver: () => {
    throw new Error("Driver unavailable");
  },
}));

describe("guided tour fallback", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps exploration available when Driver.js cannot initialize", async () => {
    const { result } = renderHook(() => useGuidedTour());

    await act(async () => result.current.startGuide());
    await waitFor(() => expect(result.current.guideError).toContain("simulator is still fully available"));
    expect(result.current.showChoice).toBe(false);
  });
});
