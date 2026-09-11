import { createFailureRule } from "@/simulations/engine/failures";
import type { SimulationStep } from "@/simulations/engine/types";
import type { Challenge, Lesson, LessonAccent, LessonQuestion, LessonVisualNode } from "@/types/lesson";

const requestPayload = (headline: string, path: string, body?: string) => ({
  kind: "request" as const,
  headline,
  method: headline.split(" ")[0] as "GET" | "POST" | "PATCH" | "DELETE",
  path,
  headers: [{ name: "Accept", value: "application/json" }],
  body,
});

const responsePayload = (statusCode: number, headline: string, body: string) => ({
  kind: "response" as const,
  headline,
  statusCode,
  headers: [{ name: "Content-Type", value: "application/json" }],
  body,
});

function makeLesson(input: Omit<Lesson, "status">): Lesson {
  return { ...input, status: "available" };
}

const requestLifecycleSteps: SimulationStep[] = [
  { id: "request-created", title: "Request created", description: "The browser creates GET /api/profile.", source: "browser", target: "server", duration: 800, action: "create-request", inspectable: true, payload: requestPayload("GET /api/profile", "/api/profile") },
  { id: "server-received", title: "Server receives request", description: "The server accepts the HTTP request at its public boundary.", source: "server", target: "router", duration: 650, action: "enter-server", inspectable: false, pauseAfter: true },
  { id: "router", title: "Router matches route", description: "The router chooses the profile handler for this method and path.", source: "router", target: "controller", duration: 650, action: "match-route", inspectable: true, instructorPrompt: "Ask: What would happen if no route matched?" },
  { id: "controller", title: "Controller coordinates", description: "The controller receives the request and coordinates the work.", source: "controller", target: "service", duration: 650, action: "run-controller", inspectable: false },
  { id: "service", title: "Service runs logic", description: "The service applies the application rule for loading a profile.", source: "service", target: "database", duration: 650, action: "call-service", inspectable: false },
  { id: "database-query", title: "Database finds record", description: "The database returns the simulated user record.", source: "database", target: "service", duration: 780, action: "query-database", inspectable: true, pauseAfter: true, payload: requestPayload("GET users/42", "users/42") },
  { id: "response-created", title: "Response created", description: "The server packages the profile in a 200 response.", source: "server", target: "browser", duration: 720, action: "send-response", inspectable: true, payload: responsePayload(200, "200 OK", '{\n  "id": 42,\n  "name": "Mariama"\n}') },
  { id: "browser-updated", title: "Browser updates", description: "The browser reads the response and shows the profile.", source: "browser", duration: 700, action: "show-result", inspectable: false },
];

const httpSteps: SimulationStep[] = [
  { id: "request-created", title: "Packet prepared", description: "The browser prepares a method, endpoint, headers, and optional body.", source: "browser", target: "server", duration: 750, action: "create-request", inspectable: true, payload: requestPayload("GET /api/users/42", "/api/users/42") },
  { id: "request-sent", title: "Request travels", description: "The HTTP request travels from browser to server.", source: "browser", target: "server", duration: 700, action: "send-request", inspectable: true, pauseAfter: true, payload: requestPayload("GET /api/users/42", "/api/users/42") },
  { id: "validation-middleware", title: "Request validated", description: "The server checks whether required input can be used.", source: "middleware", target: "router", duration: 620, action: "validate-request", inspectable: false },
  { id: "router", title: "Endpoint matched", description: "The router checks whether the method and endpoint have a handler.", source: "router", target: "controller", duration: 620, action: "match-route", inspectable: false },
  { id: "handler", title: "Handler runs", description: "Application logic reads or changes the requested resource.", source: "controller", target: "server", duration: 700, action: "run-controller", inspectable: false },
  { id: "response-sent", title: "Response returns", description: "A separate response packet returns a status, headers, and body.", source: "server", target: "browser", duration: 760, action: "send-response", inspectable: true, pauseAfter: true, payload: responsePayload(200, "200 OK", '{\n  "id": 42,\n  "name": "Mariama"\n}') },
];

