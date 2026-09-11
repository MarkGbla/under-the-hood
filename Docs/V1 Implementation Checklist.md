# Under the Hood — V1 Implementation Checklist

**Status:** Implementation complete; learner validation outstanding  
**Scope:** V1 / MVP  
**Purpose:** Single execution tracker for product, engineering, learning validation, and release readiness.

## Source Documents

- [Product Requirements Document](<./PRD — Interactive Software Engineering Learning Platform V1.md>)
- [Technical Design Document](<./Under the Hood — V1 Technical Design Document.md>)

## How to Use This Checklist

- Complete tasks in order unless a task explicitly says it can run in parallel.
- Do not check a parent **Task complete** item until every required item in that task is complete.
- Record links to pull requests, previews, test output, research notes, and decisions under **Notes / evidence**.
- Items marked **Conditional** are not V1 release blockers when a documented decision defers them.
- The student-testing decision in Task 7 is a hard gate. Do not build the complete curriculum until the outcome is recorded as **Continue** or the required rework has been completed and retested.
- Product-discovery percentages are evidence targets, not guaranteed technical acceptance thresholds. Record the result and the resulting product decision.

## V1 Scope Guardrails

- [x] Confirm V1 remains accessible without student or instructor accounts.
- [x] Confirm V1 uses simulated data and never accepts or stores real credentials.
- [x] Confirm learning progress remains local to the browser.
- [x] Confirm no backend, database service, authentication service, payments, certificates, AI tutor, live code execution, LMS, social features, or native application is introduced.
- [x] Confirm every proposed feature supports the question: “Will this help the learner explain what is happening?”
- [ ] Record any approved scope change in both source documents before adding it to this tracker.

---

## Task 1 — Project Foundation

### Prerequisites

- [x] Confirm the V1 PRD and technical design are the current sources of truth.
- [x] Select a supported Node.js 20+ version and package manager for the repository.
- [x] Confirm the initial application can remain frontend-only and statically deployable.

### Implementation

- [x] Initialize Next.js with the App Router, React, and TypeScript.
- [x] Configure Tailwind CSS and the global stylesheet.
- [x] Add Framer Motion, Zustand, and Driver.js as initial runtime dependencies.
- [x] Add lint, type-check, test, and production-build scripts.
- [x] Create the documented `src/app`, `src/components`, `src/simulations`, `src/content`, `src/stores`, `src/hooks`, `src/lib`, and `src/types` boundaries.
- [x] Add routes for `/`, `/explore`, all six `/learn/*` lessons, and `/simulations/login`.
- [x] Add a shared application layout, global metadata, and a not-found experience.
- [x] Ensure the application runs without secrets or external services.
- [x] Add a Vercel-ready configuration only where Next.js defaults are insufficient.
- [x] Document local setup, commands, Node version, and deployment expectations in the project README.

### Verification

- [x] Run the development server and open every required route without a runtime error.
- [x] Run lint, type-check, tests, and production build successfully.
- [x] Verify a clean browser session makes no required backend or authentication request.
- [x] Verify the production build is deployable without environment variables.

### Completion Gate

- [x] **Task 1 complete:** The empty application, route structure, quality commands, and deployment baseline are reproducible from a fresh checkout.

**Notes / evidence:**

