# Under the Hood

## Technical Design Document — V1

**Status:** Proposed  
**Version:** 1.0  
**Product:** Under the Hood  
**Organization:** Christex Foundation  
**Document Type:** Technical Design / Engineering Specification

---

# 1. Overview

Under the Hood is an interactive visual learning platform for teaching fundamental software engineering concepts.

Instead of primarily teaching students through text, slides, videos, or code examples, the platform represents software systems as interactive simulations.

Students should be able to:

**See → Interact → Predict → Break → Fix → Explain**

Example:

```text
Browser
   │
   │ HTTP Request
   ▼
Middleware
   │
   ▼
Server
   │
   ▼
Database
   │
   │ Response
   ▼
Browser
```

The platform will initially support six fundamental concepts:

1. Request Lifecycle
2. HTTP
3. CRUD & Databases
4. Authentication & Authorization
5. Middleware
6. Deployment

These concepts come together in the main V1 simulation:

> **What Happens When You Log Into an App?**

V1 will not require student accounts or a traditional application backend.

---

# 2. Engineering Goals

The technical architecture should optimize for:

- interactive visualizations,
- reusable simulation components,
- smooth animation,
- low-bandwidth environments,
- desktop and mobile support,
- classroom projection,
- fast iteration,
- simple deployment,
- minimal infrastructure,
- maintainability as the curriculum grows.

The architecture should allow future lessons to reuse existing components rather than rebuilding every visualization from scratch.

For example:

```text
Browser
Server
Database
Request
Response
Middleware
```

should be reusable across HTTP, authentication, CRUD, caching, webhooks, system design, and future lessons.

---

# 3. Non-Goals for V1

V1 will not include:

- student authentication,
- instructor authentication,
- PostgreSQL,
- Supabase,
- Firebase,
- cloud-synced progress,
- payments,
- certificates,
- social features,
- AI tutor,
- live code execution,
- multiplayer,
- LMS functionality,
- native mobile applications.

The first technical implementation should remain primarily client-side.

---

# 4. Technology Stack

## Core

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | Component architecture |
| TypeScript | Type safety |
| Tailwind CSS | UI styling |
| Framer Motion | UI and simulation animation |
| SVG | Primary diagram rendering |
| React Flow | Complex node-based diagrams |
| React Three Fiber | React integration for Three.js |
| Three.js | Selected 3D simulations |
| Driver.js | Guided tours and learning walkthroughs |
| Zustand | Simulation state management |
| localStorage | Local learning progress |
| Vercel | Hosting and deployment |

---

# 5. Architecture Philosophy

The application should be built around three layers:

```text
CONTENT
   ↓
SIMULATION ENGINE
   ↓
VISUAL COMPONENTS
```

## Content

Defines:

- what students learn,
- learning objectives,
- questions,
- explanations,
- simulation steps,
- challenges.

## Simulation Engine

Controls:

- state,
- sequence,
- playback,
- errors,
- user interaction,
- timing.

## Visual Components

Render:

- browsers,
- servers,
- databases,
- requests,
- responses,
- middleware,
- infrastructure.

This separation is extremely important.

Lesson content should not contain complicated animation logic.

Visual components should not contain curriculum content.

---

# 6. High-Level Application Architecture

```text
┌─────────────────────────────────────┐
│              NEXT.JS                │
│                                     │
│   Pages / Routes / Layouts          │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          LEARNING ENGINE            │
│                                     │
│ Lesson                              │
│ Simulation                          │
│ Challenge                           │
│ Assessment                          │
│ Instructor Mode                     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│         SIMULATION ENGINE           │
│                                     │
│ Zustand                             │
│ State Machine                       │
│ Playback Controller                 │
│ Failure Controller                  │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│         VISUALIZATION LAYER         │
│                                     │
│ SVG                                 │
│ Framer Motion                       │
│ React Flow                          │
│ Three.js / R3F                      │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             BROWSER                 │
│                                     │
│ localStorage                        │
│ User Preferences                    │
│ Learning Progress                   │
└─────────────────────────────────────┘
```

---

# 7. Application Routes

Recommended initial routes:

```text
/

/explore

/learn/request-lifecycle

/learn/http

/learn/crud

/learn/auth

/learn/middleware

/learn/deployment

/simulations/login
```