const crudSteps: SimulationStep[] = [
  { id: "request-created", title: "CRUD request created", description: "The browser maps the chosen CRUD operation to an HTTP request.", source: "browser", target: "server", duration: 650, action: "create-request", inspectable: true, payload: requestPayload("POST /api/users", "/api/users", '{\n  "name": "Ibrahim",\n  "role": "Student"\n}') },
  { id: "validation-middleware", title: "Input checked", description: "Validation rejects unusable record data before it reaches storage.", source: "middleware", target: "controller", duration: 600, action: "validate-request", inspectable: false },
  { id: "controller", title: "Operation selected", description: "The controller chooses Create, Read, Update, or Delete logic.", source: "controller", target: "database", duration: 650, action: "run-controller", inspectable: false },
  { id: "database-query", title: "Database changes", description: "The disposable in-browser table applies the operation.", source: "database", target: "server", duration: 800, action: "query-database", inspectable: true, pauseAfter: true, payload: requestPayload("INSERT users", "users") },
  { id: "response-sent", title: "Result returned", description: "The server reports the operation outcome to the browser.", source: "server", target: "browser", duration: 700, action: "send-response", inspectable: true, payload: responsePayload(201, "201 Created", '{\n  "created": true\n}') },
];

const authSteps: SimulationStep[] = [
  { id: "protected-request", title: "Protected request", description: "The browser requests a resource that requires identity and permission.", source: "browser", target: "middleware", duration: 700, action: "send-request", inspectable: true, payload: requestPayload("GET /api/profile", "/api/profile") },
  { id: "authentication-middleware", title: "Authentication", description: "Authentication asks: Who are you? It verifies the simulated token.", source: "middleware", target: "user", duration: 760, action: "authenticate", inspectable: true, pauseAfter: true, instructorPrompt: "Ask: Does knowing identity automatically grant every permission?" },
  { id: "authorization-middleware", title: "Authorization", description: "Authorization asks: What are you allowed to do? It checks role permissions.", source: "middleware", target: "controller", duration: 760, action: "authorize", inspectable: true, pauseAfter: true },
  { id: "response-sent", title: "Decision returned", description: "The server returns an outcome that distinguishes identity from permission.", source: "server", target: "browser", duration: 700, action: "send-response", inspectable: true, payload: responsePayload(200, "200 OK", '{\n  "allowed": true\n}') },
];

const middlewareSteps: SimulationStep[] = [
  { id: "request-entry", title: "Request enters", description: "The request enters an ordered middleware pipeline.", source: "browser", target: "middleware", duration: 650, action: "send-request", inspectable: true, payload: requestPayload("POST /api/profile", "/api/profile", '{\n  "name": "Mariama"\n}') },
  { id: "logging-middleware", title: "Logging checkpoint", description: "Logging records safe request metadata and lets the request continue.", source: "middleware", target: "middleware", duration: 600, action: "log-request", inspectable: true },
  { id: "authentication-middleware", title: "Authentication checkpoint", description: "Authentication verifies identity before protected logic.", source: "middleware", target: "middleware", duration: 680, action: "authenticate", inspectable: false, pauseAfter: true },
  { id: "validation-middleware", title: "Validation checkpoint", description: "Validation checks the shape of submitted input.", source: "middleware", target: "controller", duration: 680, action: "validate-request", inspectable: false, pauseAfter: true },
  { id: "controller", title: "Controller reached", description: "Only a request that passes enabled checkpoints reaches application logic.", source: "controller", target: "server", duration: 700, action: "run-controller", inspectable: false },
  { id: "response-sent", title: "Response returned", description: "The result explains every passed, skipped, or rejected checkpoint.", source: "server", target: "browser", duration: 700, action: "send-response", inspectable: true, payload: responsePayload(200, "200 OK", '{\n  "updated": true\n}') },
];

