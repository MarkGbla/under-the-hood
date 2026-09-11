import { describe, expect, it } from "vitest";
import { loginSimulationDefinition, signupSimulationDefinition } from "./login-definition";
import { createSimulationStore } from "@/stores/simulation-store";
import type { FailureType, SimulationDefinition } from "@/simulations/engine/types";

/** Every capstone failure named in the PRD, with where it must stop. */
const capstoneFailures: Array<{ failure: FailureType; stopAt: string; status: number }> = [
  { failure: "invalid-request", stopAt: "validation-middleware", status: 400 },
  { failure: "missing-route", stopAt: "router", status: 404 },
  { failure: "database-unavailable", stopAt: "database-query", status: 500 },
  { failure: "wrong-password", stopAt: "password-check", status: 401 },
  { failure: "invalid-token", stopAt: "token-generated", status: 401 },
  { failure: "wrong-role", stopAt: "response-sent", status: 403 },
];

function runToEnd(failure: FailureType | null, definition: SimulationDefinition = loginSimulationDefinition) {
  const store = createSimulationStore(definition);
  store.getState().triggerFailure(failure);
  for (let step = 0; step < definition.steps.length + 2; step += 1) {
    store.getState().next();
  }
  return store.getState();
}

describe("login capstone failure matrix", () => {
  it.each(capstoneFailures)("stops $failure at $stopAt with $status", ({ failure, stopAt, status }) => {
    const state = runToEnd(failure);
    expect(state.status).toBe("failed");
    expect(state.failureResult?.statusCode).toBe(status);
    expect(loginSimulationDefinition.steps[state.currentStepIndex].id).toBe(stopAt);
  });

  it("gives each failure a distinct explanation", () => {
    const explanations = capstoneFailures.map(({ failure }) => runToEnd(failure).failureResult?.explanation);
    expect(new Set(explanations).size).toBe(capstoneFailures.length);
  });

  it("reaches the dashboard when nothing is broken", () => {
    const state = runToEnd(null);
    expect(state.status).toBe("completed");
    expect(state.failureResult).toBeNull();
  });

  it("clears derived failure state on restart", () => {
    const store = createSimulationStore(loginSimulationDefinition);
    store.getState().triggerFailure("wrong-password");
    for (let step = 0; step < 10; step += 1) store.getState().next();
    expect(store.getState().status).toBe("failed");

    store.getState().restart();
    expect(store.getState()).toMatchObject({
      status: "idle",
      currentStepIndex: 0,
      failureResult: null,
      selectedFailure: null,
    });
  });
});

describe("sign-up capstone", () => {
  it("creates the account when every check passes", () => {
    const state = runToEnd(null, signupSimulationDefinition);
    expect(state.status).toBe("completed");
    expect(state.failureResult).toBeNull();
  });

  it("stops a duplicate account at the email availability check", () => {
    const state = runToEnd("email-taken", signupSimulationDefinition);
    expect(state.status).toBe("failed");
    expect(state.failureResult?.statusCode).toBe(409);
    expect(signupSimulationDefinition.steps[state.currentStepIndex].id).toBe("email-availability");
  });

  it.each([
    ["invalid-request", "validation-middleware", 400],
    ["missing-route", "router", 404],
    ["database-unavailable", "email-availability", 500],
  ] as const)("stops %s at %s with %s", (failure, stopAt, status) => {
    const state = runToEnd(failure, signupSimulationDefinition);
    expect(state.status).toBe("failed");
    expect(state.failureResult?.statusCode).toBe(status);
    expect(signupSimulationDefinition.steps[state.currentStepIndex].id).toBe(stopAt);
  });
});