Presentation mode should use the same routes.

Example:

```text
/learn/http?present=true
```

This avoids maintaining separate student and instructor applications.

---

# 8. Recommended Project Structure

```text
src/

├── app/
│
│   ├── page.tsx
│
│   ├── explore/
│   │   └── page.tsx
│
│   ├── learn/
│   │
│   │   ├── request-lifecycle/
│   │   │   └── page.tsx
│   │
│   │   ├── http/
│   │   │   └── page.tsx
│   │
│   │   ├── crud/
│   │   │   └── page.tsx
│   │
│   │   ├── auth/
│   │   │   └── page.tsx
│   │
│   │   ├── middleware/
│   │   │   └── page.tsx
│   │
│   │   └── deployment/
│   │       └── page.tsx
│
│   └── simulations/
│       └── login/
│           └── page.tsx
│
├── components/
│
│   ├── simulation/
│   │
│   │   ├── Browser.tsx
│   │   ├── Server.tsx
│   │   ├── Database.tsx
│   │   ├── Middleware.tsx
│   │   ├── RequestPacket.tsx
│   │   ├── ResponsePacket.tsx
│   │   ├── Router.tsx
│   │   ├── Controller.tsx
│   │   └── Token.tsx
│
│   ├── controls/
│   │
│   │   ├── PlayButton.tsx
│   │   ├── PauseButton.tsx
│   │   ├── NextButton.tsx
│   │   ├── PreviousButton.tsx
│   │   ├── RestartButton.tsx
│   │   └── SpeedControl.tsx
│
│   ├── learning/
│   │
│   │   ├── LessonHeader.tsx
│   │   ├── Prediction.tsx
│   │   ├── Challenge.tsx
│   │   ├── Explanation.tsx
│   │   ├── Quiz.tsx
│   │   └── ConfidenceCheck.tsx
│
│   ├── instructor/
│   │
│   │   ├── PresentationMode.tsx
│   │   └── InstructorControls.tsx
│
│   └── tours/
│       └── GuidedTour.tsx
│
├── simulations/
│
│   ├── engine/
│   │   ├── SimulationEngine.ts
│   │   ├── SimulationState.ts
│   │   └── SimulationEvents.ts
│
│   ├── requestLifecycle/
│   ├── http/
│   ├── crud/
│   ├── authentication/
│   ├── middleware/
│   ├── deployment/
│   └── login/
│
├── content/
│
│   ├── request-lifecycle.ts
│   ├── http.ts
│   ├── crud.ts
│   ├── auth.ts
│   ├── middleware.ts
│   └── deployment.ts
│
├── stores/
│
│   ├── simulationStore.ts
│   ├── progressStore.ts
│   └── preferencesStore.ts
│
├── hooks/
│
│   ├── useSimulation.ts
│   ├── useProgress.ts
│   ├── usePresentationMode.ts
│   └── useGuidedTour.ts
│
├── lib/
│
│   ├── storage.ts
│   ├── progress.ts
│   └── simulation.ts
│
└── types/
    ├── lesson.ts
    ├── simulation.ts
    └── progress.ts
```

---

# 9. Simulation Architecture

The simulation engine is the most important technical system in V1.

Do not build animations as long chains of `setTimeout()` calls.

The simulation should operate as a controlled sequence of states.

Example login flow:

```text
IDLE
 ↓
REQUEST_CREATED
 ↓
REQUEST_SENT
 ↓
MIDDLEWARE_LOGGING
 ↓
MIDDLEWARE_VALIDATION
 ↓
ROUTER
 ↓
AUTH_SERVICE
 ↓
DATABASE_QUERY
 ↓
PASSWORD_CHECK
 ↓
TOKEN_GENERATED
 ↓
RESPONSE_SENT
 ↓
AUTHENTICATED
 ↓
COMPLETE
```

This makes the simulation predictable and controllable.

---

# 10. Simulation Step Model

Example TypeScript model:

```ts
type SimulationStep = {
  id: string
  title: string
  description: string

  source?: string
  target?: string

  duration?: number

  action?: SimulationAction

  inspectable?: boolean

  pauseAfter?: boolean
}
```

Example:

