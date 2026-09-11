export type UserRole = "student" | "instructor" | "admin";
export type PermissionAction = "view-own-profile" | "present-lesson" | "manage-users";

export type SimulatedUser = {
  id: string;
  name: string;
  role: UserRole;
  tokenState: "valid" | "missing" | "invalid";
};