const deploymentSteps: SimulationStep[] = [
  { id: "local-code", title: "Application is local", description: "The application currently runs only on the developer's laptop.", source: "code", target: "repository", duration: 620, action: "upload-code", inspectable: true },
  { id: "git-push", title: "Code pushed", description: "A Git push sends a version of the code to a shared repository.", source: "code", target: "repository", duration: 650, action: "upload-code", inspectable: false },
  { id: "repository", title: "Repository received", description: "The deployment system reads the selected revision from the repository.", source: "repository", target: "build", duration: 650, action: "return-record", inspectable: true },
  { id: "build", title: "Application built", description: "Source files become an optimized application artifact.", source: "build", target: "tests", duration: 760, action: "build-application", inspectable: true, pauseAfter: true },
  { id: "deployment-tests", title: "Tests run", description: "Required tests must pass before this version can reach production.", source: "tests", target: "cloud", duration: 820, action: "run-tests", inspectable: true, pauseAfter: true, instructorPrompt: "Ask: Why should a failed test stop this version here?" },
  { id: "cloud-start", title: "Application started", description: "The verified build starts on an internet-accessible cloud server.", source: "cloud", target: "domain", duration: 760, action: "start-application", inspectable: false },
  { id: "domain-connected", title: "Domain connected", description: "A domain gives users a stable address for the deployed application.", source: "domain", target: "user", duration: 700, action: "connect-domain", inspectable: false },
  { id: "live", title: "Production is live", description: "Users can now reach this tested version over the internet.", source: "user", duration: 700, action: "publish-application", inspectable: true },
];

const flowNodes = (nodes: LessonVisualNode[]) => nodes;