```ts
const loginSteps: SimulationStep[] = [
  {
    id: "request-created",
    title: "Request Created",
    description: "The browser creates an HTTP request.",
    source: "browser",
    target: "server",
    duration: 1200,
    inspectable: true,
    pauseAfter: true
  },

  {
    id: "auth-middleware",
    title: "Authentication Middleware",
    description: "The server checks authentication information.",
    source: "server",
    target: "auth-middleware",
    duration: 900,
    pauseAfter: true
  }
]
```

---

# 11. Simulation Store

Zustand should manage the current simulation state.

Example:

```ts
type SimulationStore = {
  currentStep: number

  status:
    | "idle"
    | "playing"
    | "paused"
    | "completed"
    | "failed"

  speed: number

  play: () => void
  pause: () => void
  next: () => void
  previous: () => void
  restart: () => void

  setSpeed: (speed: number) => void
}
```

The visual components read state from this store.

---

# 12. Playback Controller

Every simulation should support:

```text
PLAY
PAUSE
NEXT
PREVIOUS
RESTART
```

Optional:

```text
0.5x
1x
2x
```

This matters especially for instructors.

An instructor should be able to stop:

```text
Browser → ● → Server
```

and ask:

> What is inside this request?

before continuing.

---

# 13. Visual Component System

The platform needs a reusable visual vocabulary.

## Browser

```tsx
<Browser />
```

Represents:

- client,
- frontend,
- user-facing application.

---

## Server

```tsx
<Server />
```

Represents:

- backend server,
- application server,
- API.

---

## Database

```tsx
<Database />
```

Represents:

- stored data,
- relational database,
- database query destination.

---

## Request Packet

```tsx
<RequestPacket />
```

Represents HTTP requests moving through the system.

Potential metadata:

```ts
{
  method: "POST",
  path: "/api/login",
  status: "travelling"
}
```

---

# 14. Request Inspector

Clicking an inspectable request should open:

```text
HTTP REQUEST

POST /api/login

HEADERS

Content-Type
application/json

BODY

{
  "email": "student@example.com",
  "password": "••••••••"
}
```

Sensitive values should be simulated/fake and never real credentials.

---

# 15. Response Inspector

Response packet:

```text
HTTP RESPONSE

200 OK

HEADERS

Content-Type
application/json

BODY

{
  "authenticated": true
}
```

Errors:

```text
401 Unauthorized
```

```text
403 Forbidden
```

```text
404 Not Found
```

```text
500 Internal Server Error
```

---

# 16. SVG Strategy

SVG should be the default visualization technology.

Use SVG for:

- connection lines,
- request paths,
- arrows,
- database diagrams,
- flow diagrams,
- networking diagrams.

Advantages:

- lightweight,
- responsive,
- scalable,
- easy to animate,
- sharp on projectors,
- accessible,
- works well on slower connections.

---

# 17. Framer Motion Strategy

Framer Motion should control:

- packet movement,
- component transitions,
- highlights,
- success/failure states,
- panels,
- learning cards.

Example conceptually:

```tsx
<motion.div
  animate={{
    x: targetX,
    y: targetY
  }}
/>
```

Animations should be driven by simulation state rather than arbitrary timers.

---

# 18. React Flow Strategy

React Flow should **not** power every lesson.

Use it when the student needs to manipulate architecture.

Example future system:

```text
[Client]

   ↓

[Load Balancer]

 ↙          ↘

[Server]   [Server]

      ↓

   [Database]
```

Possible interactions:

- drag server,
- add cache,
- connect database,
- add load balancer,
- remove node.

For simple request flows, SVG is preferable.

---

# 19. Three.js Strategy

Three.js should not become the main rendering engine.

Use:

**React Three Fiber + Three.js**

for specific immersive experiences.

Potential V1 use:

### Deployment Visualization

A 3D environment could show:

```text
Developer Laptop
        ↓
Repository
        ↓
Cloud
        ↓
Server
        ↓
Users
```

But the educational information should remain understandable without the 3D scene.

---

# 20. Rule for 3D

Every proposed Three.js feature should answer:

> Does 3D make this concept easier to understand?

If not, use 2D.

Good Three.js candidates:

- data centers,
- cloud infrastructure,
- networking,
- server clusters,
- distributed systems,
- scaling,
- geographic regions.

Poor candidates:

- CRUD table,
- status codes,
- HTTP headers,
- simple authentication comparison.

---

