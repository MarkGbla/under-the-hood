import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { validateLesson } from "./validation";
import type { Lesson } from "@/types/lesson";
import type { FlowLabConfig } from "@/types/lab";

const baseLesson = lessons[0];

function withLab(lab: Lesson["lab"]): Lesson {
  return { ...baseLesson, lab };
}

describe("lab content validation", () => {
  it("accepts the shipped curriculum", () => {
    expect(() => lessons.forEach(validateLesson)).not.toThrow();
  });

  it("gives every lesson a lab matched to its teaching model", () => {
    expect(lessons.map((lesson) => lesson.lab.kind)).toEqual([
      "flow",
      "http",
      "crud",
      "auth",
      "middleware",
      "deployment",
    ]);
  });

  it("rejects a scenario whose failure the simulation does not declare", () => {
    const lab: FlowLabConfig = {
      kind: "flow",
      scenarios: [{ id: "bogus", label: "Bogus", description: "", failure: "wrong-role", statusCode: 403 }],
    };
    expect(() => validateLesson(withLab(lab))).toThrow(/wrong-role is not declared/);
  });

  it("rejects duplicate scenario IDs", () => {
    const scenario = { id: "same", label: "Same", description: "", failure: null, statusCode: 200 } as const;
    const lab: FlowLabConfig = { kind: "flow", scenarios: [scenario, { ...scenario }] };
    expect(() => validateLesson(withLab(lab))).toThrow(/scenario IDs must be unique/);
  });

  it("rejects duplicate CRUD record IDs", () => {
    const lab: Lesson["lab"] = {
      kind: "crud",
      initialRecords: [{ id: 1, name: "A", role: "student" }, { id: 1, name: "B", role: "student" }],
    };
    expect(() => validateLesson(withLab(lab))).toThrow(/record IDs must be unique/);
  });

  it("keeps every lab failure reachable from its own simulation", () => {
    for (const lesson of lessons) {
      const stepIds = lesson.simulation.steps.map((step) => step.id);
      for (const rule of Object.values(lesson.simulation.failureRules)) {
        if (rule) expect(stepIds).toContain(rule.stopAtStepId);
      }
    }
  });
});