export const curriculum: Lesson[] = [
  makeLesson({
    id: "lesson-request-lifecycle-v1", slug: "request-lifecycle", index: 1, title: "How a Web Request Works", shortTitle: "Request lifecycle", description: "Follow a request from a browser through application logic and back again.", question: "What really happens after you click a button?", concepts: ["Client", "Server", "Router", "Controller", "Service", "Database"], accent: "coral", objective: "Explain how a browser request travels through a simplified backend and returns as a response.", simulationId: "request-lifecycle-v1",
    hook: { prompt: "You clicked Get Profile. What do you think happens next?", actionLabel: "Get Profile" },
    prediction: { id: "request-prediction-v1", type: "multiple-choice", prompt: "What happens first after the click?", options: [{ id: "direct-db", label: "The browser talks directly to the database" }, { id: "request-server", label: "The browser sends a request to a server" }, { id: "db-browser", label: "The database contacts the browser" }], correctOptionId: "request-server", explanation: "The browser normally sends an HTTP request to a server. Server-side components decide whether and how to use the database." },
    challenges: [{ id: "request-order-v1", instruction: "Put the simplified request lifecycle in order.", expectedState: ["browser-out", "server-in", "controller", "database", "server-out", "browser-in"], hint: "The browser starts and ends the sequence; the database stays behind the server.", explanation: "The browser sends to the server; application logic may query the database; then the server responds to the browser.", question: { id: "request-order-question-v1", type: "ordering", prompt: "Arrange the complete round trip.", items: [{ id: "database", label: "Database" }, { id: "browser-out", label: "Browser sends" }, { id: "server-out", label: "Server responds" }, { id: "controller", label: "Controller" }, { id: "browser-in", label: "Browser updates" }, { id: "server-in", label: "Server receives" }], correctOrder: ["browser-out", "server-in", "controller", "database", "server-out", "browser-in"], explanation: "This is the simplified full round trip." } }],
    assessment: { id: "request-assessment-v1", type: "multiple-choice", prompt: "Why does the browser usually not contact the application database directly?", options: [{ id: "server-rules", label: "The server applies routes, permissions, and application rules before data access" }, { id: "db-offline", label: "Databases cannot communicate over networks" }, { id: "browser-slower", label: "Browsers are always slower than servers" }], correctOptionId: "server-rules", explanation: "The server protects data and coordinates application behavior." },
    finalExplanation: "A browser acts as the client. It sends a request to a server, where routing and application logic may read a database. The server returns a response, and the browser updates what the user sees.", finalPrompt: "Explain the round trip from Get Profile to the visible profile.", instructorPrompt: "Ask the class to name the first component they cannot directly see.", simulation: { id: "request-lifecycle-v1", title: "Get Profile request", steps: requestLifecycleSteps, failureRules: { "missing-route": createFailureRule("missing-route", "router") } },
    lab: { kind: "flow", scenarios: [
      { id: "profile-found", label: "Request a profile that exists", description: "Route matches, record found", failure: null, statusCode: 200 },
      { id: "profile-no-route", label: "Request a path the server does not handle", description: "No matching route", failure: "missing-route", statusCode: 404 },
    ] },
    visualNodes: flowNodes([{ id: "browser", label: "Browser", detail: "Client", kind: "browser", startStep: 0, endStep: 0 }, { id: "server", label: "Server", detail: "Backend boundary", kind: "server", startStep: 1, endStep: 1 }, { id: "router", label: "Router", detail: "Matches route", kind: "router", startStep: 2, endStep: 2 }, { id: "controller", label: "Controller", detail: "Coordinates", kind: "controller", startStep: 3, endStep: 3 }, { id: "service", label: "Service", detail: "Business logic", kind: "service", startStep: 4, endStep: 4 }, { id: "database", label: "Database", detail: "Stored data", kind: "database", startStep: 5, endStep: 5 }, { id: "response", label: "Response", detail: "Back to browser", kind: "browser", startStep: 6, endStep: 7 }]),
  }),
  makeLesson({
    id: "lesson-http-v1", slug: "http", index: 2, title: "HTTP Request & Response", shortTitle: "HTTP", description: "Open the packets travelling between a browser and server and inspect what is inside.", question: "What does a browser actually send?", concepts: ["Method", "Endpoint", "Headers", "Body", "Status"], accent: "blue", objective: "Inspect HTTP requests and responses, change requests, and predict common status outcomes.", prerequisiteIds: ["lesson-request-lifecycle-v1"], simulationId: "http-v1",
    hook: { prompt: "A browser asks for user 42. What information must cross the network?", actionLabel: "Send request" },
    prediction: { id: "http-prediction-v1", type: "multiple-choice", prompt: "Which item belongs to the response rather than the request?", options: [{ id: "method", label: "GET method" }, { id: "endpoint", label: "/api/users/42 endpoint" }, { id: "status", label: "200 OK status" }], correctOptionId: "status", explanation: "The client chooses a method and endpoint. The server returns a status code in its response." },
    challenges: [{ id: "http-invalid-v1", instruction: "Predict what a POST /users request with no name should return.", expectedState: "400", hint: "The endpoint exists, but the input cannot be used.", explanation: "400 Bad Request means the request was malformed or missing required input.", question: { id: "http-invalid-question-v1", type: "multiple-choice", prompt: "POST /users with a missing name returns…", options: [{ id: "200", label: "200 OK" }, { id: "400", label: "400 Bad Request" }, { id: "404", label: "404 Not Found" }], correctOptionId: "400", explanation: "The route exists; validation rejects its missing input." } }, { id: "http-route-v1", instruction: "Predict what GET /users/999 should return in this lesson.", expectedState: "404", hint: "The requested resource does not exist.", explanation: "404 Not Found says the requested route or resource was not found.", question: { id: "http-route-question-v1", type: "multiple-choice", prompt: "GET /users/999 returns…", options: [{ id: "201", label: "201 Created" }, { id: "400", label: "400 Bad Request" }, { id: "404", label: "404 Not Found" }], correctOptionId: "404", explanation: "The request is valid, but that user is missing." } }],
    assessment: { id: "http-assessment-v1", type: "multiple-choice", prompt: "Which statement is accurate?", options: [{ id: "same", label: "A request and response contain the same fields" }, { id: "pair", label: "A request asks; a separate response reports the outcome" }, { id: "body-required", label: "Every request must have a body" }], correctOptionId: "pair", explanation: "Requests and responses are related but distinct HTTP messages." },
    finalExplanation: "An HTTP request has a method, endpoint, headers, and sometimes a body. The server answers with a separate response containing a status, headers, and usually a body.", finalPrompt: "Explain what changes between an HTTP request and its response.", instructorPrompt: "Ask: Would changing GET to DELETE change the meaning of the request?", simulation: { id: "http-v1", title: "HTTP exchange", steps: httpSteps, failureRules: { "invalid-request": createFailureRule("invalid-request", "validation-middleware"), "missing-route": createFailureRule("missing-route", "router") } },
    lab: { kind: "http", scenarios: [
      { id: "read-user", label: "Read an existing user", description: "Record exists", failure: null, statusCode: 200, method: "GET", endpoint: "/api/users/42", body: "", responseBody: '{\n  "id": 42,\n  "name": "Mariama"\n}' },
      { id: "create-user", label: "Create a user", description: "Valid body", failure: null, statusCode: 201, method: "POST", endpoint: "/api/users", body: '{\n  "name": "Ibrahim"\n}', responseBody: '{\n  "id": 43,\n  "name": "Ibrahim"\n}' },
      { id: "create-user-no-name", label: "Create a user with no name", description: "Missing required field", failure: "invalid-request", statusCode: 400, method: "POST", endpoint: "/api/users", body: "{}", responseBody: '{\n  "error": "name is required"\n}' },
      { id: "read-missing-user", label: "Read a user that does not exist", description: "No such record", failure: "missing-route", statusCode: 404, method: "GET", endpoint: "/api/users/999", body: "", responseBody: '{\n  "error": "user not found"\n}' },
    ] },
    visualNodes: flowNodes([{ id: "browser", label: "Browser", detail: "Builds request", kind: "browser", startStep: 0, endStep: 1 }, { id: "middleware", label: "Validation", detail: "Checks input", kind: "middleware", startStep: 2, endStep: 2 }, { id: "router", label: "Router", detail: "Matches endpoint", kind: "router", startStep: 3, endStep: 3 }, { id: "controller", label: "Handler", detail: "Runs action", kind: "controller", startStep: 4, endStep: 4 }, { id: "response", label: "Response", detail: "Status + body", kind: "server", startStep: 5, endStep: 5 }]),
  }),
  makeLesson({
    id: "lesson-crud-v1", slug: "crud", index: 3, title: "CRUD + Database", shortTitle: "CRUD", description: "Create, read, update, and delete records while watching stored data change.", question: "How does an app change saved data?", concepts: ["Create", "Read", "Update", "Delete"], accent: "lime", objective: "Perform and distinguish the four basic operations applications use on stored data.", prerequisiteIds: ["lesson-http-v1"], simulationId: "crud-v1",
    hook: { prompt: "A user edits a profile. Which part of the stored record should visibly change?", actionLabel: "Open database lab" },
    prediction: { id: "crud-prediction-v1", type: "multiple-choice", prompt: "Which operation adds Ibrahim as a new user?", options: [{ id: "create", label: "Create" }, { id: "read", label: "Read" }, { id: "update", label: "Update" }], correctOptionId: "create", explanation: "Create adds a new record; Read retrieves an existing one." },
    challenges: [{ id: "crud-map-v1", instruction: "Match PATCH /users/1 to its database operation.", expectedState: "update", hint: "PATCH changes part of an existing resource.", explanation: "PATCH maps to Update in this scenario.", question: { id: "crud-map-question-v1", type: "multiple-choice", prompt: "PATCH /users/1 performs…", options: [{ id: "create", label: "Create" }, { id: "update", label: "Update" }, { id: "delete", label: "Delete" }], correctOptionId: "update", explanation: "PATCH updates selected fields on an existing record." } }],
    assessment: { id: "crud-assessment-v1", type: "multiple-choice", prompt: "What does CRUD describe?", options: [{ id: "storage-actions", label: "Four basic actions applications perform on stored data" }, { id: "database-brand", label: "A particular database product" }, { id: "security", label: "A user authentication method" }], correctOptionId: "storage-actions", explanation: "CRUD stands for Create, Read, Update, and Delete." },
    finalExplanation: "CRUD describes Create, Read, Update, and Delete. HTTP actions can ask server logic to apply these operations to stored records, then a response reports the result.", finalPrompt: "Explain how each CRUD operation changes—or does not change—the user table.", instructorPrompt: "Ask: Which CRUD operation should leave every row unchanged?", simulation: { id: "crud-v1", title: "User database CRUD", steps: crudSteps, failureRules: { "invalid-request": createFailureRule("invalid-request", "validation-middleware"), "missing-route": createFailureRule("missing-route", "database-query") } },
    lab: { kind: "crud", initialRecords: [
      { id: 1, name: "Mariama", role: "student" },
      { id: 2, name: "Abdul", role: "student" },
      { id: 3, name: "Sarah", role: "instructor" },
    ] },
    visualNodes: flowNodes([{ id: "browser", label: "Browser", detail: "Chooses action", kind: "browser", startStep: 0, endStep: 0 }, { id: "validation", label: "Validation", detail: "Checks record", kind: "middleware", startStep: 1, endStep: 1 }, { id: "controller", label: "Controller", detail: "Maps operation", kind: "controller", startStep: 2, endStep: 2 }, { id: "database", label: "Database", detail: "Changes rows", kind: "database", startStep: 3, endStep: 3 }, { id: "response", label: "Response", detail: "Reports result", kind: "server", startStep: 4, endStep: 4 }]),
  }),
  makeLesson({
    id: "lesson-auth-v1", slug: "auth", index: 4, title: "Authentication vs Authorization", shortTitle: "Auth", description: "See the difference between proving who you are and checking what you may do.", question: "Known user—but are they allowed in?", concepts: ["Identity", "Permission", "401", "403"], accent: "violet", objective: "Distinguish authentication from authorization and explain why 401 and 403 mean different things.", prerequisiteIds: ["lesson-crud-v1"], simulationId: "auth-v1",
    hook: { prompt: "The system knows Mariama is a student. Can she delete every user?", actionLabel: "Check access" },
    prediction: { id: "auth-prediction-v1", type: "multiple-choice", prompt: "Authentication succeeds but authorization fails. What does that mean?", options: [{ id: "unknown", label: "The system does not know the user's identity" }, { id: "known-denied", label: "The system knows the user but denies this action" }, { id: "server-down", label: "The server is unavailable" }], correctOptionId: "known-denied", explanation: "Authentication establishes identity; authorization separately checks permission." },
    challenges: [{ id: "auth-status-v1", instruction: "Choose the correct outcome for a valid student token requesting DELETE /admin/users.", expectedState: "403", hint: "Identity is valid, but the student role lacks this permission.", explanation: "403 Forbidden means the user is known but is not allowed to perform the action.", question: { id: "auth-status-question-v1", type: "multiple-choice", prompt: "Valid identity, insufficient role…", options: [{ id: "200", label: "200 OK" }, { id: "401", label: "401 Unauthorized" }, { id: "403", label: "403 Forbidden" }], correctOptionId: "403", explanation: "This is an authorization failure, not an authentication failure." } }],
    assessment: { id: "auth-assessment-v1", type: "multiple-choice", prompt: "Which comparison is correct?", options: [{ id: "correct", label: "Authentication: who are you? Authorization: what may you do?" }, { id: "reversed", label: "Authentication: what may you do? Authorization: who are you?" }, { id: "same", label: "They are two names for the same check" }], correctOptionId: "correct", explanation: "Identity is checked before permission, but success at one does not guarantee success at the other." },
    finalExplanation: "Authentication verifies who a user is. Authorization checks whether that known user may perform a specific action. Missing or invalid identity produces 401; valid identity without permission produces 403.", finalPrompt: "Explain the difference between authentication and authorization using 401 and 403.", instructorPrompt: "Ask: Can a user be authenticated and still be denied?", simulation: { id: "auth-v1", title: "Identity and permission", steps: authSteps, failureRules: { "missing-token": createFailureRule("missing-token", "authentication-middleware"), "invalid-token": createFailureRule("invalid-token", "authentication-middleware"), "wrong-role": createFailureRule("wrong-role", "authorization-middleware") } },
    lab: { kind: "auth", users: [
      { id: "mariama", name: "Mariama", role: "student", tokenState: "valid" },
      { id: "sarah", name: "Sarah", role: "instructor", tokenState: "valid" },
      { id: "aminata", name: "Aminata", role: "admin", tokenState: "valid" },
      { id: "signed-out", name: "Signed-out visitor", role: "student", tokenState: "missing" },
      { id: "expired", name: "Expired session", role: "student", tokenState: "invalid" },
    ], actions: [
      { id: "view-own-profile", label: "View own profile", endpoint: "GET /api/profile" },
      { id: "present-lesson", label: "Present a lesson", endpoint: "POST /api/lessons/present" },
      { id: "manage-users", label: "Manage all users", endpoint: "DELETE /admin/users" },
    ] },
    visualNodes: flowNodes([{ id: "browser", label: "Request", detail: "Protected action", kind: "browser", startStep: 0, endStep: 0 }, { id: "authentication", label: "Authentication", detail: "Who are you?", kind: "middleware", startStep: 1, endStep: 1 }, { id: "authorization", label: "Authorization", detail: "What may you do?", kind: "middleware", startStep: 2, endStep: 2 }, { id: "response", label: "Decision", detail: "200 / 401 / 403", kind: "server", startStep: 3, endStep: 3 }]),
  }),
  makeLesson({
    id: "lesson-middleware-v1", slug: "middleware", index: 5, title: "Middleware & Request Lifecycle", shortTitle: "Middleware", description: "Move requests through logging, authentication, and validation checkpoints.", question: "What checks a request before your code?", concepts: ["Logging", "Authentication", "Validation", "Order"], accent: "amber", objective: "Manipulate ordered middleware and explain which checkpoint stops a request and why.", prerequisiteIds: ["lesson-auth-v1"], simulationId: "middleware-v1",
    hook: { prompt: "Which checks should a protected request pass before the controller runs?", actionLabel: "Send protected request" },
    prediction: { id: "middleware-prediction-v1", type: "multiple-choice", prompt: "A request contains invalid data. Which checkpoint should reject it?", options: [{ id: "logging", label: "Logging" }, { id: "authentication", label: "Authentication" }, { id: "validation", label: "Validation" }], correctOptionId: "validation", explanation: "Validation checks whether submitted data has the required shape and values." },
    challenges: [{ id: "middleware-checkpoint-v1", instruction: "Identify the checkpoint that should reject malformed input.", expectedState: "validation", hint: "This check is about data shape, not identity.", explanation: "Validation should stop malformed input before controller logic runs.", question: { id: "middleware-checkpoint-question-v1", type: "multiple-choice", prompt: "Where should invalid input stop?", options: [{ id: "logging", label: "Logging middleware" }, { id: "validation", label: "Validation middleware" }, { id: "controller", label: "After the controller" }], correctOptionId: "validation", explanation: "Validation middleware is the input checkpoint." } }],
    assessment: { id: "middleware-assessment-v1", type: "multiple-choice", prompt: "What is middleware?", options: [{ id: "checkpoint", label: "Ordered processing that can observe, change, allow, or reject a request before application logic" }, { id: "database", label: "A table that stores users" }, { id: "frontend", label: "The visible browser interface" }], correctOptionId: "checkpoint", explanation: "Middleware sits in the request path before the final handler or controller." },
    finalExplanation: "Middleware is ordered request-processing logic. Logging observes, authentication verifies identity, and validation checks input. Enabled checkpoints may pass or reject a request before the controller.", finalPrompt: "Explain what changes when authentication middleware is disabled on a protected route.", instructorPrompt: "Ask: Which checkpoint can be disabled without changing whether the request is accepted?", simulation: { id: "middleware-v1", title: "Middleware checkpoints", steps: middlewareSteps, failureRules: { "missing-token": createFailureRule("missing-token", "authentication-middleware"), "invalid-request": createFailureRule("invalid-request", "validation-middleware") } },
    lab: { kind: "middleware", checkpoints: [
      { id: "logging", label: "Logging", description: "Observes, never rejects" },
      { id: "authentication", label: "Authentication", description: "Checks who you are" },
      { id: "validation", label: "Validation", description: "Checks the input" },
    ] },
    visualNodes: flowNodes([{ id: "request", label: "Request", detail: "Enters pipeline", kind:"browser", startStep: 0, endStep: 0 }, { id: "logging", label: "Logging", detail: "Observes", kind: "middleware", startStep: 1, endStep: 1 }, { id: "authentication", label: "Authentication", detail: "Checks identity", kind: "middleware", startStep: 2, endStep: 2 }, { id: "validation", label: "Validation", detail: "Checks input", kind: "middleware", startStep: 3, endStep: 3 }, { id: "controller", label: "Controller", detail: "Application logic", kind: "controller", startStep: 4, endStep: 4 }, { id: "response", label: "Response", detail: "Outcome", kind: "server", startStep: 5, endStep: 5 }]),
  }),
  makeLesson({
    id: "lesson-deployment-v1", slug: "deployment", index: 6, title: "From Laptop to Internet", shortTitle: "Deployment", description: "Watch code travel through a build and tests before becoming available to users.", question: "What does deploying an app actually mean?", concepts: ["Local", "Build", "Tests", "Staging", "Production"], accent: "teal", objective: "Explain how tested application code moves from a laptop to an internet-accessible production environment.", prerequisiteIds: ["lesson-middleware-v1"], simulationId: "deployment-v1",
    hook: { prompt: "Your app works on your laptop. What must happen before other people can use it?", actionLabel: "Deploy application" },
    prediction: { id: "deployment-prediction-v1", type: "multiple-choice", prompt: "What should happen if required deployment tests fail?", options: [{ id: "live", label: "The new version goes live anyway" }, { id: "stop", label: "The deployment stops before production" }, { id: "delete", label: "The repository is deleted" }], correctOptionId: "stop", explanation: "A deployment pipeline protects production by stopping a version that fails required tests." },
    challenges: [{ id: "deployment-order-v1", instruction: "Put the simplified deployment stages in order.", expectedState: ["laptop", "repository", "build", "tests", "cloud", "users"], hint: "Tests must happen after a build exists and before users receive it.", explanation: "Code moves from a laptop to a repository, is built and tested, then starts on a cloud server users can reach.", question: { id: "deployment-order-question-v1", type: "ordering", prompt: "Arrange the release path.", items: [{ id: "tests", label: "Tests" }, { id: "users", label: "Users" }, { id: "laptop", label: "Laptop" }, { id: "cloud", label: "Cloud server" }, { id: "build", label: "Build" }, { id: "repository", label: "Repository" }], correctOrder: ["laptop", "repository", "build", "tests", "cloud", "users"], explanation: "Verification happens before the build becomes the production version." } }],
    assessment: { id: "deployment-assessment-v1", type: "multiple-choice", prompt: "What does production mean here?", options: [{ id: "reachable", label: "The environment running the version real users can reach" }, { id: "laptop", label: "Any version running on a developer laptop" }, { id: "repo", label: "A folder containing source code" }], correctOptionId: "reachable", explanation: "Production is the live user-facing environment, not a specific cloud brand." },
    finalExplanation: "Deployment moves a selected code version from a repository through build and test checks to an internet-accessible environment. Local is on your machine, staging is a pre-release environment, and production is what users reach.", finalPrompt: "Explain why tests sit between the build and a live production release.", instructorPrompt: "Ask: Which stage prevents known broken code from reaching users?", simulation: { id: "deployment-v1", title: "Deployment pipeline", steps: deploymentSteps, failureRules: { "failed-deployment-test": createFailureRule("failed-deployment-test", "deployment-tests") } },
    lab: { kind: "deployment", environments: [
      { id: "local", label: "Local", description: "Your machine only" },
      { id: "staging", label: "Staging", description: "Rehearsal before release" },
      { id: "production", label: "Production", description: "What users reach" },
    ], scenarios: [
      { id: "release-passes", label: "Release a version that passes tests", description: "Tests pass → production", failure: null, statusCode: 200 },
      { id: "release-blocked", label: "Release a version that fails tests", description: "Test fails → blocked", failure: "failed-deployment-test", statusCode: 500 },
    ] },
    visualNodes: flowNodes([{ id: "laptop", label: "Laptop", detail: "Local code", kind: "code", startStep: 0, endStep: 1 }, { id: "repository", label: "Repository", detail: "Shared revision", kind: "repository", startStep: 2, endStep: 2 }, { id: "build", label: "Build", detail: "Optimized artifact", kind: "build", startStep: 3, endStep: 3 }, { id: "tests", label: "Tests", detail: "Release check", kind: "tests", startStep: 4, endStep: 4 }, { id: "cloud", label: "Cloud server", detail: "Runs application", kind: "cloud", startStep: 5, endStep: 5 }, { id: "domain", label: "Domain", detail: "Stable address", kind: "domain", startStep: 6, endStep: 6 }, { id: "users", label: "Users", detail: "Production", kind: "user", startStep: 7, endStep: 7 }]),
  }),
];

export function getCurriculumLesson(slug: string) {
  return curriculum.find((lesson) => lesson.slug === slug);
}

export function getQuestionAnswer(question: LessonQuestion) {
  return question.type === "multiple-choice" ? question.correctOptionId : question.correctOrder;
}

export function getPrimaryChallenge(lesson: Lesson): Challenge {
  return lesson.challenges[0];
}

export function getLessonAccent(lesson: Lesson): LessonAccent {
  return lesson.accent;
}
