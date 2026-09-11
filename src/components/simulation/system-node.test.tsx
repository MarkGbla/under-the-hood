import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SystemNode } from "./system-node";

describe("SystemNode", () => {
  it("renders a semantic label and detail", () => {
    render(<SystemNode kind="server" label="Server" detail="Backend API" />);

    expect(screen.getByText("Server")).toBeInTheDocument();
    expect(screen.getByText("Backend API")).toBeInTheDocument();
  });

  it("communicates a non-default state with text as well as styling", () => {
    render(<SystemNode kind="middleware" label="Authentication" state="error" />);

    expect(screen.getByText("Stopped")).toBeInTheDocument();
  });
});