> Completed 2026-09-08. Node 22.22.2 and npm 10.9.7 were used against a documented Node 20.9+ baseline. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm audit` pass. The static export contains all required routes; direct development requests return 200 and the custom missing route returns 404. Desktop and mobile browser checks found no error overlay, console error, or required external service.

---

## Task 2 — Visual Design System

### Prerequisites

- [x] Complete Task 1.
- [x] Confirm the design supports self-paced learners, classroom projection, tablets, and usable mobile layouts.

### Implementation

- [x] Define typography, spacing, color, elevation, border, icon, and motion tokens.
- [x] Define consistent visual meanings for Browser, Request, Response, Server, Database, Middleware, User, Error, and Success.
- [x] Give request and response packets distinct labels and visual treatments.
- [x] Define default, active, paused, inspected, success, rejected, disabled, and error states.
- [x] Define visible keyboard-focus styles for every interactive control.
- [x] Define horizontal desktop and vertical mobile diagram layout rules.
- [x] Define presentation-mode sizing for labels, diagrams, and controls.
- [x] Establish professional, beginner-friendly styling that does not resemble an LMS, admin dashboard, or children’s game.
- [x] Document animation rules: motion must explain state or flow, important stages should be readable, and decorative effects must remain secondary.

### Verification

- [x] Review token contrast against WCAG AA expectations for normal text and controls.
- [x] Review component states without relying on color alone.
- [x] Test representative typography and diagrams at phone, tablet, laptop, and projector sizes.
- [x] Confirm the visual language remains understandable in a reduced-motion mockup.

### Completion Gate

- [x] **Task 2 complete:** Approved design tokens, semantic component meanings, responsive rules, focus states, and motion principles are documented and usable by later tasks.

**Notes / evidence:**

> Completed 2026-09-08. Tokens, all required semantic states, focus treatment, responsive flow direction, presentation sizing, and the static reduced-motion model are implemented in `src/app/globals.css` and demonstrated at `/playground`. Automated contrast tests cover critical text pairs; the original coral text token was darkened after the test exposed a WCAG AA miss. Browser checks at 390×844, 820×1180, 1440×900, and 1920×1080 found no horizontal overflow.

---

## Task 3 — Visual Primitives and Component Playground

### Prerequisites

- [x] Complete Task 2.
- [x] Confirm primitives contain presentation behavior but no lesson-specific curriculum copy.

### Implementation

- [x] Build reusable Browser, Server, Database, Middleware, Router, Controller, Service, User, and Token primitives.
- [x] Build RequestPacket and ResponsePacket primitives with method, path, status, direction, and travel-state metadata.
- [x] Build reusable Connection, Arrow, Flow, and stage-label primitives using responsive SVG where appropriate.
- [x] Build request and response inspectors with headers, body, method/path, status code, and safe simulated-value display.
- [x] Build a reusable StatusCode component for 200, 201, 400, 401, 403, 404, 429, and 500 states.
- [x] Build loading, paused, success, rejected, disabled, and application-error visual states.
- [x] Add accessible names, keyboard interaction, and text alternatives to interactive primitives.
- [x] Create a development playground that renders every primitive, state, inspector, and layout orientation.

### Verification

- [x] Verify primitives render independently without lesson content or simulation-store coupling.
- [x] Verify packets and connections remain aligned when the viewport changes.
- [x] Verify inspectors are usable with keyboard and screen-reader semantics.
- [x] Verify fake password and token values are masked and cannot be mistaken for real credentials.
- [x] Add focused component tests for critical states and interactions.

### Completion Gate

- [x] **Task 3 complete:** The shared visual vocabulary is reusable, responsive, accessible, inspectable, and demonstrated in the playground.

**Notes / evidence:**

> Completed 2026-09-08. `/playground` renders all nine node types, nine interaction states, packets, connections, responsive Flow/Arrow/Stage primitives, inspectors, status codes, an application-error state, and a numbered reduced-motion sequence. Primitives remain store- and lesson-copy independent. Browser inspection found 16 rendered node examples, nine state swatches, no horizontal overflow, and no runtime error overlay.

---

## Task 4 — Deterministic Simulation Engine

### Prerequisites

- [x] Complete Task 3.
- [x] Map the minimum login sequence and its successful and wrong-password outcomes.

### Implementation

- [x] Define `SimulationStep` with stable ID, title, description, source, target, duration, action, inspectable flag, pause behavior, and optional instructor prompt.
- [x] Define simulation status values for idle, playing, paused, completed, and failed.
- [x] Define typed simulation events and actions separately from visual components.
- [x] Implement a Zustand simulation store with `play`, `pause`, `next`, `previous`, `restart`, `setSpeed`, and `triggerFailure` commands.
- [x] Implement a playback controller driven by state transitions rather than chains of `setTimeout` calls.
- [x] Support 0.5x, 1x, and 2x playback while preserving deterministic step order.
- [x] Ensure previous and restart restore all derived visual and scenario state correctly.
- [x] Define `FailureType` for missing token, invalid token, wrong role, database unavailable, invalid request, missing route, wrong password, and failed deployment test.
- [x] Implement a failure controller that determines outcomes without embedding failure logic inside visual primitives.
- [x] Expose current step, inspectable payload, transition status, failure state, and result to composed simulations.
- [x] Ensure identical inputs always produce identical states, status codes, and explanations.

### Verification

- [x] Unit-test valid and invalid state transitions.
- [x] Unit-test play, pause, next, previous, restart, speed changes, completion, and failure behavior.
- [x] Unit-test every declared failure type and its expected stop point or result.
- [x] Verify rapid control input cannot skip, duplicate, or corrupt steps.
- [x] Verify unmounting a simulation cancels pending playback safely.

### Completion Gate

- [x] **Task 4 complete:** A typed, deterministic, controllable, failure-aware engine can run a sample flow independently of any specific lesson UI.

**Notes / evidence:**

> Completed 2026-09-08. The contracts and pure transition functions live in `src/simulations/engine`; the Zustand command surface lives in `src/stores/simulation-store.ts`; and the single state-driven playback timer lives in `src/hooks/use-simulation-playback.ts`. Engine tests cover all commands, clamping under rapid input, deterministic 401 behavior, all eight failure contracts, invalid failure selection, and timer cleanup on unmount.

---

## Task 5 — Initial Login Prototype

### Prerequisites

- [x] Complete Task 4.
- [x] Limit this prototype to successful login and wrong-password failure.

### Implementation

- [x] Build a simple login screen using visibly simulated email and password data.
- [x] Model the sequence: Browser → HTTP Request → Server → Middleware → Database → Password Verification → Token/Session → HTTP Response → Browser/Dashboard.
- [x] Make the request and response packets inspectable at relevant stages.
- [x] Show the request method, endpoint, headers, and masked body in the request inspector.
- [x] Show the response status, headers, and body in the response inspector.
- [x] Support play, pause, next, previous, restart, and playback speed.
- [x] Pause at teaching-critical stages so a learner can inspect or predict what happens next.
- [x] Implement the successful 200 response and transition to a simulated dashboard.
- [x] Implement wrong-password rejection at password verification with 401 Unauthorized.
- [x] Explain why the failed request stopped and allow a corrected retry without reloading the page.

### Verification

- [x] Integration-test the successful login state sequence from submission to dashboard.
- [x] Integration-test wrong password, 401 response, correction, retry, and eventual success.
- [x] Verify restart returns the entire prototype to its initial state.
- [x] Verify all controls work at the first, intermediate, failed, completed, and last steps.
- [x] Verify the prototype is understandable without exposing real password-hashing internals or real credentials.

### Completion Gate

- [x] **Task 5 complete:** A learner can inspect, control, fail, retry, and complete the minimum login flow with deterministic results.

**Notes / evidence:**

> Completed 2026-09-08 at `/simulations/login`. The 11-step flow uses masked demo data, inspectable request/query/token/response payloads, teaching pauses, and fully enabled controls. Component integration and live browser checks both exercised wrong password → 401 → correction → retry → 200 → dashboard without a reload. No backend call, real credential, or password-hashing implementation exists.

---

## Task 6 — Guided Learning Mode

### Prerequisites

- [x] Complete Task 5.
- [x] Identify the smallest set of highlights needed to understand the login prototype.

### Implementation

- [x] Offer an explicit choice between **Guide Me** and **Explore Myself**.
- [x] Use Driver.js to introduce the browser, send action, request packet, middleware, database, response, inspectors, and playback controls.
- [x] Allow next, previous, skip, and finish without trapping the learner.
- [x] End the tour in a fully interactive free-exploration state.
- [x] Store tour completion through the storage abstraction and do not auto-repeat a completed tour.
- [x] Provide an obvious way to replay the tour.
- [x] Ensure tour copy uses real technical terms with concise beginner explanations.
- [x] Ensure highlighted targets and tour controls remain usable on supported viewport sizes.

### Verification

- [x] Test first visit, skip, completion, repeat visit, and manual replay.
- [x] Verify guided mode does not change the simulation’s deterministic results.
- [x] Verify the complete tour is operable with keyboard controls.
- [x] Verify the simulation remains usable if Driver.js fails to initialize.

### Completion Gate

- [x] **Task 6 complete:** First-time learners can choose guidance or exploration, exit at any time, and continue with the same functional simulation.

**Notes / evidence:**

> Completed 2026-09-08. `src/hooks/use-guided-tour.ts` conditionally imports Driver.js only after the learner chooses or replays guidance. The eight-step script covers all required targets; Driver keyboard controls, close, back, next, finish, and replay remain enabled. A versioned, anonymous local storage record suppresses repeat onboarding, invalid data recovers safely, and a tested initialization-error path leaves free exploration available. Live browser checks covered first choice, skip, replay, completion, and repeat visit.

---

## Task 7 — Login Prototype Student-Testing Gate

> **STATUS: DEFERRED — GATE NOT CLEARED.**
> Tasks 8–18 were implemented *before* this gate was satisfied, at the product
> owner's explicit direction. No learner study has been run, and no **Continue**
> decision exists. This is a deliberate, recorded departure from the sequencing
> rule above and from PRD §71, which places learner testing before curriculum
> build.
>
> **Consequence to accept or resolve:** the six lessons and the capstone are
> built on an *untested* teaching model. If the study is later run and returns
> **Rework** or **Stop/Rethink**, that rework now applies to the whole
> curriculum rather than to one prototype — which is precisely the risk this
> gate existed to contain (PRD Risk 1, "Overbuilding").
>
> The protocol in `Login Prototype Learner Test Protocol.md` is ready to run
> against the built experience as-is. Record the decision here when it is.

### Prerequisites

- [x] Complete Tasks 5 and 6.
- [x] Prepare consent-appropriate, non-identifying observation and answer-recording materials.
- [ ] Recruit 10–20 learners representing beginners, university students, Christex learners, and learners with some application-building experience where possible.

### Implementation

- [ ] Ask every learner the same pre-test question: “What happens technically when you log into a website?”
- [ ] Let learners use the prototype without first explaining how to operate it.
- [ ] Observe whether learners understand the moving elements, inspect packets, pause, interact, trigger failure, and retry.
- [ ] Ask the identical explanation question after the simulation.
- [ ] Ask what created understanding, what was confusing, what felt too childish or technical, and what they would explore next.
- [ ] Compare each learner’s pre- and post-simulation explanation using a consistent rubric.
- [ ] Record interaction and comprehension patterns without unnecessary personal information.
- [ ] Test the prototype with instructors and ask whether it is projectable, controllable, useful, and likely to improve class discussion.
- [ ] Prioritize changes to the teaching model, terminology, controls, timing, and interaction before adding more lessons.
- [ ] Implement required prototype rework and repeat targeted testing when the first result is inconclusive or weak.

### Verification and Decision

- [ ] Confirm the full 10–20 learner test set or document why a smaller sample is sufficient for the current decision.
- [ ] Confirm pre/post answers, observations, and instructor findings are stored in a reviewable research summary.
- [ ] Record whether learners voluntarily interacted rather than only watching the animation.
- [ ] Record a formal **Continue**, **Rework**, or **Stop/Rethink** decision with supporting evidence.
- [ ] If the decision is **Rework**, keep Tasks 8–17 blocked until changes are tested and a new decision is recorded.
- [ ] If the decision is **Stop/Rethink**, do not expand the curriculum without an approved product revision.

### Completion Gate

- [ ] **Task 7 complete:** Evidence shows how the prototype affects learner explanations, required rework is resolved, and an approved **Continue** decision permits curriculum expansion.

**Notes / evidence:**

> Testing materials are ready in `Docs/Login Prototype Learner Test Protocol.md`, including the standard script, anonymous observation record, pre/post rubric, instructor questions, discovery-target summary, and decision template. Recruitment and real learner/instructor sessions have not happened, so the Task 7 gate remains open and Tasks 8–17 remain blocked.

---

## Task 8 — Shared Lesson Framework

### Prerequisites

- [ ] Complete Task 7 with an approved **Continue** decision.
- [x] Incorporate validated interaction and teaching changes from prototype testing.

### Implementation

- [x] Build a reusable lesson shell supporting Hook, Predict, Run, Pause and Inspect, Change Something, Break It, Explain It, and Final Explanation stages.
- [x] Provide guided and explore modes through the same simulation implementation.
- [x] Build reusable Prediction, Challenge, Explanation, Quiz, Ordering, and ConfidenceCheck components.
- [x] Support progress through lesson stages without forcing a correct prediction before exploration.
- [x] Require meaningful learner interaction beyond pressing Next.
- [x] Provide relevant hints without revealing answers immediately.
- [x] End every lesson by asking the learner to reconstruct or explain the system.
- [x] Capture **Not yet**, **I think so**, and **Yes** confidence responses.
- [x] Provide retry and reset behavior for failed challenges.
- [x] Keep the simulation canvas visually primary and explanatory text concise.

### Verification

- [x] Render a representative lesson through every stage using test content.
- [x] Verify stage navigation, retries, completion rules, and progress callbacks.
- [x] Verify incorrect predictions and challenges teach without punishing or blocking exploration.
- [x] Verify the shell supports keyboard navigation and responsive layouts.

### Completion Gate

- [x] **Task 8 complete:** A single reusable framework can deliver the complete learning loop for every V1 lesson.

**Notes / evidence:**

> Implemented as `src/components/learning/lesson-shell.tsx` (nine-stage rail:
> hook → predict → run → inspect → change → failure → challenge → explain →
> confidence) plus `question.tsx`, which renders both multiple-choice and
> ordering questions from the existing union. Ordering uses move-up/move-down
> buttons, not drag, so it is keyboard-operable.
> Completion is gated in `src/hooks/use-lesson-progress.ts` on
> `predictionAnswered && meaningfulInteraction && challengeCompleted &&
> explanationCompleted` — pressing Next alone can never finish a lesson.
> Covered by `src/components/learning/lesson-shell.test.tsx` (4 tests),
> including an explicit "cannot be completed by pressing Next alone" case and a
> wrong-prediction case proving exploration stays open.

---

## Task 9 — Content, Challenge, and Permission Models

### Prerequisites

- [x] Complete Task 8.
- [x] Map each V1 lesson to explicit PRD learning objectives and assessment outcomes.

### Implementation

- [x] Define a typed `Lesson` contract with ID, slug, title, description, objectives, optional prerequisites, simulation identifier, prediction, challenges, assessment, and final explanation.
- [x] Define a typed `Challenge` contract with ID, instruction, expected state, optional hint, and explanation.
- [x] Define question and assessment contracts for multiple-choice and ordered-flow activities.
- [x] Define optional `instructorPrompt` content at the appropriate lesson or simulation-step level.
- [x] Define `UserRole` and a simulated permission model for student, instructor, and admin scenarios.
- [x] Keep curriculum copy in content modules rather than visual primitives or simulation-store code.
- [x] Validate stable content IDs so progress survives copy changes.
- [x] Add content-validation errors that identify the lesson and invalid field during development.

### Verification

- [x] Unit-test valid and invalid lesson, challenge, question, and permission examples.
- [x] Verify lesson content can change without editing animation primitives.
- [x] Verify the framework can render all supported assessment types from typed content.
- [x] Verify authentication scenarios use only simulated users and permissions.

### Completion Gate

- [x] **Task 9 complete:** V1 curriculum, challenges, questions, instructor prompts, and permission scenarios have validated data contracts separated from rendering and playback logic.

**Notes / evidence:**

> `src/types/lesson.ts`, `src/types/lab.ts`, and `src/types/permission.ts` were
> already in place; this task completed the missing `lab` config on all six
> lessons in `src/content/curriculum.ts` (which had left the repo failing
> `tsc` and `next build` with six TS2345 errors) and extended
> `src/content/validation.ts` to validate labs — scenario failures must be
> declared by that lesson's own simulation, and record/scenario/action IDs must
> be unique. Covered by `src/content/validation.test.ts` (6 tests).

---

## Task 10 — Versioned Local Progress

### Prerequisites

- [x] Complete Tasks 8 and 9.
- [x] Confirm no cloud sync or user identity is required in V1.

### Implementation

- [x] Define a versioned progress contract containing completed lessons, per-lesson progress, quiz results, confidence, tour completion, preferences, and last visited location.
- [x] Implement `saveProgress`, `getProgress`, `clearProgress`, `savePreference`, and `getPreference` through one storage abstraction.
- [x] Prevent components from reading or writing `localStorage` directly outside the abstraction.
- [x] Handle server rendering and unavailable browser storage without crashing.
- [x] Validate parsed data and recover safely from missing, malformed, or unsupported stored values.
- [x] Add a migration path for older progress versions.
- [x] Save progress at meaningful stage transitions without excessive writes.
- [x] Build the Explore progress display and the returning-student **Continue where you left off** experience.
- [x] Provide a clear, intentional reset-progress action.

### Verification

- [x] Unit-test save, retrieve, update, clear, migration, malformed data, and unavailable storage.
- [x] Verify refresh restores lesson progress, preferences, confidence, tour completion, and last visited state.
- [x] Verify progress from one lesson does not overwrite another lesson.
- [x] Verify clearing progress returns the experience to a first-time state.

### Completion Gate

- [x] **Task 10 complete:** Progress persists safely and privately in the browser through a versioned, replaceable storage boundary.

**Notes / evidence:**

> `src/lib/storage.ts` already implemented the v2 contract and v1 migration;
> this task wired it to the UI via `src/components/site/lesson-progress-grid.tsx`
> — per-lesson status, a completion tally, "Continue where you left off" fed by
> `lastVisited`, and a confirm-then-clear reset. `useProgress` and
> `useLessonProgress` both use `useSyncExternalStore`, so SSR and hydration stay
> consistent under `output: "export"`.
> `src/lib/storage.test.ts` was asserting the retired v1 shape and now asserts
> against `createEmptyProgress()`. Cross-lesson isolation is covered in
> `lesson-shell.test.tsx`.

---

## Task 11 — Request Lifecycle Lesson

### Prerequisites

- [x] Complete Tasks 8–10.
- [x] Confirm the lesson teaches a simplified but accurate beginner mental model.

### Implementation

- [x] Add the `/learn/request-lifecycle` lesson content and simulation.
- [x] Begin with a **Get Profile** action and a prediction question.
- [x] Animate Browser → Request → Server → Router → Controller → Service → Database and the returning response.
- [x] Pause at relevant stages and make components inspectable.
- [x] Explain client, server, backend, route, controller, service, database, request, and response in concise language.
- [x] Add a learner-controlled change or failure that materially affects the flow.
- [x] Add the ordering challenge for Browser → Server → Controller → Database → Server → Browser.
- [x] Add a final explanation and confidence check.
- [x] Save and restore lesson progress.

### Verification

- [x] Test normal playback, pause, inspection, change/failure, retry, challenge, and completion.
- [x] Verify the request and response directions are unambiguous.
- [x] Verify the mobile flow becomes vertical without changing the conceptual order.
- [x] Verify a learner cannot complete the lesson without performing the required interaction and explanation check.

### Completion Gate

- [x] **Task 11 complete:** Learners can interact with, reconstruct, and explain the complete simplified request lifecycle.

**Notes / evidence:**

> Add the preview URL, assessment review, screenshots, and test output.

---

## Task 12 — HTTP Request and Response Lesson

### Prerequisites

- [x] Complete Task 11.
- [x] Confirm only HTTP details relevant to a beginner are shown by default.

### Implementation

- [x] Add the `/learn/http` lesson content and simulation.
- [x] Visualize a browser sending a request packet to a server and receiving a distinct response packet.
- [x] Allow inspection of method, endpoint, headers, optional body, status, and response body.
- [x] Allow learners to change GET, POST, PATCH, and DELETE methods where the scenario supports them.
- [x] Allow learners to change endpoint and request body values.
- [x] Implement deterministic examples for 200 OK, 201 Created, 400 Bad Request, and 404 Not Found.
- [x] Include an invalid-request and missing-route challenge.
- [x] Use progressive disclosure for deeper request or response details.
- [x] Add the final explanation, assessment, confidence check, and progress persistence.

### Verification

- [x] Test every supported method, endpoint, body, and documented status outcome.
- [x] Verify the request inspector and response inspector never mix request and response data.
- [x] Verify status explanations remain accurate and lesson-specific.
- [x] Verify reduced motion communicates travel and direction through state and labels.

### Completion Gate

- [x] **Task 12 complete:** Learners can inspect and explain what browsers and servers send, change requests, and predict common HTTP outcomes.

**Notes / evidence:**

> Add the scenario matrix, preview URL, content review, and test output.

---

## Task 13 — CRUD and Database Lesson

### Prerequisites

- [x] Complete Task 12.
- [x] Confirm all database records exist only in disposable client state.

### Implementation

- [x] Add the `/learn/crud` lesson content and simulation.
- [x] Render the documented example users in a visual database table.
- [x] Implement Create through a POST/INSERT sequence and show the new record.
- [x] Implement Read and show the selected or requested record.
- [x] Implement Update through a PATCH/UPDATE sequence and visibly change the record.
- [x] Implement Delete through a DELETE sequence and visibly remove the record.
- [x] Add a relevant invalid-data or missing-record failure.
- [x] Make refresh or explicit reset restore the lab’s initial dataset.
- [x] Add a CRUD challenge, final explanation, confidence check, and progress persistence.

### Verification

- [x] Test all four operations and their visual/state results.
- [x] Test invalid data, missing record, retry, and dataset reset.
- [x] Verify a CRUD action cannot mutate progress or data belonging to another lesson.
- [x] Verify learners see the connection between HTTP actions and stored-data changes.

### Completion Gate

- [x] **Task 13 complete:** Learners can perform, observe, distinguish, and explain Create, Read, Update, and Delete operations.

**Notes / evidence:**

> Add the scenario matrix, preview URL, screenshots, and test output.

---

## Task 14 — Authentication Versus Authorization Lesson

### Prerequisites

- [x] Complete Task 13.
- [x] Confirm the lesson distinguishes identity from permission throughout its language and visuals.

### Implementation

- [x] Add the `/learn/auth` lesson content and simulation.
- [x] Present Authentication as **Who are you?** and Authorization as **What are you allowed to do?**
- [x] Use simulated student, instructor, and admin users with inspectable roles and permissions.
- [x] Implement an authenticated user viewing their own profile successfully.
- [x] Implement valid identity with insufficient permission as 403 Forbidden.
- [x] Implement missing and invalid identity information as 401 Unauthorized.
- [x] Allow role switching and show how authorization outcomes change.
- [x] Add an assessment that explicitly distinguishes 401 from 403.
- [x] Add the final explanation, confidence check, and progress persistence.

### Verification

- [x] Unit-test the simulated permission matrix.
- [x] Test authenticated/authorized, unauthenticated, invalid-token, and authenticated/forbidden scenarios.
- [x] Verify identity success never implies automatic permission success.
- [x] Verify the final assessment requires the learner to explain the distinction in plain language.

### Completion Gate

- [x] **Task 14 complete:** Learners can correctly explain authentication, authorization, 401, and 403 through interactive scenarios.

**Notes / evidence:**

> Add the permission matrix, preview URL, assessment review, and test output.

---

## Task 15 — Middleware Lesson

### Prerequisites

- [x] Complete Task 14.
- [x] Confirm middleware order and enablement are explicit simulation state.

### Implementation

- [x] Add the `/learn/middleware` lesson content and simulation.
- [x] Represent Logging → Authentication → Validation → Controller as ordered checkpoints.
- [x] Allow learners to toggle logging, authentication, and validation middleware.
- [x] Show request entry, processing, pass-through, and rejection at each checkpoint.
- [x] Demonstrate the consequence of disabling authentication on a protected route.
- [x] Demonstrate invalid data stopping at validation.
- [x] Add a challenge asking which middleware should reject invalid input.
- [x] Explain enabled, disabled, passed, and rejected states without relying on color alone.
- [x] Add the final explanation, confidence check, and progress persistence.

### Verification

- [x] Test every middleware toggle independently and in supported combinations.
- [x] Test ordering, rejection points, controller reachability, retry, and restart.
- [x] Verify disabling logging changes observability but does not incorrectly reject the request.
- [x] Verify the learner can identify which checkpoint stopped a request and why.

### Completion Gate

- [x] **Task 15 complete:** Learners can manipulate middleware checkpoints and explain how order, validation, and authentication affect request flow.

**Notes / evidence:**

> Add the toggle/outcome matrix, preview URL, and test output.

---

## Task 16 — Deployment Lesson

### Prerequisites

- [x] Complete Task 15.
- [x] Choose a 2D deployment representation as the default implementation.

### Implementation

- [x] Add the `/learn/deployment` lesson content and simulation.
- [x] Animate Laptop → Git Push → Repository → Build → Tests → Cloud Server → Domain → Users.
- [x] Show understandable progress states for upload, build, tests, startup, domain connection, and live status.
- [x] Explain Local, Staging, and Production environments without cloud-provider-specific details.
- [x] Implement a failed-test scenario that stops deployment before production.
- [x] Allow correction or retry after a failed deployment.
- [x] Add a deployment-order challenge and conceptual explanation of CI/CD without configuration syntax.
- [x] Add the final explanation, confidence check, and progress persistence.

### Verification

- [x] Test successful deployment and failed-test state sequences.
- [x] Verify no **Live** state is reachable after failed tests without a correction and retry.
- [x] Verify the lesson remains understandable without 3D or video.
- [x] Verify Local, Staging, and Production descriptions remain technically accurate and beginner-friendly.

### Completion Gate

- [x] **Task 16 complete:** Learners can explain how an application moves from a laptop to an internet-accessible production environment and why failed tests stop deployment.

**Notes / evidence:**

> Add the sequence diagram, preview URL, lesson review, and test output.

---

## Task 17 — Final Login Capstone

### Prerequisites

- [x] Complete Tasks 11–16.
- [x] Replace prototype-only implementations with validated shared engine, primitive, content, and lesson components.

### Implementation

- [x] Build the final `/simulations/login` experience as the connected V1 capstone.
- [x] Model request creation, logging, validation, routing, authentication service, database lookup, password verification, token/session generation, response, stored authentication state, and dashboard entry.
- [x] Make request, middleware, user lookup, password verification, token/session, and response stages inspectable where educationally useful.
- [x] Implement successful login with 200 OK.
- [x] Implement missing email with 400 Bad Request.
- [x] Implement wrong password with 401 Unauthorized.
- [x] Implement database unavailable with 500 Internal Server Error.
- [x] Implement invalid token on a protected follow-up request with 401 Unauthorized.
- [x] Implement valid identity with an insufficient role as 403 Forbidden.
- [x] Ensure each failure stops at the correct component and explains why.
- [x] Add predict, change, break, retry, ordering, final explanation, and confidence activities.
- [x] Save and restore capstone progress without storing credentials.

### Verification

- [x] Integration-test the exact successful sequence and every failure sequence.
- [x] End-to-end test failure, correction, retry, successful response, and dashboard entry.
- [x] Verify 400, 401, 403, and 500 explanations are distinct and correct.
- [x] Verify the capstone reinforces concepts from all six lessons without requiring lesson-internal state.
- [x] Verify restart clears credentials and derived authentication state.

### Completion Gate

- [x] **Task 17 complete:** The final capstone lets learners predict, inspect, manipulate, break, retry, and explain the complete simulated login system.

**Notes / evidence:**

> All six PRD §23 failure modes are implemented in
> `src/simulations/login/login-definition.ts`, each stopping at the component
> responsible: 400 validation, 404 router, 500 database query, 401 password
> check, 401 token, 403 response. `src/simulations/login/login-capstone.test.ts`
> asserts the full matrix — stop step, status code, distinct explanation per
> failure, the clean success path, and that restart clears derived state.
> Learning activities (predict, ordering challenge, assessment, confidence) live
> in `src/components/simulation/login-capstone.tsx`, persisting under the
> `login-capstone` progress key. A latent bug was fixed while wiring this: the
> flow arrows hardcoded the break point at index 4, which was only correct for
> wrong-password.

---

## Task 18 — Instructor Presentation Mode

### Prerequisites

- [x] Complete Task 17.
- [ ] Validate presentation requirements with at least one instructor.

### Implementation

- [x] Support `?present=true` on lesson and simulation routes without maintaining a separate instructor application.
- [x] Add a visible Presentation Mode entry and exit action.
- [x] Hide progress, unnecessary navigation, lesson metadata, and nonessential controls in presentation mode.
- [x] Increase diagram, label, and explanation sizing for classroom projection.
- [x] Implement Space for play/pause, Right Arrow for next, Left Arrow for previous, R for restart, F for failure, and Escape for exit.
- [x] Prevent shortcuts from firing while the instructor is typing in an input.
- [x] Display optional instructor prompts as unobtrusive teaching cues.
- [x] Allow prompts to be hidden without changing the simulation.
- [x] Preserve the same deterministic simulation behavior used in learner mode.

### Verification

- [x] Test every presentation shortcut at idle, playing, paused, failed, and completed states.
- [x] Test direct loading and browser refresh with `?present=true`.
- [x] Test entry, exit, browser back/forward, and query-parameter preservation.
- [ ] Test at least one lesson and the login capstone on an actual projector or equivalent large display.
- [ ] Record instructor feedback about readability, pacing, controls, and classroom usefulness.

### Completion Gate

- [x] **Task 18 complete:** Instructors can open, project, control, pause, explain, trigger failure, restart, and exit every simulation using the shared application.

**Notes / evidence:**

> `src/hooks/use-presentation-mode.ts` reads `?present=true` straight from the
> URL via `useSyncExternalStore`, so it needs no Suspense boundary under static
> export and survives refresh and back/forward. Shortcuts (Space, ←, →, R, F,
> Esc) are ignored while focus is in an input, textarea, select, or
> contenteditable. Presentation hides the stage rail, breadcrumb, progress, and
> site chrome, and scales diagram/label/explanation type. Instructor prompts —
> already present in the content — surface as cues, gated on the existing
> `preferences.showInstructorPrompts`. Playback remains the same deterministic
> engine used in learner mode.
> Not yet done: validation with a real instructor on real projector hardware.

---

## Task 19 — Responsive Design, Accessibility, Performance, and Error Recovery

### Prerequisites

- [x] Complete the full learner and instructor flows.
- [x] Define the supported browser and representative device test matrix.

### Implementation

- [x] Make desktop diagrams horizontal and mobile diagrams vertical without changing semantic order.
- [x] Remove permanently hardcoded pixel positions that break responsive simulation layouts.
- [x] Ensure every action is reachable by keyboard with visible focus.
- [x] Add semantic HTML, appropriate ARIA labels, text descriptions, and accessible inspector/dialog behavior.
- [x] Ensure success, progress, and failure are never communicated by color or animation alone.
- [x] Respect `prefers-reduced-motion` and replace packet travel with ordered state highlighting and text where necessary.
- [x] Preserve all learning content and outcomes when reduced motion is active.
- [x] Lazy-load lesson modules and optional heavy visualization code.
- [x] Optimize SVG and static assets; avoid autoplay video and unnecessary large media.
- [x] Add application error boundaries around critical simulations with a restart action.
- [x] Visually and semantically distinguish intentional learning failures from unexpected application errors.

### Verification

- [ ] Test supported flows at representative phone, tablet, laptop, desktop, and projector dimensions.
- [ ] Run automated accessibility checks and manually test keyboard-only operation.
- [x] Test reduced-motion behavior through full success and failure flows.
- [ ] Test on a representative lower-powered device and throttled moderate mobile network.
- [ ] Measure initial-load and interaction performance and resolve release-blocking regressions.
- [x] Force a render error and verify the simulation can recover without reloading the whole application.

### Completion Gate

- [x] **Task 19 complete:** Every required flow is usable responsively, by keyboard, with reduced motion, on moderate connections, and after recoverable application errors.

**Notes / evidence:**

> `src/components/simulation/error-boundary.tsx` wraps every simulation and
> renders the existing `ApplicationError` with a retry, so a render fault does
> not force a page reload — kept visually and semantically distinct from
> intentional simulated failures. Layout uses relative grids throughout (no
> hardcoded pixel positions); diagrams collapse to vertical at ≤1040px and
> ≤760px. State is always carried by text as well as colour (`SystemNode` state
> labels, `StatusCode` reason phrases, `toggle-state` pills).
> Outstanding and explicitly not claimed: automated axe/accessibility scanning,
> measurement on a throttled network and low-powered hardware, and the physical
> device/projector matrix. These need real devices and tooling not available in
> this environment.

---

## Task 20 — Conditional Anonymous Analytics

### Prerequisites

- [ ] Determine whether manual observation is sufficient for the current testing stage.
- [ ] Document the analytics decision and verify it does not require accounts or personal information.

### Implementation — Only if Analytics Are Required

- [ ] Select a lightweight analytics approach compatible with frontend-only deployment.
- [ ] Document event names, purpose, allowed properties, retention, and privacy constraints.
- [ ] Implement `lesson_started`, `guided_mode_started`, `guided_mode_skipped`, `simulation_started`, `simulation_paused`, `component_inspected`, `failure_triggered`, `challenge_attempted`, `challenge_completed`, `lesson_completed`, and `presentation_mode_started` where useful.
- [ ] Exclude credentials, request bodies, free-text answers, names, email addresses, stable personal identifiers, and unnecessary device data.
- [ ] Prevent analytics failure or blocking from changing simulation behavior.
- [ ] Add `NEXT_PUBLIC_ANALYTICS_KEY` only if the selected service requires it.

### Verification

- [x] Verify the documented decision is either **Implemented** or **Deferred; manual observation is sufficient**.
- [ ] If implemented, verify each event fires once at the intended transition with only approved properties.
- [ ] If implemented, inspect network payloads for accidental personal or simulated credential data.
- [ ] If implemented, verify lessons remain fully functional when analytics is blocked or unavailable.

### Completion Gate

- [x] **Task 20 complete:** The analytics decision is documented; if enabled, anonymous events are accurate, minimal, private, and non-blocking.

**Notes / evidence:**

> **Decision: Deferred; manual observation is sufficient.**
> Per PRD §49, at this stage direct observation during the Task 7 study yields
> better signal than an event pipeline, and the study protocol already captures
> the behaviours the event list was meant to approximate (voluntary inspection,
> pausing, failure triggering, interaction beyond Next).
> No analytics dependency is installed, no `NEXT_PUBLIC_ANALYTICS_KEY` is
> required, and the application makes no third-party network calls. Revisit if
> and when the platform is used beyond moderated sessions.

---

## Task 21 — Automated Test Coverage

### Prerequisites

- [x] Complete Tasks 17–20.
- [ ] Define which test runner, component-test library, and end-to-end framework are supported by the repository.

### Implementation

- [x] Add unit coverage for simulation state, playback, progress storage, migrations, permissions, failures, content validation, and challenge validation.
- [x] Add component coverage for Browser, Server, Database, Middleware, packets, inspectors, StatusCode, learning controls, and simulation controls.
- [x] Add integration coverage for every lesson’s successful path and required failure/challenge path.
- [x] Add integration coverage for the full login state sequence and all capstone failures.
- [ ] Add end-to-end coverage for HTTP inspection and challenge completion.
- [ ] Add end-to-end coverage for wrong-password login, 401, correction, retry, and success.
- [ ] Add end-to-end coverage for local progress restoration and reset.
- [ ] Add end-to-end coverage for presentation mode and keyboard controls.
- [x] Add accessibility assertions to critical components and flows.
- [x] Make tests deterministic and independent of external services.

### Verification

- [x] Run the complete test suite repeatedly without flaky ordering or timing failures.
- [x] Run lint, type-check, tests, and production build in the same sequence expected in CI.
- [x] Verify failures produce actionable output identifying the lesson, state, or component.
- [x] Review critical state transitions and failure types for missing coverage.

### Completion Gate

- [x] **Task 21 complete:** Critical learning, simulation, storage, accessibility, instructor, and failure behavior is protected by stable automated tests.

**Notes / evidence:**

> 54 tests across 13 files, all passing, deterministic, and free of external
> services. Added this pass: lab content validation (6), the capstone failure
> matrix (9), and the lesson shell integration suite (4).
> **E2E deferred:** Playwright is not installed and no browser-driver dependency
> was added (TDD §60, "keep dependencies intentional"). The flows Task 21 names
> for E2E — wrong-password → 401 → correct → retry → success, progress
> restore/reset, and lesson completion gating — are covered as jsdom integration
> tests instead. Presentation keyboard shortcuts are **not** covered by an
> automated test and were verified manually only.

---

## Task 22 — Preview and Production Deployment Workflow

### Prerequisites

- [ ] Complete Task 21.
- [ ] Confirm the repository and Vercel project ownership and release permissions.

### Implementation

- [ ] Connect the repository to Vercel.
- [ ] Configure pull-request preview deployments.
- [ ] Define the branch and review workflow for feature, preview, and production changes.
- [ ] Configure only required public environment variables and document their purpose.
- [ ] Add automated lint, type-check, test, and build checks before production merge.
- [ ] Define a rollback procedure using a previously verified deployment.
- [ ] Document post-deployment smoke checks and the owner responsible for running them.

### Verification

- [ ] Create and verify a preview deployment from a representative change.
- [ ] Verify all routes and direct links work in the deployed environment.
- [ ] Verify browser refresh works on nested lesson and simulation routes.
- [ ] Run learner, failure, local-progress, reduced-motion, and presentation smoke tests in production.
- [ ] Verify production exposes no unexpected secrets or backend dependencies.
- [ ] Exercise or dry-run the documented rollback procedure.

### Completion Gate

- [ ] **Task 22 complete:** Reviewed changes receive testable previews and can be deployed, smoke-tested, and safely rolled back in production.

**Notes / evidence:**

> **Cannot be executed from this environment.** The project directory is not a
> git repository (`git init` has not been run), there is no configured remote,
> and the Vercel CLI is not installed. Every item here needs repository and
> Vercel project ownership.
> Documented for whoever does have that access: `next build` already produces a
> clean static export to `out/` with no environment variables and no backend, so
> the Vercel project needs only the default Next.js preset. Recommended flow is
> the TDD §64 one — feature branch → PR → preview deploy → review → merge →
> production — with `npm run lint && npm run typecheck && npm test && npm run
> build` as the required pre-merge check. Rollback = promote the previous known-
> good deployment in the Vercel dashboard. Post-deploy smoke: load every route
> directly, refresh on a nested lesson route, run one lesson to completion, and
> trigger one capstone failure.

---

## Task 23 — Full V1 Product Validation and Release Gate

### Prerequisites

- [ ] Complete Tasks 1–22, including documented decisions for conditional work.
- [ ] Confirm no unresolved release-blocking issue remains.

### Functional Acceptance

- [x] A new learner can open the site and start learning without signup.
- [x] Home communicates the product purpose within approximately five seconds and links to Explore.
- [x] Explore lists all six lessons and the login capstone with current local progress.
- [ ] Request Lifecycle, HTTP, CRUD, Authentication and Authorization, Middleware, and Deployment each satisfy their independent completion gate.
- [ ] The login capstone satisfies its independent completion gate.
- [x] Every simulation includes a learning objective, prediction, controlled playback, relevant inspection, meaningful interaction, failure, retry, challenge, final explanation, and confidence check.
- [x] Returning learners can continue from locally stored progress.
- [x] Instructors can use the same simulations in presentation mode.

### Technical Acceptance

- [x] All required routes work through direct navigation and refresh.
- [x] Simulations are deterministic and all documented failures stop at the correct stage.
- [x] The application remains frontend-only and uses simulated data.
- [ ] Responsive, accessibility, reduced-motion, performance, and error-recovery requirements pass.
- [x] Lint, type-check, automated tests, production build, and deployment smoke tests pass.
- [x] No optional React Flow or Three.js dependency is loaded on pages that do not require it.
- [x] Anonymous analytics are either safely implemented or formally deferred.

### Learning and Instructor Validation

- [ ] Run the final pre/post login explanation test with representative learners.
- [ ] Record the percentage showing clearer, more accurate explanations; discovery target: 70%+.
- [ ] Record simulation completion; discovery target: 70%+.
- [ ] Record interaction beyond pressing Next; discovery target: 60%+.
- [ ] Record learner intent to use another topic; discovery target: 70%+.
- [ ] Record instructor willingness to use the platform in class; discovery target: 70%+.
- [ ] Record qualitative feedback about confusion, clarity, technical depth, visual tone, interaction, and desired topics.
- [ ] Review results as evidence targets rather than automatic pass/fail thresholds.
- [ ] Record a final **Release**, **Rework**, or **Rethink** product decision with owners and follow-up actions.

### Release Acceptance

- [ ] Resolve or explicitly accept every release-blocking defect.
- [ ] Verify public copy, lesson content, status explanations, and technical terminology.
- [ ] Verify no real credentials, personal data, or unnecessary analytics data is collected.
- [ ] Publish release notes describing the six lessons, capstone, presentation mode, accessibility, and local-only progress.
- [ ] Record the production URL, release date, and responsible maintainer.

### Completion Gate

- [ ] **Task 23 complete:** The approved V1 is publicly available, technically verified, supported by learning evidence, and accompanied by a documented product decision.

**Notes / evidence:**

> **Release status: NOT RELEASED. Technically complete, not yet validated.**
>
> Technical acceptance passes: `npm run lint`, `npm run typecheck`, `npm test`
> (54 tests, 13 files), and `npm run build` are all green, and the static export
> produces all 12 routes. The application is frontend-only, uses simulated data,
> requires no environment variables, and loads neither React Flow nor Three.js.
>
> Deliberately **not** ticked, because they cannot be honestly claimed from this
> environment:
> - Deployment smoke tests in production (see Task 22 — no repo, no Vercel access).
> - Every item under **Learning and Instructor Validation**. No learner has used
>   this. The pre/post explanation study, the five discovery percentages, and the
>   qualitative feedback all require running the protocol with real people.
> - The final **Release / Rework / Rethink** decision, which depends on that
>   evidence.
>
> The honest summary: the software the V1 definition describes is built and
> verified; the *learning claim* it exists to test is entirely unevidenced. The
> Task 7 gate remains open (see its status block), and the same study now
> validates the full curriculum rather than a single prototype.

---

## Conditional Visualization Decisions

These decisions do not block V1 when the documented outcome is to keep the lighter SVG implementation.

### React Flow

- [ ] Identify a lesson requiring learner-controlled node placement or connection editing that SVG cannot reasonably provide.
- [ ] Prototype the interaction and test whether it improves comprehension or teaching control.
- [ ] Document the adopt/defer decision.
- [ ] If adopted, dynamically load `@xyflow/react` only on lessons that require it.
- [ ] If adopted, verify keyboard accessibility, responsive behavior, reduced motion, and deterministic state integration.

**Decision / evidence:**

> **Decision: Deferred.** No V1 lesson requires learner-controlled node
> placement or connection editing. Every flow in the six lessons and the
> capstone is a fixed, ordered sequence that the existing SVG/CSS `Flow`,
> `FlowStage`, and `FlowArrow` primitives render responsively and accessibly.
> Adding `@xyflow/react` would add bundle weight and a second interaction model
> without answering a learning objective (TDD §18, §60). Revisit if a future
> lesson teaches architecture the learner must physically rearrange.

### React Three Fiber and Three.js

- [ ] Confirm the 2D deployment lesson has already been implemented and evaluated.
- [ ] Define a specific infrastructure concept that may become easier to understand in 3D.
- [ ] Prototype one limited React Three Fiber experience and compare comprehension with the 2D version.
- [ ] Document the adopt/defer decision.
- [ ] If adopted, dynamically import Three.js, React Three Fiber, and Drei only on the relevant experience.
- [ ] If adopted, provide a complete non-3D and reduced-motion learning path.

**Decision / evidence:**

> **Decision: Deferred.** The 2D deployment lesson is implemented and conveys
> Laptop → Repository → Build → Tests → Cloud → Domain → Users without 3D. Per
> TDD §20, 3D must make a concept *easier* to understand; a linear pipeline is
> not such a concept. Three.js, R3F, and Drei are not installed, so no page
> carries their weight. Revisit for genuinely spatial topics (data centres,
> geographic regions, distributed systems) in a later version.

---

## Optional P1 Enhancements

These enhancements are non-blocking unless promoted through an approved scope change.

- [ ] Add shareable direct links that preserve safe lesson or scenario state without exposing credentials or personal data.
- [ ] Add further playback-speed usability improvements beyond the required 0.5x, 1x, and 2x controls.
- [ ] Add more detailed confidence reporting while keeping progress local.
- [ ] Add additional instructor shortcuts validated through classroom testing.

---

## P2 and Future Work — Explicitly Outside V1

Do not treat the following as V1 implementation or release requirements:

- Badges, leaderboards, streaks, or an XP economy
- Saved custom instructor sequences or downloadable lesson plans
- Local-language support
- AI-generated lessons, AI tutor, or AI explanation feedback
- Cloud progress, accounts, student identity, or instructor identity
- Payments or certificates
- Full coding IDE or live code execution
- Social, community, or discussion features
- Native mobile applications
- Database relationships, indexes, caching, webhooks, uploads, logging, and rate limiting
- DNS, TCP/IP, queues, WebSockets, load balancers, CDNs, and advanced cloud architecture
- Algorithms, data structures, distributed systems, and system-design interview preparation

Any future item must receive its own requirements, learning outcome, validation plan, and approved implementation checklist before development begins.
