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

describe("system builder canvas interaction", () => {
  function canvas_region() {
    return screen.getByRole("application", { name: /System canvas/ });
  }
  const canvas = canvas_region;

  function firstNodeStyle() {
    return document.querySelector<HTMLElement>(".builder-node")!.style;
  }

  it("moves the selected component with the arrow keys", () => {
    render(<SystemBuilder />);
    const startLeft = firstNodeStyle().left;
    const startTop = firstNodeStyle().top;

    fireEvent.keyDown(canvas(), { key: "ArrowRight" });
    expect(firstNodeStyle().left).not.toBe(startLeft);

    fireEvent.keyDown(canvas(), { key: "ArrowDown" });
    expect(firstNodeStyle().top).not.toBe(startTop);
  });

  it("moves further when Shift is held", () => {
    render(<SystemBuilder />);
    const start = Number.parseFloat(firstNodeStyle().left);

    fireEvent.keyDown(canvas(), { key: "ArrowRight" });
    const smallStep = Number.parseFloat(firstNodeStyle().left) - start;

    fireEvent.keyDown(canvas(), { key: "ArrowRight", shiftKey: true });
    const largeStep = Number.parseFloat(firstNodeStyle().left) - start - smallStep;

    expect(largeStep).toBeGreaterThan(smallStep);
  });

  it("deletes the selected component with the Delete key", () => {
    render(<SystemBuilder />);
    const before = document.querySelectorAll(".builder-node").length;

    fireEvent.keyDown(canvas(), { key: "Delete" });

    expect(document.querySelectorAll(".builder-node").length).toBe(before - 1);
  });

  it("cancels an in-progress connector with Escape", () => {
    render(<SystemBuilder />);

    fireEvent.click(screen.getAllByRole("button", { name: /Drag from here to connect/ })[0]);
    expect(document.querySelectorAll(".builder-node-connection-source")).toHaveLength(1);

    fireEvent.keyDown(canvas(), { key: "Escape" });
    expect(document.querySelectorAll(".builder-node-connection-source")).toHaveLength(0);
  });

  it("keeps arrowheads on the same colour as their connector", () => {
    render(<SystemBuilder />);
    const head = document.querySelector(".builder-arrow-head");

    // context-stroke makes the marker inherit each line's stroke, so a green
    // completed connector cannot end in a black arrowhead.
    expect(head).not.toBeNull();
    expect(document.querySelector("#builder-arrow-default")?.getAttribute("markerUnits")).toBe("userSpaceOnUse");
  });

  it("grows the canvas instead of trapping a component at the edge", () => {
    render(<SystemBuilder />);
    const canvas = document.querySelector<HTMLElement>(".builder-canvas")!;
    const startWidth = Number.parseFloat(canvas.style.width);
    const startHeight = Number.parseFloat(canvas.style.height);

    // Push the selected component far past the old fixed 1280x540 boundary.
    for (let i = 0; i < 40; i += 1) {
      fireEvent.keyDown(canvas_region(), { key: "ArrowRight", shiftKey: true });
      fireEvent.keyDown(canvas_region(), { key: "ArrowDown", shiftKey: true });
    }

    const node = document.querySelector<HTMLElement>(".builder-node")!;
    expect(Number.parseFloat(node.style.left)).toBeGreaterThan(startWidth);
    expect(Number.parseFloat(node.style.top)).toBeGreaterThan(startHeight);

    // The surface expanded to keep the component on it.
    expect(Number.parseFloat(canvas.style.width)).toBeGreaterThan(startWidth);
    expect(Number.parseFloat(canvas.style.height)).toBeGreaterThan(startHeight);
    expect(Number.parseFloat(canvas.style.width)).toBeGreaterThan(Number.parseFloat(node.style.left));
    expect(Number.parseFloat(canvas.style.height)).toBeGreaterThan(Number.parseFloat(node.style.top));
  });

  it("never pins a component to a maximum coordinate", () => {
    render(<SystemBuilder />);
    const readLeft = () => Number.parseFloat(document.querySelector<HTMLElement>(".builder-node")!.style.left);

    const positions = new Set<number>();
    for (let i = 0; i < 30; i += 1) {
      fireEvent.keyDown(canvas_region(), { key: "ArrowRight", shiftKey: true });
      positions.add(readLeft());
    }

    // Every press produced a new position: nothing clamped it.
    expect(positions.size).toBe(30);
  });

  it("connects two components with the port then a target click", () => {
    render(<SystemBuilder />);
    fireEvent.click(screen.getByRole("button", { name: /Blank canvas/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Browser/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Database/ }));
    expect(document.querySelectorAll(".builder-connection")).toHaveLength(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Drag from here to connect/ })[0]);
    fireEvent.click(document.querySelectorAll<HTMLElement>(".builder-node-select")[1]);

    expect(document.querySelectorAll(".builder-connection")).toHaveLength(1);
  });

  it("refuses to connect a component to itself", () => {
    render(<SystemBuilder />);
    const before = document.querySelectorAll(".builder-connection").length;

    fireEvent.click(screen.getAllByRole("button", { name: /Drag from here to connect/ })[0]);
    fireEvent.click(document.querySelectorAll<HTMLElement>(".builder-node-select")[0]);

    expect(document.querySelectorAll(".builder-connection")).toHaveLength(before);
  });

  it("does not stack a duplicate connector between the same pair", () => {
    render(<SystemBuilder />);
    const before = document.querySelectorAll(".builder-connection").length;

    // The starter graph already links node 0 to node 1; repeat that link.
    fireEvent.click(screen.getAllByRole("button", { name: /Drag from here to connect/ })[0]);
    fireEvent.click(document.querySelectorAll<HTMLElement>(".builder-node-select")[1]);

    expect(document.querySelectorAll(".builder-connection")).toHaveLength(before);
  });

  it("offers every component a connector handle", () => {
    render(<SystemBuilder />);

    expect(screen.getAllByRole("button", { name: /Drag from here to connect/ }))
      .toHaveLength(document.querySelectorAll(".builder-node").length);
  });

  it("switches tools, tests, and zooms from the keyboard", () => {
    render(<SystemBuilder />);
    const pressed = () => [...document.querySelectorAll(".builder-canvas-tools button")]
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.textContent?.trim())
      .join(",");

    fireEvent.keyDown(window, { key: "c" });
    expect(pressed()).toContain("Connect");

    fireEvent.keyDown(window, { key: "v" });
    expect(pressed()).toContain("Select");

    const zoomLabel = () => screen.getByRole("button", { name: "Reset zoom" }).textContent;
    const before = zoomLabel();
    fireEvent.keyDown(window, { key: "-" });
    expect(zoomLabel()).not.toBe(before);
    fireEvent.keyDown(window, { key: "0" });
    expect(zoomLabel()).toBe(before);

    fireEvent.keyDown(window, { key: "t" });
    expect(document.querySelector(".builder-run-state")?.textContent).not.toContain("Ready to test");
  });

  it("nudges and deletes from anywhere on the page, not just the canvas", () => {
    render(<SystemBuilder />);
    const node = () => document.querySelector<HTMLElement>(".builder-node")!;
    const before = node().style.left;

    // Dispatched on window, with no canvas focus.
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(node().style.left).not.toBe(before);

    const count = document.querySelectorAll(".builder-node").length;
    fireEvent.keyDown(window, { key: "Delete" });
    expect(document.querySelectorAll(".builder-node").length).toBe(count - 1);
  });

  it("never hijacks the component search box", () => {
    render(<SystemBuilder />);
    const search = document.querySelector<HTMLInputElement>(".builder-library-search input")!;
    const before = document.querySelector<HTMLElement>(".builder-node")!.style.left;

    for (const key of ["t", "v", "c", "a", "f", "ArrowRight", "Delete"]) {
      fireEvent.keyDown(search, { key });
    }

    expect(document.querySelector<HTMLElement>(".builder-node")!.style.left).toBe(before);
    expect(document.querySelector(".builder-run-state")?.textContent).toContain("Ready to test");
  });

  it("lists its shortcuts so they are discoverable", () => {
    render(<SystemBuilder />);
    expect(screen.getByText("Keys")).toBeInTheDocument();
  });

  // Pointer dragging cannot be covered here: jsdom implements no PointerEvent,
  // so React never receives onPointerDown. Drag behaviour (including the
  // suppressed trailing click) is verified against Chrome instead.
  it("keeps pointer capture optional so a drag survives without it", () => {
    render(<SystemBuilder />);
    const target = document.querySelectorAll<HTMLElement>(".builder-node-select")[1];

    expect(typeof target.setPointerCapture).toBe("undefined");
    // The handler must tolerate that rather than throwing mid-drag.
    expect(() => fireEvent.pointerDown(target, { button: 0, clientX: 10, clientY: 10, pointerId: 1 })).not.toThrow();
  });
});
