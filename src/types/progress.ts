import type { ConfidenceLevel, LearningStage, LessonSlug } from "./lesson";

export const PROGRESS_VERSION = 2 as const;

export type QuestionResult = {
  questionId: string;
  correct: boolean;
  attempts: number;
  answeredAt: string;
};

export type LessonProgress = {
  lessonId: string;
  stage: LearningStage;
  stageIndex: number;
  simulationStep: number;
  meaningfulInteraction: boolean;
  explanationCompleted: boolean;
  completed: boolean;
  confidence: ConfidenceLevel | null;
  quizResults: Record<string, QuestionResult>;
  updatedAt: string;
};

export type ProgressPreferences = {
  showInstructorPrompts: boolean;
};

export type StoredTour = {
  status: "completed" | "skipped";
  updatedAt: string;
};

export type AppProgress = {
  version: typeof PROGRESS_VERSION;
  completedLessons: LessonSlug[];
  lessons: Partial<Record<LessonSlug | "login-capstone", LessonProgress>>;
  tours: Record<string, StoredTour>;
  preferences: ProgressPreferences;
  lastVisited: { path: string; lessonId?: string; updatedAt: string } | null;
};