# 21. Driver.js Integration

Driver.js should provide guided learning tours.

When a learner first opens HTTP:

```text
Welcome to the HTTP Lab.

Would you like a guided walkthrough?

[Guide Me]

[Explore Myself]
```

If Guide Me:

Driver.js highlights the browser.

> This is the client.

Next:

Highlight:

```text
Send Request
```

> Click here to send an HTTP request.

Next:

Highlight moving packet.

> This packet represents the request travelling to the server.

Next:

Highlight inspector.

> Click the packet to inspect what's inside.

Then allow free exploration.

---

# 22. Driver.js Rules

Never automatically launch long tours.

Users must be able to:

```text
Skip Tour
```

Store completion:

```text
tour_http_completed=true
```

in localStorage.

Do not repeatedly show completed tours.

---

# 23. Guided vs Explore Mode

Every major simulation should eventually support:

```text
GUIDED MODE

EXPLORE MODE
```

## Guided

System explains each stage.

Best for beginners.

## Explore

Student controls everything.

Best for:

- returning learners,
- instructors,
- experimentation.

---

# 24. Learning Content Model

Lessons should be data-driven.

Example:

```ts
type Lesson = {

  id: string

  title: string

  description: string

  objectives: string[]

  prerequisite?: string[]

  simulation: string

  prediction?: Question

  challenges: Challenge[]

  assessment: Question[]

  explanation: string
}
```

This separates curriculum from interface logic.

---

# 25. Challenge Model

```ts
type Challenge = {

  id: string

  instruction: string

  expectedState: string

  hint?: string

  explanation: string
}
```

Example:

```ts
{
  id: "remove-auth",

  instruction:
    "Make this protected request fail.",

  expectedState:
    "unauthorized",

  hint:
    "Try changing the authentication information.",

  explanation:
    "The server returned 401 because it could not verify the user's identity."
}
```

---

# 26. Progress Storage

Use localStorage.

Example structure:

```json
{
  "version": 2,

  "completedLessons": ["http"],

  "lessons": {

    "http": {
      "lessonId": "lesson-http-v1",
      "stage": "confidence",
      "stageIndex": 8,
      "predictionAnswered": true,
      "meaningfulInteraction": true,
      "challengeCompleted": true,
      "explanationCompleted": true,
      "completed": true,
      "confidence": "yes"
    }
  },

  "tours": {},
  "preferences": { "showInstructorPrompts": true },
  "lastVisited": null
}
```

Version 1 stored only `completedLessons`, `lessons`, and `tours`. `migrateProgress`
in `src/lib/storage.ts` upgrades those records in place rather than discarding them.

---

# 27. Storage Abstraction

Do not access `localStorage` everywhere.

Create:

```text
lib/storage.ts
```

Example API:

```ts
saveProgress()

getProgress()

clearProgress()

savePreference()

getPreference()
```

This is important because future versions could replace localStorage with cloud storage without rewriting the application.

---

# 28. Progress Versioning

Include:

```json
{
  "version": 2
}
```

This allows migrations when the progress schema changes. Version 1 → 2 is
implemented; unrecognised or malformed data falls back to empty progress rather
than throwing.

---

# 29. Instructor Presentation Mode

Presentation mode should be activated through:

```text
?present=true
```

or:

```text
Presentation Mode
```

The same simulation runs underneath.

Presentation mode changes only the interface.

---

# 30. Presentation UI

Hide:

- progress,
- navigation,
- unnecessary buttons,
- lesson metadata.

Increase:

- visualization size,
- labels,
- important explanations.

Keyboard shortcuts:

```text
SPACE
Play / Pause

→
Next

←
Previous

R
Restart

F
Trigger Failure

ESC
Exit Presentation
```

---

# 31. Instructor Prompt System

Simulation steps may optionally contain:

```ts
instructorPrompt?: string
```

Example:

```ts
{
  id: "auth-check",

  instructorPrompt:
    "Ask students what they think happens if the token is missing."
}
```

Presentation mode can display this privately or as a small teaching cue.

---

# 32. Authentication Simulation

Use completely simulated data.

Example user:

```json
{
  "id": 1,
  "name": "Mariama",
  "role": "student"
}
```

Do not connect authentication lessons to real authentication services.

---

# 33. Authorization State

Example:

