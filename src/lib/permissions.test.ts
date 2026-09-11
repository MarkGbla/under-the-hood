import { describe, expect, it } from "vitest";
import { evaluatePermission, rolePermissions } from "./permissions";

describe("simulated permission model", () => {
  it("allows each role only its documented actions", () => {
    expect(rolePermissions.student).toEqual(["view-own-profile"]);
    expect(rolePermissions.instructor).toContain("present-lesson");
    expect(rolePermissions.admin).toContain("manage-users");
  });

  it("distinguishes identity failures from permission failures", () => {
    expect(evaluatePermission({ id: "1", name: "Mariama", role: "student", tokenState: "missing" }, "view-own-profile")).toMatchObject({ statusCode: 401, stage: "authentication" });
    expect(evaluatePermission({ id: "1", name: "Mariama", role: "student", tokenState: "invalid" }, "view-own-profile")).toMatchObject({ statusCode: 401, stage: "authentication" });
    expect(evaluatePermission({ id: "1", name: "Mariama", role: "student", tokenState: "valid" }, "manage-users")).toMatchObject({ statusCode: 403, stage: "authorization" });
    expect(evaluatePermission({ id: "2", name: "Sarah", role: "admin", tokenState: "valid" }, "manage-users")).toMatchObject({ statusCode: 200, allowed: true });
  });
});
