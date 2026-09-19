import { describe, expect, it } from "vitest";
import { failureCatalog } from "./failures";
import { failureTypes, simulationSpeeds, type SimulationDefinition } from "./types";
import { loginSimulationDefinition } from "@/simulations/login/login-definition";
import { createSimulationStore } from "@/stores/simulation-store";

describe("deterministic simulation store", () => {
  it("supports play, pause, next, previous, restart, and speed controls", () => {
    const store = createSimulationStore(loginSimulationDefinition);

    store.getState().play();
    expect(store.getState().status).toBe("playing");
    store.getState().pause();
    expect(store.getState().status).toBe("paused");

    store.getState().next();
    expect(store.getState().currentStepIndex).toBe(1);
    store.getState().previous();
    expect(store.getState().currentStepIndex).toBe(0);

    for (const speed of simulationSpeeds) {
      store.getState().setSpeed(speed);
      expect(store.getState().speed).toBe(speed);
    }

    store.getState().inspectCurrent();
    expect(store.getState().inspectedStepId).toBe("request-created");
    store.getState().restart();
    expect(store.getState()).toMatchObject({
      currentStepIndex: 0,
      status: "idle",
      speed: 1,
      failureResult: null,
      inspectedStepId: null,
    });
  });

  it("reaches completion and safely clamps rapid next input", () => {
    const store = createSimulationStore(loginSimulationDefinition);
    for (let press = 0; press < 50; press += 1) store.getState().next();

    expect(store.getState().currentStepIndex).toBe(loginSimulationDefinition.steps.length - 1);
    expect(store.getState().status).toBe("completed");
  });

  it("ignores delayed playback ticks after pause or restart", () => {
    const store = createSimulationStore(loginSimulationDefinition);
    store.getState().play();
    store.getState().pause();
    const paused = store.getState();
    store.getState().tick();
    expect(store.getState()).toBe(paused);

    store.getState().play();
    store.getState().restart();
    const restarted = store.getState();
    store.getState().tick();
    expect(store.getState()).toBe(restarted);
  });

  it("keeps the inspector open when a pending playback tick arrives", () => {
    const store = createSimulationStore(loginSimulationDefinition);
    store.getState().play();
    store.getState().inspectCurrent();
    store.getState().tick();
    expect(store.getState()).toMatchObject({
      currentStepIndex: 0,
      status: "paused",
      inspectedStepId: "request-created",
    });

    store.getState().closeInspector();
    store.getState().play();
    store.getState().tick();
    expect(store.getState().currentStepIndex).toBe(1);
  });

  it("waits for the learner to resume after a teaching pause", () => {
    const store = createSimulationStore(loginSimulationDefinition);
    store.getState().play();
    store.getState().tick();
    expect(store.getState()).toMatchObject({ status: "paused", currentStepIndex: 1 });
    store.getState().tick();
    expect(store.getState()).toMatchObject({ status: "paused", currentStepIndex: 1 });
    store.getState().next();
    expect(store.getState().currentStepIndex).toBe(2);
  });

  it("produces the same wrong-password stop and 401 result every time", () => {
    const outcomes = Array.from({ length: 3 }, () => {
      const store = createSimulationStore(loginSimulationDefinition);
      store.getState().triggerFailure("wrong-password");
      for (let press = 0; press < 20; press += 1) store.getState().next();
      return store.getState();
    });

    for (const outcome of outcomes) {
      expect(outcome.status).toBe("failed");
      expect(outcome.definition.steps[outcome.currentStepIndex].id).toBe("password-check");
      expect(outcome.failureResult).toMatchObject({ type: "wrong-password", statusCode: 401 });
    }
  });

  it("rejects unsupported failures instead of silently changing the sequence", () => {
    const store = createSimulationStore(loginSimulationDefinition);
    expect(() => store.getState().triggerFailure("missing-token")).toThrow("is not supported");
  });
});

describe("failure contracts", () => {
  it.each(failureTypes)("defines an explicit stop, status, and explanation for %s", (failureType) => {
    expect(failureCatalog[failureType]).toMatchObject({ type: failureType });
    expect(failureCatalog[failureType].defaultStop.length).toBeGreaterThan(0);
    expect(failureCatalog[failureType].statusCode).toBeGreaterThanOrEqual(400);
    expect(failureCatalog[failureType].explanation.length).toBeGreaterThan(20);
  });

  it("can execute every declared failure against a compatible lesson definition", () => {
    for (const failureType of failureTypes) {
      const failure = failureCatalog[failureType];
      const definition: SimulationDefinition = {
        id: `test-${failureType}`,
        title: "Failure contract test",
        steps: [
          { id: "start", title: "Start", description: "Start", source: "browser", target: "server", duration: 1, action: "send-request", inspectable: false },
          { id: failure.defaultStop, title: "Stop", description: "Stop", source: "server", duration: 1, action: "show-result", inspectable: false },
        ],
        failureRules: { [failureType]: { ...failure, stopAtStepId: failure.defaultStop } },
      };
      const store = createSimulationStore(definition);
      store.getState().triggerFailure(failureType);
      store.getState().next();
      expect(store.getState().failureResult).toMatchObject({ type: failureType, stepIndex: 1 });
    }
  });
});
