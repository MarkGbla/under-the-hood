import type { SimulationDefinition } from "@/simulations/engine/types";
import type { SystemNodeKind } from "./simulation";
import type { LessonLabConfig } from "./lab";

export const lessonSlugs = ["request-lifecycle", "http", "crud", "auth", "middleware", "deployment"] as const;
export type LessonSlug = (typeof lessonSlugs)[number];
export type LessonStatus = "available" | "completed" | "in-progress";
export type LessonAccent = "coral" | "blue" | "lime" | "violet" | "amber" | "teal";

export const learningStages = ["run", "inspect", "change", "failure", "explain", "confidence"] as const;
export type LearningStage = (typeof learningStages)[number];
export type ConfidenceLevel = "not-yet" | "i-think-so" | "yes";

export type LessonSummary = {
  id: string;
  slug: LessonSlug;
  index: number;
  title: string;
  shortTitle: string;
  description: string;
  question: string;
  concepts: string[];
  accent: LessonAccent;
  status: LessonStatus;
};

export type ChoiceOption = {
  id: string;
  label: string;
};

export type MultipleChoiceQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: string;
  options: ChoiceOption[];
  correctOptionId: string;
  explanation: string;
};

export type OrderedFlowQuestion = {
  id: string;
  type: "ordering";
  prompt: string;
  items: ChoiceOption[];
  correctOrder: string[];
  explanation: string;
};

export type LessonQuestion = MultipleChoiceQuestion | OrderedFlowQuestion;

export type Challenge = {
  id: string;
  instruction: string;
  expectedState: string | string[] | Record<string, string | number | boolean>;
  hint?: string;
  explanation: string;
  question: LessonQuestion;
};

export type LessonVisualNode = {
  id: string;
  label: string;
  detail: string;
  kind: SystemNodeKind;
  startStep: number;
  endStep: number;
};

export type Lesson = LessonSummary & {
  objective: string;
  prerequisiteIds?: string[];
  simulationId: string;
  hook: { prompt: string; actionLabel: string };
  prediction: MultipleChoiceQuestion;
  challenges: Challenge[];
  assessment: LessonQuestion;
  finalExplanation: string;
  finalPrompt: string;
  instructorPrompt?: string;
  simulation: SimulationDefinition;
  visualNodes: LessonVisualNode[];
  lab: LessonLabConfig;
};
