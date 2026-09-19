import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";
import { getProgress } from "@/lib/storage";

const lesson = getLesson("request-lifecycle")!;

function status() {
  return document.querySelector(".workbench-status")?.textContent ?? "";
}

describe("simulation keyboard shortcuts", () => {
  beforeEach(() => window.localStorage.clear());

  it("plays and pauses with Space outside presentation mode", () => {
    render(<LessonShell lesson={lesson} />);
    expect(status()).toContain("Ready");

    fireEvent.keyDown(window, { key: " " });
    expect(status()).toContain("Playing");

    fireEvent.keyDown(window, { key: " " });
    expect(status()).toContain("Paused");
  });

  it("steps with the arrow keys and restarts with R", () => {
    render(<LessonShell lesson={lesson} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(status()).toContain("Step 2");
    expect(getProgress().lessons["request-lifecycle"]?.meaningfulInteraction).toBe(true);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(status()).toContain("Step 1");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "r" });
    expect(status()).toContain("Step 1");
    expect(status()).toContain("Ready");
  });

  it("ignores shortcuts while the learner is typing", () => {
    render(<LessonShell lesson={getLesson("http")!} />);
    const endpoint = document.querySelector<HTMLInputElement>(".composer-endpoint input")!;
    const before = status();

    fireEvent.keyDown(endpoint, { key: " " });
    fireEvent.keyDown(endpoint, { key: "r" });
    fireEvent.keyDown(endpoint, { key: "ArrowRight" });

    expect(status()).toBe(before);
  });

  it("leaves Space to a focused button so it still activates", () => {
    render(<LessonShell lesson={lesson} />);
    const restart = screen.getByRole("button", { name: "Restart" });
    const before = status();

    fireEvent.keyDown(restart, { key: " " });

    // Playback did not toggle; the browser's own button activation is untouched.
    expect(status()).toBe(before);
  });

  it("ignores shortcuts combined with a modifier", () => {
    render(<LessonShell lesson={lesson} />);
    const before = status();

    fireEvent.keyDown(window, { key: " ", metaKey: true });
    fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true });

    expect(status()).toBe(before);
  });

  it("leaves keyboard events to an open modal or walkthrough", () => {
    render(<LessonShell lesson={lesson} />);
    const before = status();
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    dialog.showModal();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: " " });
    expect(status()).toBe(before);
    dialog.remove();

    document.body.classList.add("driver-active");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(status()).toBe(before);
    document.body.classList.remove("driver-active");
  });
});
