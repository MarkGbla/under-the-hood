import { learningStages, type LessonSlug } from "@/types/lesson";
import { PROGRESS_VERSION, type AppProgress, type LessonProgress, type ProgressPreferences } from "@/types/progress";

const STORAGE_KEY = "under-the-hood:progress";
const LEGACY_STORAGE_KEY = "under-the-hood:v1";
const CHANGE_EVENT = "under-the-hood:progress-changed";

export type TourStatus = "completed" | "skipped";

export function createEmptyProgress(): AppProgress {
  return {
    version: PROGRESS_VERSION,
    completedLessons: [],
    lessons: {},
    tours: {},
    preferences: { showInstructorPrompts: true },
    lastVisited: null,
  };
}

export function createLessonProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    stage: learningStages[0],
    stageIndex: 0,
    simulationStep: 0,
    meaningfulInteraction: false,
    explanationCompleted: false,
    completed: false,
    confidence: null,
    quizResults: {},
    updatedAt: new Date(0).toISOString(),
  };
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isProgress(value: unknown): value is AppProgress {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppProgress>;
  return candidate.version === PROGRESS_VERSION
    && Array.isArray(candidate.completedLessons)
    && Boolean(candidate.lessons && typeof candidate.lessons === "object")
    && Boolean(candidate.tours && typeof candidate.tours === "object")
    && Boolean(candidate.preferences && typeof candidate.preferences === "object");
}

function sanitizeProgress(progress: AppProgress): AppProgress {
  const lessons: AppProgress["lessons"] = {};
  for (const [key, value] of Object.entries(progress.lessons)) {
    if (!value || typeof value !== "object") continue;
    const stageIndex = Math.max(0, Math.min(learningStages.length - 1, Number(value.stageIndex) || 0));
    lessons[key as keyof AppProgress["lessons"]] = {
      ...createLessonProgress(String(value.lessonId || key)),
      ...value,
      stageIndex,
      stage: learningStages[stageIndex],
    };
  }
  return { ...createEmptyProgress(), ...progress, version: PROGRESS_VERSION, lessons };
}

export function migrateProgress(value: unknown): AppProgress {
  if (isProgress(value)) return sanitizeProgress(value);
  if (!value || typeof value !== "object") return createEmptyProgress();
  const legacy = value as { version?: number; tours?: AppProgress["tours"]; completedLessons?: LessonSlug[]; lessons?: AppProgress["lessons"] };
  if (legacy.version !== 1) return createEmptyProgress();
  return {
    ...createEmptyProgress(),
    completedLessons: Array.isArray(legacy.completedLessons) ? legacy.completedLessons : [],
    lessons: legacy.lessons && typeof legacy.lessons === "object" ? legacy.lessons : {},
    tours: legacy.tours && typeof legacy.tours === "object" ? legacy.tours : {},
  };
}

function parseStoredValue(raw: string | null): AppProgress | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw) as unknown;
  if (isProgress(parsed)) return sanitizeProgress(parsed);
  if ((parsed as { version?: number } | null)?.version === 1) return migrateProgress(parsed);
  throw new Error("Unsupported progress data");
}

export function getProgress(): AppProgress {
  const storage = browserStorage();
  if (!storage) return createEmptyProgress();
  try {
    const current = parseStoredValue(storage.getItem(STORAGE_KEY));
    if (current) return current;
    const legacy = parseStoredValue(storage.getItem(LEGACY_STORAGE_KEY));
    if (legacy) {
      storage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      storage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
  } catch {
    try {
      storage.removeItem(STORAGE_KEY);
      storage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Storage can become unavailable between reads; return safe defaults.
    }
  }
  return createEmptyProgress();
}

function notifyProgressChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveProgress(progress: AppProgress) {
  const storage = browserStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeProgress(progress)));
    notifyProgressChanged();
    return true;
  } catch {
    return false;
  }
}

export function updateLessonProgress(lessonSlug: LessonSlug | "login-capstone", patch: Partial<LessonProgress>) {
  const progress = getProgress();
  const current = progress.lessons[lessonSlug] ?? createLessonProgress(patch.lessonId ?? lessonSlug);
  const nextLesson = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const completedLessons = nextLesson.completed && lessonSlug !== "login-capstone" && !progress.completedLessons.includes(lessonSlug)
    ? [...progress.completedLessons, lessonSlug]
    : progress.completedLessons;
  saveProgress({ ...progress, completedLessons, lessons: { ...progress.lessons, [lessonSlug]: nextLesson } });
  return nextLesson;
}

export function saveLastVisited(path: string, lessonId?: string) {
  const progress = getProgress();
  saveProgress({ ...progress, lastVisited: { path, lessonId, updatedAt: new Date().toISOString() } });
}

export function getPreference<K extends keyof ProgressPreferences>(key: K): ProgressPreferences[K] {
  return getProgress().preferences[key];
}

export function savePreference<K extends keyof ProgressPreferences>(key: K, value: ProgressPreferences[K]) {
  const progress = getProgress();
  return saveProgress({ ...progress, preferences: { ...progress.preferences, [key]: value } });
}

export function getTourStatus(tourId: string): TourStatus | null {
  return getProgress().tours[tourId]?.status ?? null;
}

export function saveTourStatus(tourId: string, status: TourStatus) {
  const progress = getProgress();
  return saveProgress({ ...progress, tours: { ...progress.tours, [tourId]: { status, updatedAt: new Date().toISOString() } } });
}

export function clearProgress() {
  const storage = browserStorage();
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(LEGACY_STORAGE_KEY);
    notifyProgressChanged();
    return true;
  } catch {
    return false;
  }
}

export const clearLocalData = clearProgress;
export const readLocalData = getProgress;

export function getProgressSnapshot() {
  const storage = browserStorage();
  if (!storage) return "unavailable";
  try {
    return storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY) ?? "empty";
  } catch {
    return "unavailable";
  }
}

export function subscribeToProgress(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
