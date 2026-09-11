import type { LessonQuestion } from "@/types/lesson";

/** Capstone curriculum copy lives here, not inside the simulation components. */
export const loginCapstoneContent = {
  id: "login-capstone-v1",
  prediction: {
    id: "login-capstone-prediction-v1",
    type: "multiple-choice",
    prompt: "You click Login. What does the browser send to the server?",
    options: [
      { id: "password-hash", label: "The password already turned into a stored hash" },
      { id: "credentials", label: "The submitted email and password inside an HTTP request" },
      { id: "session", label: "A session token it created by itself" },
    ],
    correctOptionId: "credentials",
    explanation: "The browser sends the submitted credentials. Hashing, comparison, and session creation all happen on the server.",
  } satisfies LessonQuestion,

  challenge: {
    id: "login-capstone-order-v1",
    type: "ordering",
    prompt: "Arrange the login flow in the order the system actually runs it.",
    items: [
      { id: "database", label: "Database lookup" },
      { id: "request", label: "Browser sends POST /api/login" },
      { id: "response", label: "Response returns to the browser" },
      { id: "password", label: "Password verification" },
      { id: "middleware", label: "Middleware logs and validates" },
      { id: "token", label: "Session token created" },
    ],
    correctOrder: ["request", "middleware", "database", "password", "token", "response"],
    explanation: "The user must be found before the password can be compared, and the token is only created after verification succeeds.",
  } satisfies LessonQuestion,

  assessment: {
    id: "login-capstone-assessment-v1",
    type: "multiple-choice",
    prompt: "Authentication succeeded but authorization failed. What does the server return?",
    options: [
      { id: "401", label: "401 Unauthorized" },
      { id: "403", label: "403 Forbidden" },
      { id: "500", label: "500 Internal Server Error" },
    ],
    correctOptionId: "403",
    explanation: "403 means the system knows who the user is but will not allow this particular action. 401 means identity itself could not be established.",
  } satisfies LessonQuestion,

  finalPrompt: "Explain what happens when you log into an app, from the click to the dashboard.",
  finalExplanation: "The browser sends the submitted credentials as an HTTP request. Middleware logs and validates it, the router picks the login handler, and the authentication service looks the user up in the database. The submitted password is compared against the stored hash. Only on success does the server create a session and return 200, letting the browser show the dashboard. Each failure stops at the component responsible for that specific check.",
} as const;
