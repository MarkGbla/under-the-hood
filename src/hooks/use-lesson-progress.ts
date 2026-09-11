"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  createLessonProgress,
  getProgress,
  getProgressSnapshot,
  subscribeToProgress,
  updateLessonProgress,
} from "@/lib/storage";
import type { LessonSlug } from "@/types/lesson";
import type { LessonProgress } from "@/types/progress";

export type LessonProgressKey = LessonSlug | "login-capstone";

/**
 * Completion means the learner actually drove the simulation — played it,
 * stepped it, inspected it, or changed a scenario. Opening the page is not enough.
 */
function isComplete(progress: LessonProgress) {
  return progress.meaningfulInteraction;
}

export function useLessonProgress(key: LessonProgressKey, lessonId: string) {
  // The snapshot is the raw stored string, so it doubles as a cache key and as
  // the server/client marker that keeps hydration consistent.
  const snapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, () => "server");
  const progress = snapshot === "server"
    ? createLessonProgress(lessonId)
    : getProgress().lessons[key] ?? createLessonProgress(lessonId);

  const patch = useCallback((next: Partial<LessonProgress>) => {
    const current = getProgress().lessons[key] ?? createLessonProgress(lessonId);
    const merged = { ...current, ...next, lessonId };
    updateLessonProgress(key, { ...merged, completed: isComplete(merged) });
  }, [key, lessonId]);

  return { progress, patch };
}
