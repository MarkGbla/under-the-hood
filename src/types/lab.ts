import type { FailureType } from "@/simulations/engine/types";
import type { HttpMethod } from "./simulation";
import type { PermissionAction, SimulatedUser, UserRole } from "./permission";

export type ScenarioOption = {
  id: string;
  label: string;
  description: string;
  failure: FailureType | null;
  statusCode: 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500;
};

export type FlowLabConfig = {
  kind: "flow";
  scenarios: ScenarioOption[];
};

export type HttpScenario = ScenarioOption & {
  method: HttpMethod;
  endpoint: string;
  body: string;
  responseBody: string;
};

export type HttpLabConfig = {
  kind: "http";
  scenarios: HttpScenario[];
};

export type DatabaseRecord = {
  id: number;
  name: string;
  role: UserRole;
};

export type CrudLabConfig = {
  kind: "crud";
  initialRecords: DatabaseRecord[];
};

export type AuthLabConfig = {
  kind: "auth";
  users: SimulatedUser[];
  actions: Array<{ id: PermissionAction; label: string; endpoint: string }>;
};

export type MiddlewareLabConfig = {
  kind: "middleware";
  checkpoints: Array<{ id: "logging" | "authentication" | "validation"; label: string; description: string }>;
};

export type DeploymentLabConfig = {
  kind: "deployment";
  environments: Array<{ id: "local" | "staging" | "production"; label: string; description: string }>;
  scenarios: ScenarioOption[];
};

export type LessonLabConfig = FlowLabConfig | HttpLabConfig | CrudLabConfig | AuthLabConfig | MiddlewareLabConfig | DeploymentLabConfig;
