export type SystemNodeKind =
  | "browser"
  | "server"
  | "database"
  | "middleware"
  | "router"
  | "controller"
  | "service"
  | "user"
  | "token"
  | "code"
  | "repository"
  | "build"
  | "tests"
  | "cloud"
  | "domain";

export type PacketKind = "request" | "response";

export type PacketState = "idle" | "travelling" | "paused" | "success" | "error";

export type SystemNodeState =
  | "default"
  | "loading"
  | "active"
  | "paused"
  | "inspected"
  | "success"
  | "rejected"
  | "error"
  | "disabled";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
