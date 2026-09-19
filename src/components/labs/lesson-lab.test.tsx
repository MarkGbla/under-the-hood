import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonLab } from "./lesson-lab";
import { lessons } from "@/content/lessons";
import type { LessonSlug } from "@/types/lesson";

function renderLab(slug: LessonSlug) {
  const lesson = lessons.find((item) => item.slug === slug)!;
  render(<LessonLab lesson={lesson} onInteraction={vi.fn()} />);
  return within(screen.getByRole("region", { name: lesson.title }));
}

function advance(count = 20) {
  for (let step = 0; step < count; step += 1) {
    const forward = screen.getByRole("button", { name: "Step forward" });
    if (forward.hasAttribute("disabled")) break;
    fireEvent.click(forward);
  }
}

describe("lesson lab interactions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });
  afterEach(() => vi.useRealTimers());

  it.each(['{"name":', '{"username":"Aminata"}', '{"name":null}', '{"name":"   "}', '[{"name":"Aminata"}]'])("rejects unusable POST input %s", (body) => {
    renderLab("http");
    fireEvent.click(screen.getByRole("button", { name: "Create a user" }));
    fireEvent.change(screen.getByLabelText("Body"), { target: { value: body } });
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));
    expect(screen.getByRole("status")).toHaveTextContent("400");
    expect(screen.queryByText("201")).not.toBeInTheDocument();
  });

  it("keeps submitted HTTP data consistent in the composer and animated inspectors", () => {
    const canvas = renderLab("http");
    fireEvent.click(screen.getByRole("button", { name: "Create a user" }));
    fireEvent.change(screen.getByLabelText("Body"), { target: { value: '{"name":"Aminata"}' } });
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));
    fireEvent.click(canvas.getByRole("button", { name: "Inspect details" }));
    expect(canvas.getByRole("region", { name: "HTTP request inspector" })).toHaveTextContent("POST /api/users");
    expect(canvas.getByRole("region", { name: "HTTP request inspector" })).toHaveTextContent("Aminata");
    fireEvent.change(screen.getByLabelText("Body"), { target: { value: '{"name":"Next request"}' } });
    fireEvent.click(screen.getByRole("button", { name: "See more detail" }));
    expect(screen.getByRole("region", { name: "HTTP response inspector" })).toHaveTextContent("Aminata");
    expect(screen.getByRole("region", { name: "HTTP response inspector" })).not.toHaveTextContent("Next request");
    advance();
    expect(canvas.getByText("201")).toBeInTheDocument();
  });

  it("replays a failed HTTP request on restart and repairs the request before a successful retry", () => {
    const canvas = renderLab("http");
    fireEvent.keyDown(window, { key: "f" });
    expect(screen.getByLabelText("Body")).toHaveValue("{}");
    advance();
    expect(canvas.getByText("400")).toBeInTheDocument();
    fireEvent.click(canvas.getByRole("button", { name: "Restart" }));
    advance();
    expect(canvas.getByText("400")).toBeInTheDocument();
    fireEvent.click(canvas.getByRole("button", { name: "Run the working version" }));
    expect((screen.getByLabelText("Body") as HTMLTextAreaElement).value).toContain("Ibrahim");
    advance();
    expect(canvas.getByText("201")).toBeInTheDocument();
    expect(canvas.queryByText("400")).not.toBeInTheDocument();
  });

  it("shows the selected CRUD operation and response, then repairs an invalid create", () => {
    const canvas = renderLab("crud");
    fireEvent.click(screen.getByRole("button", { name: /Read GET/ }));
    fireEvent.click(canvas.getByRole("button", { name: "Inspect details" }));
    expect(canvas.getByRole("region", { name: "HTTP request inspector" })).toHaveTextContent("GET /api/users/1");
    advance(4);
    fireEvent.click(canvas.getByRole("button", { name: "Inspect details" }));
    expect(canvas.getByRole("region", { name: "HTTP response inspector" })).toHaveTextContent("200 OK");
    expect(canvas.getByRole("region", { name: "HTTP response inspector" })).toHaveTextContent("Mariama");
    fireEvent.keyDown(window, { key: "f" });
    advance();
    expect(canvas.getByText("400")).toBeInTheDocument();
    fireEvent.click(canvas.getByRole("button", { name: "Run the working version" }));
    advance();
    expect(canvas.getByText("201")).toBeInTheDocument();
  });

  it("uses the selected protected endpoint and explains successful authorization", () => {
    const canvas = renderLab("auth");
    fireEvent.click(screen.getByRole("button", { name: /Manage all users/ }));
    fireEvent.click(screen.getByRole("button", { name: "Check access" }));
    fireEvent.click(canvas.getByRole("button", { name: "Inspect details" }));
    expect(canvas.getByRole("region", { name: "HTTP request inspector" })).toHaveTextContent("DELETE /admin/users");
    advance();
    expect(canvas.getByText("403")).toBeInTheDocument();
    fireEvent.click(canvas.getByRole("button", { name: "Run the working version" }));
    expect(screen.getByRole("status")).toHaveTextContent("Access granted");
    expect(screen.getByRole("button", { name: /Aminata/ })).toHaveAttribute("aria-pressed", "true");
    advance();
    expect(canvas.getByText("200")).toBeInTheDocument();
  });

  it("describes disabled middleware as skipped and repairs a missing token", () => {
    const canvas = renderLab("middleware");
    fireEvent.click(screen.getByRole("checkbox", { name: /Authentication/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Carries an identity token" }));
    fireEvent.click(screen.getByRole("button", { name: "Send protected request" }));
    advance(2);
    expect(canvas.getAllByText("Authentication skipped").length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { key: "f" });
    advance();
    expect(canvas.getByText("401")).toBeInTheDocument();
    fireEvent.click(canvas.getByRole("button", { name: "Run the working version" }));
    expect(screen.getByRole("checkbox", { name: "Carries an identity token" })).toBeChecked();
    advance();
    expect(canvas.getByText("200")).toBeInTheDocument();
  });

  it("reports production live only after the pipeline completes and clears it on restart", () => {
    const canvas = renderLab("deployment");
    fireEvent.click(screen.getByRole("button", { name: /Release a version that passes tests/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Release in progress");
    expect(screen.queryByText("LIVE in production")).not.toBeInTheDocument();
    advance();
    expect(screen.getByRole("status")).toHaveTextContent("LIVE in production");
    fireEvent.click(canvas.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("status")).toHaveTextContent("Not released");
    fireEvent.click(screen.getByRole("button", { name: /Release a version that fails tests/ }));
    advance();
    expect(screen.getByRole("status")).toHaveTextContent("Release blocked");
  });

  it("supports keyboard environment tabs without advancing the simulation", () => {
    const canvas = renderLab("deployment");
    const local = screen.getByRole("tab", { name: "Local" });
    fireEvent.keyDown(local, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Staging" })).toHaveFocus();
    expect(screen.getByRole("tabpanel", { name: "Staging" })).toHaveTextContent("Rehearsal before release");
    expect(canvas.getByText(/Ready · Step 1 of/)).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Staging" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "Production" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Production" }), { key: "Home" });
    expect(local).toHaveFocus();
  });
});
