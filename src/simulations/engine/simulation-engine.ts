import type {
  FailureResult,
  SimulationDefinition,
  SimulationSnapshot,
  SimulationStatus,
} from "./types";

type AdvanceMode = "automatic" | "manual";

export function getInitialSnapshot(): SimulationSnapshot {
  return {
    currentStepIndex: 0,
    status: "idle",
    speed: 1,
    selectedFailure: null,
    failureResult: null,
    inspectedStepId: null,
  };
}

export function advanceSimulation(
  definition: SimulationDefinition,
  snapshot: SimulationSnapshot,
  mode: AdvanceMode,
): SimulationSnapshot {
  if (snapshot.status === "completed" || snapshot.status === "failed") {
    return snapshot;
  }

  const lastIndex = definition.steps.length - 1;
  if (snapshot.currentStepIndex >= lastIndex) {
    return { ...snapshot, status: "completed", inspectedStepId: null };
  }

  const nextIndex = Math.min(snapshot.currentStepIndex + 1, lastIndex);
  const nextStep = definition.steps[nextIndex];
  const failureRule = snapshot.selectedFailure
    ? definition.failureRules[snapshot.selectedFailure]
    : undefined;

  if (failureRule?.stopAtStepId === nextStep.id) {
    const failureResult: FailureResult = { ...failureRule, stepIndex: nextIndex };
    return {
      ...snapshot,
      currentStepIndex: nextIndex,
      status: "failed",
      failureResult,
      inspectedStepId: null,
    };
  }

  let status: SimulationStatus = mode === "automatic" ? "playing" : "paused";
  if (mode === "automatic" && nextStep.pauseAfter) status = "paused";

  return {
    ...snapshot,
    currentStepIndex: nextIndex,
    status,
    failureResult: null,
    inspectedStepId: null,
  };
}

export function moveToPreviousStep(snapshot: SimulationSnapshot): SimulationSnapshot {
  return {
    ...snapshot,
    currentStepIndex: Math.max(0, snapshot.currentStepIndex - 1),
    status: "paused",
    failureResult: null,
    inspectedStepId: null,
  };
}
