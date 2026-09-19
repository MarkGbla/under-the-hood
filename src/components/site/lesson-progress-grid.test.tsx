import { act, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { lessons } from "@/content/lessons";
import { saveLastVisited, updateLessonProgress } from "@/lib/storage";
import { LessonProgressGrid } from "./lesson-progress-grid";

describe("learning discovery", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers a first lesson and no invented progress for a new learner", () => {
    render(<LessonProgressGrid lessons={lessons} />);

    expect(screen.getByRole("link", { name: "Start exploring" })).toHaveAttribute("href", "/learn/request-lifecycle");
    expect(screen.getByRole("progressbar", { name: "0 of 6 lessons explored" })).toHaveAttribute("value", "0");
    expect(screen.getByRole("link", { name: /Open the login lab/ })).toHaveAttribute("href", "/simulations/login");
  });

  it("updates the next discovery when saved progress changes", () => {
    render(<LessonProgressGrid lessons={lessons} />);

    act(() => updateLessonProgress("request-lifecycle", { lessonId: lessons[0].id, meaningfulInteraction: true, completed: true }));

    expect(screen.getByRole("link", { name: "Start next lesson" })).toHaveAttribute("href", "/learn/http");
    expect(screen.getByRole("progressbar", { name: "1 of 6 lessons explored" })).toHaveAttribute("value", "1");
    expect(screen.getByRole("link", { name: `Explore again: ${lessons[0].title}` })).toHaveAttribute("href", "/learn/request-lifecycle");
  });

  it("resumes an unfinished capstone without adding it to the six-lesson count", () => {
    saveLastVisited("/simulations/login", "login-capstone");
    render(<LessonProgressGrid lessons={lessons} />);

    expect(screen.getByRole("link", { name: "Continue lesson" })).toHaveAttribute("href", "/simulations/login");
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
    expect(screen.queryByText(/stage \(/)).not.toBeInTheDocument();
  });

  it("offers the capstone after all lessons, then the playground after the capstone", () => {
    for (const lesson of lessons) updateLessonProgress(lesson.slug, { lessonId: lesson.id, completed: true });
    render(<LessonProgressGrid lessons={lessons} />);

    expect(screen.getByRole("link", { name: "Try the login lab" })).toHaveAttribute("href", "/simulations/login");

    act(() => updateLessonProgress("login-capstone", { completed: true }));

    const overview = screen.getByRole("heading", { name: "Build a system of your own" }).parentElement!;
    expect(within(overview).getByRole("link", { name: "Open playground" })).toHaveAttribute("href", "/playground");
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "6");
  });
});
