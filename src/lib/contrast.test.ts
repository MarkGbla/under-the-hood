import { describe, expect, it } from "vitest";
import { getContrastRatio } from "./contrast";

describe("design-system contrast", () => {
  const textPairs = [
    ["#102d2e", "#f7f6f1"],
    ["#486162", "#f7f6f1"],
    ["#ffffff", "#102d2e"],
    ["#b74428", "#f7f6f1"],
    ["#168060", "#ffffff"],
    ["#c44836", "#ffffff"],
  ] as const;

  it.each(textPairs)("keeps %s on %s at WCAG AA contrast", (foreground, background) => {
    expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects invalid tokens instead of silently producing a result", () => {
    expect(() => getContrastRatio("coral", "#ffffff")).toThrow("Invalid hexadecimal color");
  });
});
