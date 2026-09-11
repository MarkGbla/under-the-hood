import type { HttpMethod, PacketKind, SystemNodeKind } from "@/types/simulation";

export const simulationSpeeds = [0.5, 1, 2] as const;
export type SimulationSpeed = (typeof simulationSpeeds)[number];

export const failureTypes = [
  "missing-token",
  "invalid-token",
  "wrong-role",
  "database-unavailable",
  "invalid-request",
  "missing-route",
  "wrong-password",
  "email-taken",
  "failed-deployment-test",
] as const;

export type FailureType = (typeof failureTypes)[number];
export type SimulationStatus = "idle" | "playing" | "paused" | "completed" | "failed";

export type SimulationAction =
  | "create-request"
  | "send-request"
  | "log-request"
  | "validate-request"
  | "match-route"
  | "call-service"
  | "query-database"
  | "compare-password"
  | "hash-password"
  | "create-token"
  | "send-response"
  | "show-result"
  | "enter-server"
  | "run-controller"
  | "return-record"
  | "create-record"
  | "read-record"
  | "update-record"
  | "delete-record"
  | "authenticate"
  | "authorize"
  | "upload-code"
  | "build-application"
  | "run-tests"
  | "start-application"
  | "connect-domain"
  | "publish-application";

export type InspectorPayload = {
  kind: PacketKind;
  headline: string;
  method?: HttpMethod;
  path?: string;
  statusCode?: number;
  headers: ReadonlyArray<{ name: string; value: string }>;
  body?: string;
};

export type SimulationStep = {
  id: string;
  title: string;
  description: string;
  source: SystemNodeKind;
  target?: SystemNodeKind;
  duration: number;
  action: SimulationAction;
  inspectable: boolean;
  pauseAfter?: boolean;
  instructorPrompt?: string;
  payload?: InspectorPayload;
};

export type FailureRule = {
  type: FailureType;
  stopAtStepId: string;
  statusCode: number;
  title: string;
  explanation: string;
};

export type FailureResult = FailureRule & {
  stepIndex: number;
};

export type SimulationDefinition = {
  id: string;
  title: string;
  steps: readonly SimulationStep[];
  failureRules: Partial<Record<FailureType, FailureRule>>;
};

export type SimulationSnapshot = {
  currentStepIndex: number;
  status: SimulationStatus;
  speed: SimulationSpeed;
  selectedFailure: FailureType | null;
  failureResult: FailureResult | null;
  inspectedStepId: string | null;
};
