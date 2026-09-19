import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { GuidedTour } from "./guided-tour";
import { getTourStatus } from "@/lib/storage";

describe("guided tour choice", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens a native modal, focuses its action, and dismisses with Escape", () => {
    render(<GuidedTour />);
    const dialog = screen.getByRole("dialog", { name: "Want a guided first look?" });
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Guide me" })).toHaveFocus();

    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replay guided walkthrough" })).toHaveFocus();
    expect(getTourStatus("login")).toBe("skipped");
  });
});
