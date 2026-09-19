import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGuidedTour } from "./use-guided-tour";
import { driver } from "driver.js";

vi.mock("driver.js", () => ({
  driver: vi.fn(),
}));

describe("guided tour fallback", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(driver).mockReset();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("keeps exploration available when Driver.js cannot initialize", async () => {
    vi.mocked(driver).mockImplementation(() => { throw new Error("Driver unavailable"); });
    const { result } = renderHook(() => useGuidedTour());

    await act(async () => result.current.startGuide());
    await waitFor(() => expect(result.current.guideError).toContain("simulator is still fully available"));
    expect(result.current.showChoice).toBe(false);
  });

  it("does not start a late-loaded walkthrough after navigation", async () => {
    const { result, unmount } = renderHook(() => useGuidedTour());
    await act(async () => {
      const pending = result.current.startGuide();
      unmount();
      await pending;
    });
    expect(driver).not.toHaveBeenCalled();
  });

  it("creates only one guide for repeated clicks and destroys it on unmount", async () => {
    const guide = { drive: vi.fn(), destroy: vi.fn(), isActive: () => true };
    vi.mocked(driver).mockReturnValue(guide as unknown as ReturnType<typeof driver>);
    const { result, unmount } = renderHook(() => useGuidedTour());
    await act(async () => {
      await Promise.all([result.current.startGuide(), result.current.startGuide()]);
    });
    await act(async () => result.current.startGuide());
    expect(driver).toHaveBeenCalledTimes(1);
    expect(guide.drive).toHaveBeenCalledTimes(1);
    unmount();
    expect(guide.destroy).toHaveBeenCalledTimes(1);
  });
});