```ts
type UserRole =
  | "student"
  | "instructor"
  | "admin"
```

Permissions can be simulated:

```ts
const permissions = {

  student: [
    "view-own-profile"
  ],

  instructor: [
    "view-own-profile",
    "present-lesson"
  ],

  admin: [
    "view-own-profile",
    "present-lesson",
    "manage-users"
  ]
}
```

Admin permissions are listed explicitly rather than using a `"*"` wildcard, so
an unknown action is denied by default.

This allows interactive role switching.

---

# 34. CRUD Simulation

CRUD data should exist entirely in client state.

Example:

```ts
const users = [
  {
    id: 1,
    name: "Mariama",
    role: "Student"
  },

  {
    id: 2,
    name: "Abdul",
    role: "Student"
  }
]
```

Student performs:

```text
CREATE
READ
UPDATE
DELETE
```

The simulated database visually updates.

Refresh can reset the lab.

---

# 35. Middleware Simulation

Represent middleware as ordered checkpoints.

Example:

```ts
const middleware = [

  {
    id: "logger",
    enabled: true
  },

  {
    id: "authentication",
    enabled: true
  },

  {
    id: "validation",
    enabled: true
  }
]
```

Students should be able to toggle each one.

---

# 36. Failure Engine

Failure states should be a first-class system.

Do not hardcode failures into visual components.

Example:

```ts
type FailureType =
  | "missing-token"
  | "invalid-token"
  | "wrong-role"
  | "database-unavailable"
  | "invalid-request"
  | "missing-route"
  | "wrong-password"
  | "failed-deployment-test"
```

Simulation engine determines outcome.

---

# 37. Example Failure

Input:

```text
missing-token
```

Flow:

```text
Browser
   ↓
Request
   ↓
Authentication Middleware

       ✕

401 Unauthorized
```

The packet physically stops.

That visual stop reinforces what middleware does.

---

# 38. Status Code Component

Reusable:

```tsx
<StatusCode code={401} />
```

Displays:

```text
401

Unauthorized

The server cannot verify
who is making this request.
```

Similarly:

```text
200
201
400
401
403
404
429
500
```

Only teach codes relevant to the lesson.

---

# 39. Responsive Architecture

Desktop should support horizontal diagrams.

Example:

```text
Browser → Server → Database
```

Mobile converts to:

```text
Browser
  ↓
Server
  ↓
Database
```

Simulation positions therefore should not be permanently hardcoded in pixels.

Prefer relative layout systems.

---

# 40. Rendering Strategy

Prefer:

```text
React DOM
+
SVG
+
Framer Motion
```

for most pages.

Only initialize Three.js when required.

Three.js modules should be dynamically imported where possible.

This prevents 3D dependencies from increasing load time for every lesson.

---

# 41. Performance Requirements

Targets for V1:

- fast initial load,
- smooth interactions on normal student laptops,
- minimal large media,
- no autoplay video,
- optimized SVG,
- lazy-loaded lesson modules,
- dynamically loaded Three.js scenes,
- compressed assets.

Aim for smooth animation where device capability permits.

Do not sacrifice usability on lower-powered hardware to maintain unnecessary visual effects.

---

# 42. Reduced Motion

Respect:

```css
prefers-reduced-motion
```

When enabled:

Replace moving packets with:

```text
Browser

↓

Server
```

and state highlighting.

Learning must not depend entirely on animation.

---

# 43. Accessibility

Components need:

- keyboard support,
- ARIA labels where appropriate,
- visible focus,
- sufficient contrast,
- text descriptions,
- reduced motion,
- semantic HTML.

Do not communicate status only through color.

Example:

Bad:

red border only.

Better:

```text
✕ Request rejected

401 Unauthorized
```

---

# 44. Error Handling

Simulation errors and application errors are different.

## Simulation Error

Intentional:

```text
Database unavailable
```

Used for learning.

## Application Error

Unexpected:

```text
Component failed to render.
```

The UI should distinguish them.

---

# 45. Application Error Boundary

Critical simulations should have error boundaries.

Fallback:

```text
Something went wrong with this simulation.

[ Restart Simulation ]
```

A broken animation should not require reloading the whole application.

---

# 46. Analytics

Analytics are optional for the earliest prototype.

Once student testing begins, track anonymous learning events.

Potential events:

