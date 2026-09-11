import type { PermissionAction, SimulatedUser, UserRole } from "@/types/permission";

export const rolePermissions: Record<UserRole, readonly PermissionAction[]> = {
  student: ["view-own-profile"],
  instructor: ["view-own-profile", "present-lesson"],
  admin: ["view-own-profile", "present-lesson", "manage-users"],
};

export type PermissionDecision = {
  allowed: boolean;
  statusCode: 200 | 401 | 403;
  stage: "authentication" | "authorization" | "complete";
  explanation: string;
};

export function evaluatePermission(user: SimulatedUser, action: PermissionAction): PermissionDecision {
  if (user.tokenState === "missing") return { allowed: false, statusCode: 401, stage: "authentication", explanation: "No identity token was provided, so authentication could not verify the user." };
  if (user.tokenState === "invalid") return { allowed: false, statusCode: 401, stage: "authentication", explanation: "The identity token was present but invalid, so authentication rejected it." };
  if (!rolePermissions[user.role].includes(action)) return { allowed: false, statusCode: 403, stage: "authorization", explanation: `Identity is valid, but the ${user.role} role does not have permission to ${action.replaceAll("-", " ")}.` };
  return { allowed: true, statusCode: 200, stage: "complete", explanation: "Authentication verified the identity and authorization allowed this action." };
}
