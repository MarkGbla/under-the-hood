import { learningStages, lessonSlugs, type LessonSlug } from "@/types/lesson";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function timestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : new Date(0).toISOString();
}

function sanitizeProgress(progress: Record<string, unknown>): AppProgress {
  const completed = new Set<LessonSlug>(
    Array.isArray(progress.completedLessons)
      ? progress.completedLessons.filter((slug): slug is LessonSlug => lessonSlugs.includes(slug))
      : [],
  );
  const lessons: AppProgress["lessons"] = {};
  const storedLessons = isRecord(progress.lessons) ? progress.lessons : {};
  for (const key of [...lessonSlugs, "login-capstone"] as const) {
    const stored = storedLessons[key];
    const wasCompleted = key !== "login-capstone" && completed.has(key);
    if (!isRecord(stored) && !wasCompleted) continue;
    const value = isRecord(stored) ? stored : {};
    const stageIndex = Math.min(learningStages.length - 1, nonNegativeInteger(value.stageIndex));
    const quizResults: LessonProgress["quizResults"] = Object.fromEntries(
      Object.entries(isRecord(value.quizResults) ? value.quizResults : {}).flatMap(([id, result]) => (
        isRecord(result) ? [[id, {
          questionId: typeof result.questionId === "string" ? result.questionId : id,
          correct: result.correct === true,
          attempts: nonNegativeInteger(result.attempts),
          answeredAt: timestamp(result.answeredAt),
        }]] : []
      )),
    );
    const lesson = {
      lessonId: typeof value.lessonId === "string" && value.lessonId ? value.lessonId : key,
      stageIndex,
      stage: learningStages[stageIndex],
      simulationStep: nonNegativeInteger(value.simulationStep),
      meaningfulInteraction: value.meaningfulInteraction === true,
      explanationCompleted: value.explanationCompleted === true,
      completed: value.completed === true || wasCompleted,
      confidence: value.confidence === "yes" || value.confidence === "i-think-so" || value.confidence === "not-yet"
        ? value.confidence : null,
      quizResults,
      updatedAt: timestamp(value.updatedAt),
    } satisfies LessonProgress;
    lessons[key] = lesson;
    if (lesson.completed && key !== "login-capstone") completed.add(key);
  }
  const tours: AppProgress["tours"] = Object.fromEntries(
    Object.entries(isRecord(progress.tours) ? progress.tours : {}).flatMap(([id, tour]) => (
      isRecord(tour) && (tour.status === "completed" || tour.status === "skipped")
        ? [[id, { status: tour.status, updatedAt: timestamp(tour.updatedAt) }]] : []
    )),
  );
  const preferences = isRecord(progress.preferences) ? progress.preferences : {};
  const visited = progress.lastVisited;
  const allowedPaths = [...lessonSlugs.map((slug) => `/learn/${slug}`), "/simulations/login", "/playground"];
  let lastVisited: AppProgress["lastVisited"] = null;
  if (isRecord(visited) && typeof visited.path === "string" && allowedPaths.includes(visited.path)) {
    lastVisited = {
      path: visited.path,
      ...(typeof visited.lessonId === "string" ? { lessonId: visited.lessonId } : {}),
      updatedAt: timestamp(visited.updatedAt),
    };
  }
  return {
    version: PROGRESS_VERSION,
    completedLessons: [...completed],
    lessons,
    tours,
    preferences: {
      showInstructorPrompts: typeof preferences.showInstructorPrompts === "boolean" ? preferences.showInstructorPrompts : true,
    },
    lastVisited,
  };
}

export function migrateProgress(value: unknown): AppProgress {
  if (!isRecord(value) || (value.version !== PROGRESS_VERSION && value.version !== 1)) return createEmptyProgress();
  return sanitizeProgress(value);
}

function readStoredProgress(storage: Storage, key: string): AppProgress | null {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRecord(parsed) && (parsed.version === PROGRESS_VERSION || parsed.version === 1)) return migrateProgress(parsed);
  } catch {
    // Only remove this corrupt record; the other key may still contain progress.
  }
  try {
    storage.removeItem(key);
  } catch {
    // Reading must remain safe when the browser blocks storage mutations.
  }
  return null;
}

export function getProgress(): AppProgress {
  const storage = browserStorage();
  if (!storage) return createEmptyProgress();
  const current = readStoredProgress(storage, STORAGE_KEY);
  if (current) return current;
  const legacy = readStoredProgress(storage, LEGACY_STORAGE_KEY);
  if (legacy) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      storage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Keep the readable legacy progress if migration cannot be persisted.
    }
    return legacy;
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
  const completedLessons = progress.completedLessons.filter((slug) => slug !== lessonSlug);
  if (nextLesson.completed && lessonSlug !== "login-capstone") completedLessons.push(lessonSlug);
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