```text
lesson_started

guided_mode_started

guided_mode_skipped

simulation_started

simulation_paused

component_inspected

failure_triggered

challenge_attempted

challenge_completed

lesson_completed

presentation_mode_started
```

Do not collect unnecessary personal information.

---

# 47. Testing Strategy

The platform needs more than normal UI tests because educational behavior matters.

## Unit Tests

Test:

- simulation state,
- progress storage,
- permission logic,
- failure engine,
- challenge validation.

---

## Component Tests

Test:

- Browser,
- Server,
- Database,
- Request Inspector,
- Status Code,
- simulation controls.

---

## Integration Tests

Example:

```text
Click Login

↓

request-created

↓

middleware

↓

database

↓

token-generated

↓

response

↓

authenticated
```

Verify correct state transitions.

---

## End-to-End Tests

Important user flows:

```text
Open HTTP lesson
↓
Start simulation
↓
Inspect request
↓
Complete challenge
↓
Complete explanation
```

And:

```text
Open Login simulator
↓
Enter wrong password
↓
Receive 401
↓
Retry
↓
Correct password
↓
Reach success
```

---

# 48. Simulation Determinism

Simulations should be deterministic.

Same input:

```text
wrong password
```

should produce:

```text
401 Unauthorized
```

every time.

Avoid random outcomes unless randomness itself is being taught.

This makes:

- testing easier,
- teaching predictable,
- debugging easier.

---

# 49. Development Phases

## Phase 0 — Foundation

Set up:

```text
Next.js
TypeScript
Tailwind
Framer Motion
Zustand
Driver.js
```

Create base design system.

---

# 50. Phase 1 — Visual Components

Build:

```text
Browser
Server
Database
Middleware
RequestPacket
ResponsePacket
StatusCode
Inspector
```

Do not build full lessons yet.

Create a playground route for testing components.

---

# 51. Phase 2 — Simulation Engine

Implement:

```text
play()
pause()
next()
previous()
restart()
setSpeed()
triggerFailure()
```

Validate the architecture before building curriculum content.

---

# 52. Phase 3 — Login Prototype

Build only:

> What Happens When You Log In?

Flow:

```text
Browser
↓
HTTP Request
↓
Server
↓
Middleware
↓
Database
↓
Password Verification
↓
Token
↓
HTTP Response
↓
Browser
```

Support:

```text
Successful login

Wrong password
```

Nothing more initially.

---

# 53. Phase 4 — Guided Mode

Add Driver.js.

Tour:

```text
Browser
↓
Request
↓
Middleware
↓
Database
↓
Response
```

Allow:

```text
Skip

Next

Previous

Finish
```

---

# 54. Phase 5 — Student Testing

Do not continue building the entire platform immediately.

Test login simulation with real learners.

Validate:

- comprehension,
- interaction,
- animation clarity,
- terminology,
- controls.

Then adjust the simulation engine.

---

# 55. Phase 6 — Core Lessons

Once architecture is validated:

Build:

```text
Request Lifecycle
HTTP
CRUD
Authentication
Middleware
Deployment
```

Reuse existing visual components.

---

# 56. Phase 7 — React Flow

Only introduce React Flow when a lesson genuinely needs movable architecture.

Do not introduce dependency complexity before it is necessary.

---

# 57. Phase 8 — Three.js

Create one experimental Three.js learning experience.

Best V1 candidate:

**Deployment / Internet Infrastructure**

Test whether students gain additional understanding from 3D.

If not, keep Three.js limited.

---

# 58. Phase 9 — Presentation Mode

Implement:

```text
?present=true
```

Add keyboard navigation and instructor prompts.

Test using an actual projector if possible.

---

# 59. Phase 10 — Polish

Improve:

- responsiveness,
- performance,
- accessibility,
- error states,
- onboarding,
- progress persistence.

Then prepare V1 release.

---

# 60. Dependency Strategy

Keep dependencies intentional.

Core dependencies:

```text
next
react
react-dom
typescript

tailwindcss

framer-motion

zustand

driver.js
```

Secondary:

```text
@xyflow/react
```

3D:

```text
three
@react-three/fiber
@react-three/drei
```

Three.js dependencies should not be loaded on pages that do not use 3D.

---

# 61. Recommended Architecture Rule

Do not create:

