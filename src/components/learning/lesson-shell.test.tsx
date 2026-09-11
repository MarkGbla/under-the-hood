import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LessonShell } from "./lesson-shell";
import { getLesson, lessons } from "@/content/lessons";
import { getProgress } from "@/lib/storage";

const lesson = getLesson("request-lifecycle")!;

describe("lesson shell", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows the lab directly, with no stepper or learning scaffolding", () => {
    render(<LessonShell lesson={lesson} />);

    // The simulation is the page.
    expect(screen.getByRole("button", { name: "Play simulation" })).toBeInTheDocument();

    for (const name of ["Lesson stages", "Lesson completion", "Answer order"]) {
      expect(screen.queryByRole("list", { name })).toBeNull();
    }
    for (const name of ["Next", "Back", "Check answer", "Show a hint", "Yes", "Not yet", "I think so"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
    expect(screen.queryByText(/Could you explain this/)).toBeNull();
    expect(screen.queryByText(/Compare with the model answer/)).toBeNull();
  });

  it("records completion once the learner drives the simulation", () => {
    render(<LessonShell lesson={lesson} />);
    expect(getProgress().lessons["request-lifecycle"]).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: "Play simulation" }));

    expect(getProgress().lessons["request-lifecycle"]).toMatchObject({
      meaningfulInteraction: true,
      completed: true,
    });
    expect(getProgress().completedLessons).toContain("request-lifecycle");
  });

  it("keeps one lesson's progress out of another's", () => {
    const { unmount } = render(<LessonShell lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: "Play simulation" }));
    unmount();

    render(<LessonShell lesson={getLesson("http")!} />);
    expect(getProgress().lessons["http"]?.meaningfulInteraction).toBeFalsy();
    expect(getProgress().lessons["request-lifecycle"]?.meaningfulInteraction).toBe(true);
  });

  it("renders every lesson without scaffolding", () => {
    for (const item of lessons) {
      const { unmount } = render(<LessonShell lesson={item} />);
      expect(screen.getByRole("heading", { level: 1, name: item.title })).toBeInTheDocument();
      expect(screen.queryByRole("list", { name: "Lesson stages" })).toBeNull();
      unmount();
    }
  });
});
