import type { Lesson, LessonQuestion } from "@/types/lesson";

function contentError(lesson: Lesson, field: string, detail: string): never {
  throw new Error(`[${lesson.slug}] Invalid ${field}: ${detail}`);
}

function validateQuestion(lesson: Lesson, question: LessonQuestion, field: string) {
  const itemIds = question.type === "multiple-choice" ? question.options.map((option) => option.id) : question.items.map((item) => item.id);
  if (!question.id.trim()) contentError(lesson, `${field}.id`, "stable ID is required");
  if (new Set(itemIds).size !== itemIds.length) contentError(lesson, field, "option IDs must be unique");
  if (question.type === "multiple-choice" && !itemIds.includes(question.correctOptionId)) contentError(lesson, `${field}.correctOptionId`, `unknown option ${question.correctOptionId}`);
  if (question.type === "ordering" && (question.correctOrder.length !== itemIds.length || question.correctOrder.some((id) => !itemIds.includes(id)) || new Set(question.correctOrder).size !== itemIds.length)) contentError(lesson, `${field}.correctOrder`, "must contain every item ID exactly once");
}

function validateLab(lesson: Lesson) {
  const lab = lesson.lab;
  const scenarios = lab.kind === "flow" || lab.kind === "http" || lab.kind === "deployment" ? lab.scenarios : [];
  const scenarioIds = scenarios.map((scenario) => scenario.id);
  if (new Set(scenarioIds).size !== scenarioIds.length) contentError(lesson, "lab.scenarios", "scenario IDs must be unique");
  for (const scenario of scenarios) {
    if (scenario.failure && !lesson.simulation.failureRules[scenario.failure]) {
      contentError(lesson, `lab.scenarios.${scenario.id}.failure`, `${scenario.failure} is not declared by ${lesson.simulationId}`);
    }
  }

  if (lab.kind === "crud") {
    const ids = lab.initialRecords.map((record) => record.id);
    if (ids.length === 0) contentError(lesson, "lab.initialRecords", "at least one record is required");
    if (new Set(ids).size !== ids.length) contentError(lesson, "lab.initialRecords", "record IDs must be unique");
  }

  if (lab.kind === "auth") {
    const userIds = lab.users.map((user) => user.id);
    const actionIds = lab.actions.map((action) => action.id);
    if (new Set(userIds).size !== userIds.length) contentError(lesson, "lab.users", "user IDs must be unique");
    if (new Set(actionIds).size !== actionIds.length) contentError(lesson, "lab.actions", "action IDs must be unique");
  }

  if (lab.kind === "middleware") {
    const checkpointIds = lab.checkpoints.map((checkpoint) => checkpoint.id);
    if (new Set(checkpointIds).size !== checkpointIds.length) contentError(lesson, "lab.checkpoints", "checkpoint IDs must be unique");
  }

  if (lab.kind === "deployment") {
    const environmentIds = lab.environments.map((environment) => environment.id);
    if (new Set(environmentIds).size !== environmentIds.length) contentError(lesson, "lab.environments", "environment IDs must be unique");
  }
}

export function validateLesson(lesson: Lesson) {
  if (!lesson.id.trim()) contentError(lesson, "id", "stable ID is required");
  if (!lesson.objective.trim()) contentError(lesson, "objective", "learning objective is required");
  if (lesson.simulation.id !== lesson.simulationId) contentError(lesson, "simulationId", "must match simulation.id");
  if (lesson.simulation.steps.length === 0) contentError(lesson, "simulation.steps", "at least one step is required");
  const stepIds = lesson.simulation.steps.map((step) => step.id);
  if (new Set(stepIds).size !== stepIds.length) contentError(lesson, "simulation.steps", "step IDs must be unique");
  for (const [failureType, failure] of Object.entries(lesson.simulation.failureRules)) if (failure && !stepIds.includes(failure.stopAtStepId)) contentError(lesson, `failureRules.${failureType}`, `unknown stop step ${failure.stopAtStepId}`);
  validateQuestion(lesson, lesson.prediction, "prediction");
  validateQuestion(lesson, lesson.assessment, "assessment");
  if (lesson.challenges.length === 0) contentError(lesson, "challenges", "at least one challenge is required");
  lesson.challenges.forEach((challenge, index) => {
    if (!challenge.id.trim()) contentError(lesson, `challenges.${index}.id`, "stable ID is required");
    validateQuestion(lesson, challenge.question, `challenges.${index}.question`);
  });
  validateLab(lesson);
  return lesson;
}

export function validateCurriculum(lessons: Lesson[]) {
  const lessonIds = lessons.map((lesson) => lesson.id);
  const slugs = lessons.map((lesson) => lesson.slug);
  if (new Set(lessonIds).size !== lessonIds.length) throw new Error("Curriculum contains duplicate lesson IDs");
  if (new Set(slugs).size !== slugs.length) throw new Error("Curriculum contains duplicate lesson slugs");
  lessons.forEach(validateLesson);
  return lessons;
}
