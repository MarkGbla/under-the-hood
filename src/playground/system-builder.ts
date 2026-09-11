import type { HttpMethod, SystemNodeKind } from "@/types/simulation";

export type BuilderComponentKind = Extract<
  SystemNodeKind,
  "browser" | "router" | "middleware" | "server" | "controller" | "service" | "database"
>;

export type BuilderMissionId = "login" | "signup" | "profile";
export type BuilderPrediction = "success" | BuilderComponentKind;

export type BuilderNode = {
  id: string;
  kind: BuilderComponentKind;
  working: boolean;
};

export type BuilderConnection = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
};

export type BuilderMission = {
  id: BuilderMissionId;
  title: string;
  description: string;
  method: HttpMethod;
  path: string;
  successCode: 200 | 201;
  successTitle: string;
  required: readonly BuilderComponentKind[];
};

export type BuilderComponentDefinition = {
  kind: BuilderComponentKind;
  name: string;
  shortName: string;
  purpose: string;
  passes: string;
  setting: string;
  workingLabel: string;
  brokenLabel: string;
};

export type BuilderIssue = {
  id: string;
  title: string;
  explanation: string;
  fix: string;
  nodeId?: string;
};

export type BuilderTraceStep = {
  nodeId: string;
  kind: BuilderComponentKind;
  title: string;
  detail: string;
  outcome: "passed" | "failed" | "waiting";
};

export type BuilderResult = {
  kind: "success" | "design-error" | "runtime-error";
  statusCode: number;
  title: string;
  reason: string;
  fix: string;
  failingNodeId?: string;
  issues: BuilderIssue[];
  trace: BuilderTraceStep[];
};

export const builderComponents: readonly BuilderComponentDefinition[] = [
  {
    kind: "browser",
    name: "Browser",
    shortName: "Client",
    purpose: "Creates the request and displays the response for the user.",
    passes: "Sends the request to the route layer.",
    setting: "Request body",
    workingLabel: "Valid request",
    brokenLabel: "Malformed request",
  },
  {
    kind: "router",
    name: "Router",
    shortName: "Route",
    purpose: "Matches the HTTP method and path to the correct handler.",
    passes: "Forwards a matched request to the next check.",
    setting: "Route match",
    workingLabel: "Route exists",
    brokenLabel: "Route missing",
  },
  {
    kind: "middleware",
    name: "Middleware",
    shortName: "Guard",
    purpose: "Checks or transforms a request before application logic runs.",
    passes: "Forwards an accepted request to the server.",
    setting: "Request check",
    workingLabel: "Check passes",
    brokenLabel: "Check rejects",
  },
  {
    kind: "server",
    name: "Server",
    shortName: "Logic",
    purpose: "Runs application rules and coordinates data access.",
    passes: "Asks the database for the mission data.",
    setting: "Handler",
    workingLabel: "Handler ready",
    brokenLabel: "Handler throws",
  },
  {
    kind: "controller",
    name: "Controller",
    shortName: "Action",
    purpose: "Translates the matched request into the application operation that should run.",
    passes: "Calls the service responsible for the operation.",
    setting: "Request action",
    workingLabel: "Action selected",
    brokenLabel: "Action fails",
  },
  {
    kind: "service",
    name: "Service",
    shortName: "Rules",
    purpose: "Applies the business rules that decide what the application is allowed to do.",
    passes: "Sends an approved data operation to storage.",
    setting: "Business rule",
    workingLabel: "Rule passes",
    brokenLabel: "Rule rejects",
  },
  {
    kind: "database",
    name: "Database",
    shortName: "Data",
    purpose: "Reads or writes persistent records for the server.",
    passes: "Returns the data result to the server.",
    setting: "Data condition",
    workingLabel: "Data check passes",
    brokenLabel: "Data check fails",
  },
] as const;

export const builderMissions: readonly BuilderMission[] = [
  {
    id: "login",
    title: "Log a user in",
    description: "Build a protected request that verifies the user before loading their account.",
    method: "POST",
    path: "/api/login",
    successCode: 200,
    successTitle: "Session created",
    required: ["browser", "router", "middleware", "server", "database"],
  },
  {
    id: "signup",
    title: "Create an account",
    description: "Build a signup request that validates input and stores a new user.",
    method: "POST",
    path: "/api/signup",
    successCode: 201,
    successTitle: "Account created",
    required: ["browser", "router", "server", "service", "database"],
  },
  {
    id: "profile",
    title: "Load a profile",
    description: "Build a read request that finds a route, runs server logic, and loads saved data.",
    method: "GET",
    path: "/api/profile",
    successCode: 200,
    successTitle: "Profile returned",
    required: ["browser", "router", "server", "controller", "service", "database"],
  },
] as const;

