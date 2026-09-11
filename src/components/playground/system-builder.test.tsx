import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SystemBuilder } from "./system-builder";

describe("student system builder", () => {
  it("explains why an empty system cannot run", () => {
    render(<SystemBuilder />);

    fireEvent.click(screen.getByRole("button", { name: /Blank canvas/ }));
    fireEvent.click(screen.getByRole("button", { name: "Test" }));

    expect(screen.getByRole("heading", { name: "System cannot run yet" })).toBeInTheDocument();
    expect(screen.getByText("Add a Browser first, then build toward a Server and Database.")).toBeInTheDocument();
  });

  it("lets a learner step through and diagnose a login failure", () => {
    render(<SystemBuilder />);

    fireEvent.click(screen.getByRole("button", { name: /Broken checkpoint/ }));
    fireEvent.click(screen.getByRole("button", { name: "Test" }));

    expect(screen.queryByRole("heading", { name: "Credentials did not match" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));

    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Step" }));
    }

    expect(screen.getByText("Test failed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Credentials did not match" })).toBeInTheDocument();
    expect(screen.getAllByText("401").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Data check passes" }));

    expect(screen.queryByRole("heading", { name: "Credentials did not match" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test" })).toBeInTheDocument();
  });

  it("validates the connectors the learner draws", () => {
    render(<SystemBuilder />);

    fireEvent.click(screen.getByRole("button", { name: "Connector from Router to Middleware" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete connector" }));
    fireEvent.click(screen.getByRole("button", { name: "Test" }));

    expect(screen.getByRole("heading", { name: "System cannot run yet" })).toBeInTheDocument();
    expect(screen.getByText("Connect Middleware into the path that starts at the Browser.")).toBeInTheDocument();
  });

  it("opens directly on the building workspace without setup controls", () => {
    render(<SystemBuilder />);

    expect(screen.queryByLabelText("System name")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tutor" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Mission")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Prediction/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test" })).toBeInTheDocument();
  });

  it("lets the learner collapse workspace panels and open the timeline", () => {
    render(<SystemBuilder />);

    const componentsToggle = screen.getByRole("button", { name: "Components" });
    const inspectorToggle = screen.getByRole("button", { name: "Inspector" });
    const timelineToggle = screen.getByRole("button", { name: "Timeline" });

    expect(componentsToggle).toHaveAttribute("aria-expanded", "true");
    expect(inspectorToggle).toHaveAttribute("aria-expanded", "true");
    expect(timelineToggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(componentsToggle);
    fireEvent.click(inspectorToggle);
    fireEvent.click(timelineToggle);

    expect(componentsToggle).toHaveAttribute("aria-expanded", "false");
    expect(inspectorToggle).toHaveAttribute("aria-expanded", "false");
    expect(timelineToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("list", { name: "Request execution timeline" })).toBeInTheDocument();
  });
});
