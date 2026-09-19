import { createSimulationStore } from "@/stores/simulation-store";
import { statusReason } from "@/components/simulation/status-code";
import type { FailureType, InspectorPayload, SimulationDefinition, SimulationSpeed, SimulationStep } from "@/simulations/engine/types";
import type { HttpMethod } from "@/types/simulation";

type LabRunOptions = {
  definition: SimulationDefinition;
  speed: SimulationSpeed;
  failure: FailureType | null;
  request: { method: HttpMethod; path: string; body?: string; headers?: InspectorPayload["headers"] };
  response: { statusCode: number; body: string };
  mapStep?: (step: SimulationStep) => SimulationStep;
};

/** Freeze the submitted exchange so edits to the next request cannot rewrite an active run. */
export function createLabRun({ definition, speed, failure, request, response, mapStep }: LabRunOptions) {
  const requestPayload: InspectorPayload = {
    kind: "request", headline: `${request.method} ${request.path}`, method: request.method, path: request.path,
    headers: request.headers ?? [{ name: "Accept", value: "application/json" }, ...(request.body?.trim() ? [{ name: "Content-Type", value: "application/json" }] : [])],
    body: request.body?.trim() || undefined,
  };
  const responsePayload: InspectorPayload = {
    kind: "response", headline: `${response.statusCode} ${statusReason(response.statusCode)}`, statusCode: response.statusCode,
    headers: [{ name: "Content-Type", value: "application/json" }], body: response.body,
  };
  const store = createSimulationStore({
    ...definition,
    steps: definition.steps.map((step) => {
      const snapshot = {
        ...step,
        payload: step.action === "create-request" || step.action === "send-request" ? requestPayload
          : step.action === "send-response" ? responsePayload : step.payload,
      };
      return mapStep ? mapStep(snapshot) : snapshot;
    }),
  });
  store.getState().setSpeed(speed);
  store.getState().triggerFailure(failure);
  // Restart replays this submitted scenario; fixing its input requires a new run.
  store.setState({ restart: () => store.getState().triggerFailure(failure) });
  store.getState().play();
  return store;
}
