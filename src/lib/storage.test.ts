import { beforeEach, describe, expect, it } from "vitest";
import { clearLocalData, createEmptyProgress, getTourStatus, readLocalData, saveTourStatus } from "./storage";

describe("local tour storage", () => {
  beforeEach(() => window.localStorage.clear());

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
});