```text
HttpAnimation.tsx
AuthAnimation.tsx
CrudAnimation.tsx
MiddlewareAnimation.tsx
```

with completely independent implementations.

Instead create primitives:

```text
Browser
Server
Database
Request
Response
Middleware
Connection
Flow
Inspector
```

Then compose:

```text
HTTP Simulation
Authentication Simulation
CRUD Simulation
```

from those primitives.

This is what will make the platform scalable.

---

# 62. Future Extensibility

Later concepts should be able to introduce components such as:

```text
Cache
Queue
LoadBalancer
CDN
ObjectStorage
Worker
DNS
Gateway
WebSocket
Container
CloudRegion
```

without redesigning the simulation engine.

Eventually:

```text
Client
  ↓
DNS
  ↓
CDN
  ↓
Load Balancer
 ↙   ↓   ↘
Server Server Server
       ↓
     Cache
       ↓
    Database
```

can use the same underlying simulation system.

---

# 63. Future Backend

If later versions need:

- cloud progress,
- instructor classes,
- analytics,
- student accounts,
- lesson authoring,
- custom courses,

then introduce a backend.

At that point a possible architecture could become:

```text
Next.js
   ↓
API
   ↓
PostgreSQL
```

with authentication.

But that decision should happen because product requirements demand it, not because the technology is available.

---

# 64. V1 Deployment

Recommended:

```text
GitHub
   ↓
Vercel
   ↓
Production
```

Branches:

```text
main

develop

feature/*
```

Suggested flow:

```text
Feature Branch
↓
Pull Request
↓
Review
↓
Preview Deployment
↓
Test
↓
Merge
↓
Production
```

Vercel preview deployments will be particularly useful for getting instructor/student feedback before merging.

---

# 65. Environment Variables

V1 should require very few environment variables.

If analytics are introduced:

```text
NEXT_PUBLIC_ANALYTICS_KEY
```

Otherwise the core learning application should run without external secrets.

This makes local development simple.

---

# 66. Development Environment

Recommended:

```text
Node.js 20+
npm / pnpm
Git
VS Code / Cursor
Chrome
```

Chrome DevTools will be particularly useful for:

- animation debugging,
- responsive testing,
- performance testing,
- localStorage inspection.

---

# 67. Definition of Done for a Simulation

A simulation is not complete simply because the animation works.

Every simulation must have:

- clear learning objective,
- initial prediction,
- visual simulation,
- pause/continue controls,
- inspectable components where relevant,
- user interaction,
- at least one failure state,
- challenge,
- explanation,
- responsive layout,
- keyboard accessibility,
- reduced-motion behavior,
- automated tests for critical state transitions.

---

# 68. Definition of Done for V1

V1 is technically ready when:

Students can access the platform without authentication.

They can complete:

```text
Request Lifecycle
HTTP
CRUD
Authentication & Authorization
Middleware
Deployment
```

They can complete:

```text
What Happens When You Log In?
```

They can:

```text
See
Interact
Pause
Inspect
Change
Break
Retry
Explain
```

Instructors can:

```text
Open
Present
Pause
Navigate
Restart
Trigger failure
```

Progress persists locally.

The experience works on:

- modern desktop browsers,
- tablets,
- usable mobile layouts.

The application remains usable on moderate network connections.

---

# 69. Final Technical Stack

```text
APPLICATION

Next.js
React
TypeScript


UI

Tailwind CSS


ANIMATION

Framer Motion


2D VISUALIZATION

SVG


ARCHITECTURE DIAGRAMS

React Flow


3D VISUALIZATION

Three.js
React Three Fiber
Drei


GUIDED LEARNING

Driver.js


STATE

Zustand


PROGRESS

localStorage


HOSTING

Vercel
```

---

# 70. Technical Principle

The most important engineering principle for this project is:

> **The simulation engine is the product infrastructure. The animations are implementations of that infrastructure.**

If V1 is built as six beautiful but unrelated animations, adding another 50 concepts later will become painful.

If V1 creates a reusable language of:

```text
Nodes
Connections
Packets
Steps
Events
Failures
Interactions
Explanations
```

then future lessons can become compositions of the same system.

That architecture is what can eventually allow Under the Hood to grow from six lessons into a much larger interactive software engineering curriculum without rebuilding the application every time.