const stageOrder: Record<BuilderComponentKind, number> = {
  browser: 0,
  router: 1,
  middleware: 2,
  server: 3,
  controller: 4,
  service: 5,
  database: 6,
};

export function getBuilderMission(id: BuilderMissionId) {
  return builderMissions.find((mission) => mission.id === id) ?? builderMissions[0];
}

export function getBuilderComponent(kind: BuilderComponentKind) {
  return builderComponents.find((component) => component.kind === kind) ?? builderComponents[0];
}

export function buildStarterSystem(missionId: BuilderMissionId, broken = false): BuilderNode[] {
  const mission = getBuilderMission(missionId);
  return mission.required.map((kind, index) => ({
    id: `${missionId}-${kind}-${index + 1}`,
    kind,
    working: !(broken && kind === "database"),
  }));
}

export function buildStarterConnections(nodes: readonly BuilderNode[]): BuilderConnection[] {
  return nodes.slice(0, -1).map((node, index) => ({
    id: `connection-${node.id}-${nodes[index + 1].id}`,
    sourceNodeId: node.id,
    targetNodeId: nodes[index + 1].id,
  }));
}

export function inspectSystem(nodes: readonly BuilderNode[], missionId: BuilderMissionId): BuilderIssue[] {
  const mission = getBuilderMission(missionId);
  const issues: BuilderIssue[] = [];

  if (nodes.length === 0) {
    return [{
      id: "empty-system",
      title: "The canvas is empty",
      explanation: "There is no client to create a request and no route for it to follow.",
      fix: "Add a Browser first, then build toward a Server and Database.",
    }];
  }

  if (nodes[0].kind !== "browser") {
    issues.push({
      id: "missing-start",
      title: "The request has no starting client",
      explanation: `${getBuilderComponent(nodes[0].kind).name} cannot create the user request in this model.`,
      fix: "Move a Browser to the first position.",
      nodeId: nodes[0].id,
    });
  }

  for (const requiredKind of mission.required) {
    if (!nodes.some((node) => node.kind === requiredKind)) {
      const definition = getBuilderComponent(requiredKind);
      issues.push({
        id: `missing-${requiredKind}`,
        title: `${definition.name} is missing`,
        explanation: `${mission.title} needs the ${definition.name.toLowerCase()} to ${definition.purpose.toLowerCase()}`,
        fix: `Add ${definition.name} from the component shelf.`,
      });
    }
  }

  for (const component of builderComponents) {
    const matches = nodes.filter((node) => node.kind === component.kind);
    if (matches.length > 1) {
      issues.push({
        id: `duplicate-${component.kind}`,
        title: `More than one ${component.name}`,
        explanation: "This beginner model uses one clear responsibility at each stage so the request has an unambiguous path.",
        fix: `Remove the extra ${component.name} component.`,
        nodeId: matches[1].id,
      });
    }
  }

  for (let index = 1; index < nodes.length; index += 1) {
    const previous = nodes[index - 1];
    const current = nodes[index];
    if (stageOrder[current.kind] < stageOrder[previous.kind]) {
      issues.push({
        id: `order-${previous.id}-${current.id}`,
        title: `${getBuilderComponent(current.kind).name} is in the wrong place`,
        explanation: `The request cannot move backward from ${getBuilderComponent(previous.kind).name} to ${getBuilderComponent(current.kind).name} in this simplified flow.`,
        fix: `Move ${getBuilderComponent(current.kind).name} earlier in the system.`,
        nodeId: current.id,
      });
      break;
    }
  }

  return issues;
}

