import { describe, expect, it } from "vitest";
import {
  buildStarterConnections,
  buildStarterSystem,
  evaluateConnectedSystem,
  evaluateSystem,
  inspectConnectedSystem,
  inspectSystem,
  predictionMatchesResult,
} from "./system-builder";

describe("system builder engine", () => {
  it("runs a valid login system successfully", () => {
    const result = evaluateSystem(buildStarterSystem("login"), "login");

    expect(result.kind).toBe("success");
    expect(result.statusCode).toBe(200);
    expect(result.trace.every((step) => step.outcome === "passed")).toBe(true);
  });

  it("explains a broken database using the mission context", () => {
    const result = evaluateSystem(buildStarterSystem("signup", true), "signup");

    expect(result.kind).toBe("runtime-error");
    expect(result.statusCode).toBe(409);
    expect(result.title).toBe("Email already exists");
    expect(result.failingNodeId).toContain("database");
  });

  it("finds missing and misplaced components before execution", () => {
    const nodes = buildStarterSystem("profile").filter((node) => node.kind !== "router");
    const reordered = [nodes[1], nodes[0], ...nodes.slice(2)];
    const issues = inspectSystem(reordered, "profile");

    expect(issues.some((issue) => issue.id === "missing-router")).toBe(true);
    expect(issues.some((issue) => issue.id === "missing-start")).toBe(true);
  });

  it("compares a prediction with the actual stopping component", () => {
    const result = evaluateSystem(buildStarterSystem("login", true), "login");

    expect(predictionMatchesResult("database", result)).toBe(true);
    expect(predictionMatchesResult("router", result)).toBe(false);
  });

  it("runs a connected canvas by following connectors from the Browser", () => {
    const nodes = buildStarterSystem("profile");
    const result = evaluateConnectedSystem(nodes, buildStarterConnections(nodes), "profile");

    expect(result.kind).toBe("success");
    expect(result.trace.map((step) => step.kind)).toEqual(["browser", "router", "server", "controller", "service", "database"]);
  });

  it("explains disconnected components and loops before a request runs", () => {
    const nodes = buildStarterSystem("login");
    const connections = buildStarterConnections(nodes).slice(0, 2);
    const disconnected = inspectConnectedSystem(nodes, connections, "login");
    const looped = inspectConnectedSystem(nodes, [
      ...buildStarterConnections(nodes),
      { id: "loop", sourceNodeId: nodes[4].id, targetNodeId: nodes[1].id },
    ], "login");

    expect(disconnected.issues.some((issue) => issue.id.startsWith("disconnected-"))).toBe(true);
    expect(looped.issues.some((issue) => issue.id.startsWith("cycle-"))).toBe(true);
  });
});
