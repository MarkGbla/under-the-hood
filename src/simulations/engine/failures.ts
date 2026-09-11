import type { FailureRule, FailureType } from "./types";

type FailureDefinition = Omit<FailureRule, "stopAtStepId"> & {
  defaultStop: string;
};

export const failureCatalog: Record<FailureType, FailureDefinition> = {
  "missing-token": {
    type: "missing-token",
    defaultStop: "authentication-middleware",
    statusCode: 401,
    title: "Authentication token missing",
    explanation: "Authentication middleware stopped the request because no token was provided.",
  },
  "invalid-token": {
    type: "invalid-token",
    defaultStop: "authentication-middleware",
    statusCode: 401,
    title: "Authentication token invalid",
    explanation: "The request reached authentication middleware, but the supplied token could not be trusted.",
  },
  "wrong-role": {
    type: "wrong-role",
    defaultStop: "authorization-middleware",
    statusCode: 403,
    title: "Permission denied",
    explanation: "The user is authenticated, but their role does not allow this action.",
  },
  "database-unavailable": {
    type: "database-unavailable",
    defaultStop: "database-query",
    statusCode: 500,
    title: "Database unavailable",
    explanation: "The server could not complete its work because the database did not respond.",
  },
  "invalid-request": {
    type: "invalid-request",
    defaultStop: "validation-middleware",
    statusCode: 400,
    title: "Invalid request",
    explanation: "Validation rejected the request because required input was missing or malformed.",
  },
  "missing-route": {
    type: "missing-route",
    defaultStop: "router",
    statusCode: 404,
    title: "Route not found",
    explanation: "The router could not find a handler for this request path and method.",
  },
  "wrong-password": {
    type: "wrong-password",
    defaultStop: "password-check",
    statusCode: 401,
    title: "Password rejected",
    explanation: "The user exists, but the submitted password does not match the stored password hash.",
  },
  "email-taken": {
    type: "email-taken",
    defaultStop: "email-availability",
    statusCode: 409,
    title: "Email already registered",
    explanation: "The account service found an existing user with this email, so it did not create a duplicate account.",
  },
  "failed-deployment-test": {
    type: "failed-deployment-test",
    defaultStop: "deployment-tests",
    statusCode: 500,
    title: "Release blocked by tests",
    explanation: "The deployment pipeline stopped because a required automated test failed.",
  },
};

export function createFailureRule(type: FailureType, stopAtStepId?: string): FailureRule {
  const definition = failureCatalog[type];
  return {
    type,
    stopAtStepId: stopAtStepId ?? definition.defaultStop,
    statusCode: definition.statusCode,
    title: definition.title,
    explanation: definition.explanation,
  };
}
