import { describe, expect, it } from "vitest";
import { getLesson, lessons } from "./lessons";

describe("lesson summaries", () => {
  it("defines the six connected V1 lessons in order", () => {
    expect(lessons).toHaveLength(6);
    expect(lessons.map((lesson) => lesson.slug)).toEqual([
      "request-lifecycle",
      "http",
      "crud",
      "auth",
      "middleware",
      "deployment",
    ]);
    expect(lessons.map((lesson) => lesson.index)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("provides stable unique slugs and at least one concept per lesson", () => {
    expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(lessons.length);
    expect(lessons.every((lesson) => lesson.concepts.length > 0)).toBe(true);
  });

  it("returns a lesson by slug", () => {
    expect(getLesson("auth")?.title).toBe("Authentication vs Authorization");
    expect(getLesson("not-a-lesson")).toBeUndefined();
  });
});