export function inspectConnectedSystem(
  nodes: readonly BuilderNode[],
  connections: readonly BuilderConnection[],
  missionId: BuilderMissionId,
) {
  if (nodes.length === 0) {
    return { path: [] as BuilderNode[], issues: inspectSystem(nodes, missionId) };
  }

  const issues: BuilderIssue[] = [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const browserNodes = nodes.filter((node) => node.kind === "browser");

  for (const connection of connections) {
    if (!nodeById.has(connection.sourceNodeId) || !nodeById.has(connection.targetNodeId)) {
      issues.push({
        id: `dangling-${connection.id}`,
        title: "A connector has a missing endpoint",
        explanation: "The request line points to a component that is no longer on the canvas.",
        fix: "Remove the loose connector and connect two existing components.",
      });
    } else if (connection.sourceNodeId === connection.targetNodeId) {
      issues.push({
        id: `self-${connection.id}`,
        title: "A component connects to itself",
        explanation: "The request would stay inside one component instead of moving through the system.",
        fix: "Remove the loop and connect this component to the next responsibility.",
        nodeId: connection.sourceNodeId,
      });
    }
  }

  if (browserNodes.length === 0) {
    issues.push({
      id: "missing-browser",
      title: "Browser is missing",
      explanation: "There is no client component to create the user request.",
      fix: "Add a Browser from the component library and connect it to the first server-side component.",
    });
    return { path: [] as BuilderNode[], issues };
  }

  if (browserNodes.length > 1) {
    issues.push({
      id: "multiple-browsers",
      title: "The request has more than one starting point",
      explanation: "This learning model follows one request from one Browser, so it needs one unambiguous start.",
      fix: "Keep one Browser and remove the others.",
      nodeId: browserNodes[1].id,
    });
  }

  const validConnections = connections.filter((connection) =>
    nodeById.has(connection.sourceNodeId)
    && nodeById.has(connection.targetNodeId)
    && connection.sourceNodeId !== connection.targetNodeId
  );
  const outgoing = new Map<string, BuilderConnection[]>();
  const incoming = new Map<string, BuilderConnection[]>();

  for (const connection of validConnections) {
    outgoing.set(connection.sourceNodeId, [...(outgoing.get(connection.sourceNodeId) ?? []), connection]);
    incoming.set(connection.targetNodeId, [...(incoming.get(connection.targetNodeId) ?? []), connection]);
  }

  for (const [nodeId, nodeConnections] of outgoing) {
    if (nodeConnections.length > 1) {
      issues.push({
        id: `branch-${nodeId}`,
        title: `${getBuilderComponent(nodeById.get(nodeId)!.kind).name} sends the request in two directions`,
        explanation: "This beginner test runner needs one clear path so each decision has one observable consequence.",
        fix: "Remove one outgoing connector. Branching systems can be introduced after the single-path model is understood.",
        nodeId,
      });
    }
  }

  for (const [nodeId, nodeConnections] of incoming) {
    if (nodeConnections.length > 1) {
      issues.push({
        id: `merge-${nodeId}`,
        title: `${getBuilderComponent(nodeById.get(nodeId)!.kind).name} has two incoming request paths`,
        explanation: "The test runner cannot tell which request history should be inspected at this merge point.",
        fix: "Remove one incoming connector to create a single request path.",
        nodeId,
      });
    }
  }

  const path: BuilderNode[] = [];
  const visited = new Set<string>();
  let current: BuilderNode | undefined = browserNodes[0];

  while (current && !visited.has(current.id)) {
    path.push(current);
    visited.add(current.id);
    const nextConnection = outgoing.get(current.id)?.[0];
    if (!nextConnection) break;
    const nextNode = nodeById.get(nextConnection.targetNodeId);
    if (nextNode && visited.has(nextNode.id)) {
      issues.push({
        id: `cycle-${nextNode.id}`,
        title: "The request path contains a loop",
        explanation: `The connector returns to ${getBuilderComponent(nextNode.kind).name}, so the request would repeat instead of returning a response.`,
        fix: "Remove the connector that points backward and connect the path toward its final data component.",
        nodeId: nextNode.id,
      });
      break;
    }
    current = nextNode;
  }

  const disconnected = nodes.filter((node) => !visited.has(node.id));
  if (disconnected.length > 0) {
    const firstDisconnected = disconnected[0];
    issues.push({
      id: `disconnected-${firstDisconnected.id}`,
      title: `${getBuilderComponent(firstDisconnected.kind).name} is not on the request path`,
      explanation: "The component is on the canvas, but no continuous connector path reaches it from the Browser.",
      fix: `Connect ${getBuilderComponent(firstDisconnected.kind).name} into the path that starts at the Browser.`,
      nodeId: firstDisconnected.id,
    });
  }

  issues.push(...inspectSystem(path, missionId));

  return {
    path,
    issues: issues.filter((issue, index, all) => all.findIndex((item) => item.id === issue.id) === index),
  };
}

function failureForNode(node: BuilderNode, mission: BuilderMission) {
  if (node.kind === "browser") {
    return {
      statusCode: 400,
      title: "Request rejected",
      reason: `The Browser created a malformed ${mission.method} ${mission.path} request, so the system could not safely process it.`,
      fix: "Select the Browser and change Request body to Valid request.",
    };
  }
  if (node.kind === "router") {
    return {
      statusCode: 404,
      title: "Route not found",
      reason: `The Router has no match for ${mission.method} ${mission.path}, so the request never reaches application logic.`,
      fix: "Select the Router and change Route match to Route exists.",
    };
  }
  if (node.kind === "middleware") {
    return {
      statusCode: mission.id === "signup" ? 400 : 401,
      title: mission.id === "signup" ? "Validation failed" : "Identity not verified",
      reason: mission.id === "signup"
        ? "Middleware rejected the signup fields before the server could create an account."
        : "Middleware could not verify the request, so the protected operation stopped before the server.",
      fix: "Select Middleware and change Request check to Check passes.",
    };
  }
  if (node.kind === "server") {
    return {
      statusCode: 500,
      title: "Handler failed",
      reason: "The request reached the Server, but its handler threw an unexpected application error.",
      fix: "Select the Server and change Handler to Handler ready.",
    };
  }
  if (node.kind === "controller") {
    return {
      statusCode: 500,
      title: "Controller action failed",
      reason: "The Controller received the request but could not translate it into a valid application operation.",
      fix: "Select the Controller and change Request action to Action selected.",
    };
  }
  if (node.kind === "service") {
    return {
      statusCode: 500,
      title: "Business rule failed",
      reason: "The Service stopped the operation while applying the application’s business rules.",
      fix: "Select the Service and change Business rule to Rule passes.",
    };
  }
  if (mission.id === "signup") {
    return {
      statusCode: 409,
      title: "Email already exists",
      reason: "The Database found an existing user with the same email, so creating another account would conflict.",
      fix: "Select the Database and change Data condition to Data check passes.",
    };
  }
  if (mission.id === "login") {
    return {
      statusCode: 401,
      title: "Credentials did not match",
      reason: "The Database could not find a user record that matches the submitted credentials.",
      fix: "Select the Database and change Data condition to Data check passes.",
    };
  }
  return {
    statusCode: 404,
    title: "Profile not found",
    reason: "The Database completed the lookup but could not find the requested profile record.",
    fix: "Select the Database and change Data condition to Data check passes.",
  };
}

export function evaluateSystem(nodes: readonly BuilderNode[], missionId: BuilderMissionId): BuilderResult {
  const mission = getBuilderMission(missionId);
  const issues = inspectSystem(nodes, missionId);

  if (issues.length > 0) {
    const firstIssue = issues[0];
    return {
      kind: "design-error",
      statusCode: 400,
      title: "System cannot run yet",
      reason: firstIssue.explanation,
      fix: firstIssue.fix,
      failingNodeId: firstIssue.nodeId,
      issues,
      trace: nodes.map((node) => ({
        nodeId: node.id,
        kind: node.kind,
        title: getBuilderComponent(node.kind).name,
        detail: node.id === firstIssue.nodeId ? firstIssue.title : "Waiting for a runnable design.",
        outcome: node.id === firstIssue.nodeId ? "failed" : "waiting",
      })),
    };
  }

  const failingIndex = nodes.findIndex((node) => !node.working);
  if (failingIndex >= 0) {
    const failingNode = nodes[failingIndex];
    const failure = failureForNode(failingNode, mission);
    return {
      kind: "runtime-error",
      ...failure,
      failingNodeId: failingNode.id,
      issues: [],
      trace: nodes.map((node, index) => ({
        nodeId: node.id,
        kind: node.kind,
        title: getBuilderComponent(node.kind).name,
        detail: index < failingIndex
          ? getBuilderComponent(node.kind).passes
          : index === failingIndex
            ? failure.reason
            : "The request stopped before reaching this component.",
        outcome: index < failingIndex ? "passed" : index === failingIndex ? "failed" : "waiting",
      })),
    };
  }

  return {
    kind: "success",
    statusCode: mission.successCode,
    title: mission.successTitle,
    reason: `${mission.method} ${mission.path} passed every component and returned a successful response to the Browser.`,
    fix: "The system works. Break one component or reorder the flow to test your mental model.",
    issues: [],
    trace: nodes.map((node) => ({
      nodeId: node.id,
      kind: node.kind,
      title: getBuilderComponent(node.kind).name,
      detail: getBuilderComponent(node.kind).passes,
      outcome: "passed",
    })),
  };
}

export function evaluateConnectedSystem(
  nodes: readonly BuilderNode[],
  connections: readonly BuilderConnection[],
  missionId: BuilderMissionId,
): BuilderResult {
  const inspection = inspectConnectedSystem(nodes, connections, missionId);
  if (inspection.issues.length === 0) return evaluateSystem(inspection.path, missionId);

  const firstIssue = inspection.issues[0];
  return {
    kind: "design-error",
    statusCode: 400,
    title: "System cannot run yet",
    reason: firstIssue.explanation,
    fix: firstIssue.fix,
    failingNodeId: firstIssue.nodeId,
    issues: inspection.issues,
    trace: inspection.path.map((node) => ({
      nodeId: node.id,
      kind: node.kind,
      title: getBuilderComponent(node.kind).name,
      detail: node.id === firstIssue.nodeId ? firstIssue.title : "Waiting for a runnable connected path.",
      outcome: node.id === firstIssue.nodeId ? "failed" : "waiting",
    })),
  };
}

export function predictionMatchesResult(prediction: BuilderPrediction | null, result: BuilderResult) {
  if (!prediction) return null;
  if (prediction === "success") return result.kind === "success";
  return result.failingNodeId
    ? result.trace.find((step) => step.nodeId === result.failingNodeId)?.kind === prediction
    : false;
}
