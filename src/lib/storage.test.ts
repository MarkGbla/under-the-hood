import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLocalData,
  createEmptyProgress,
  getTourStatus,
  readLocalData,
  saveTourStatus,
  subscribeToProgress,
  updateLessonProgress,
} from "./storage";

const STORAGE_KEY = "under-the-hood:progress";
const LEGACY_STORAGE_KEY = "under-the-hood:v1";

describe("local tour storage", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("stores and retrieves completion without personal information", () => {
    saveTourStatus("login", "completed");
    expect(getTourStatus("login")).toBe("completed");
    expect(JSON.stringify(readLocalData())).not.toContain("email");
  });

  it("recovers safely from invalid local data", () => {
    window.localStorage.setItem("under-the-hood:v1", "not-json");
    expect(readLocalData()).toEqual(createEmptyProgress());
    expect(window.localStorage.getItem("under-the-hood:v1")).toBeNull();
  });

  it("clears only the application storage key", () => {
    window.localStorage.setItem("unrelated", "keep-me");
    saveTourStatus("login", "skipped");
    clearLocalData();
    expect(getTourStatus("login")).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep-me");
  });

  it("recovers valid legacy progress when the current record is corrupt", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
      version: 1,
      completedLessons: ["http"],
      tours: { login: { status: "completed" } },
    }));

    expect(readLocalData()).toMatchObject({
      version: 2,
      completedLessons: ["http"],
      lessons: { http: { completed: true } },
      tours: { login: { status: "completed" } },
    });
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ version: 2 });
  });

  it("keeps readable legacy progress when storage is too full to migrate", () => {
    const legacy = JSON.stringify({ version: 1, completedLessons: ["auth"] });
    window.localStorage.setItem(LEGACY_STORAGE_KEY, legacy);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is full", "QuotaExceededError");
    });

    expect(readLocalData().completedLessons).toEqual(["auth"]);
    expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).toBe(legacy);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("repairs malformed nested records without losing valid progress", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2,
      completedLessons: ["http", "http", "unknown", null],
      lessons: {
        http: {
          lessonId: { unexpected: true },
          stageIndex: 2.8,
          simulationStep: -3,
          meaningfulInteraction: "false",
          explanationCompleted: [],
          confidence: "certain",
          quizResults: { missing: null, valid: { correct: true, attempts: 2.6 } },
          updatedAt: false,
        },
        auth: { stageIndex: 999, completed: true },
        unknown: { completed: true },
      },
      tours: { login: { status: "skipped" }, broken: { status: "maybe" } },
      preferences: { showInstructorPrompts: "false" },
      lastVisited: { path: { bad: "path" } },
    }));

    const progress = readLocalData();
    expect(progress.completedLessons).toEqual(["http", "auth"]);
    expect(progress.lessons.http).toEqual({
      lessonId: "http",
      stageIndex: 2,
      stage: "change",
      simulationStep: 0,
      meaningfulInteraction: false,
      explanationCompleted: false,
      completed: true,
      confidence: null,
      quizResults: { valid: { questionId: "valid", correct: true, attempts: 2, answeredAt: new Date(0).toISOString() } },
      updatedAt: new Date(0).toISOString(),
    });
    expect(progress.lessons.auth?.stage).toBe("confidence");
    expect(Object.keys(progress.lessons)).toEqual(["http", "auth"]);
    expect(Object.keys(progress.tours)).toEqual(["login"]);
    expect(progress.preferences.showInstructorPrompts).toBe(true);
    expect(progress.lastVisited).toBeNull();
  });

  it("restores defaults for missing containers and rejects unsupported resume destinations", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2,
      lessons: [],
      preferences: null,
      tours: null,
      lastVisited: { path: "https://example.com" },
    }));
    expect(readLocalData()).toEqual(createEmptyProgress());
  });

  it("keeps lesson records and the completion list consistent when progress changes", () => {
    updateLessonProgress("crud", { completed: true });
    expect(readLocalData().completedLessons).toEqual(["crud"]);
    updateLessonProgress("crud", { completed: false });
    expect(readLocalData().completedLessons).toEqual([]);
    expect(readLocalData().lessons.crud?.completed).toBe(false);
  });

  it("notifies subscribers for local changes and relevant cross-tab changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToProgress(listener);
    saveTourStatus("login", "completed");
    expect(listener).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    saveTourStatus("login", "skipped");
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("returns safe defaults when the browser blocks storage access", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("Storage is blocked", "SecurityError");
    });
    expect(readLocalData()).toEqual(createEmptyProgress());
    expect(saveTourStatus("login", "completed")).toBe(false);
  });
});
