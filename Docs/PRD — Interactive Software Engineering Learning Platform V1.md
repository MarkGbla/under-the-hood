# Product Requirements Document

## Working Title
**Under the Hood**  
*A visual, interactive way to understand how software actually works.*

## Version
**V1 / MVP**

## Product Type
Interactive software engineering learning platform

## Primary Audience
- University students
- Beginner and early-stage software engineering students
- Bootcamp learners
- Self-taught developers
- Instructors teaching software engineering fundamentals

## Core Constraint
**No login required for students.**

---

# 1. Product Summary

Under the Hood is a visual and interactive learning platform that helps students understand fundamental software engineering concepts by **seeing systems work**, not just reading explanations or memorizing programming syntax.

The platform focuses on questions like:

- What actually happens when I click Login?
- What does a server really do?
- How does a request move from my browser to a database?
- What is middleware doing in between?
- How does CRUD actually affect stored data?
- Why do we need authentication and authorization?
- What happens when an application is deployed?
- What does a webhook actually do?
- Why does caching make an application faster?

The first version will not attempt to teach all of software engineering.

Instead, V1 will prove one idea:

> **Can students understand and explain difficult software engineering concepts better when they can see and interact with the system?**

The platform should feel closer to a **software engineering laboratory** than a normal online course.

Students should:

**See → Interact → Predict → Break → Fix → Explain**

rather than:

**Read → Read → Read → Quiz**

---

# 2. Why This Product Should Exist

A major problem in beginner software engineering education is that students often learn programming before understanding the systems their programs run inside.

A student may know how to write:

```javascript
fetch("/api/users")
```

but not confidently explain:

- where the request goes,
- what HTTP is doing,
- what server receives it,
- what middleware does,
- how a controller handles it,
- how data reaches the database,
- and how a response gets back to the browser.

This problem is becoming even more important because modern AI coding tools make it easier to generate working software without understanding the underlying engineering.

A student can now:

- generate an API,
- connect a database,
- add authentication,
- deploy an application,

while still being unable to explain what those systems are doing.

The goal of this platform is therefore not to help students produce more code.

The goal is:

> **Build strong mental models of software systems.**

---

# 3. Connection to the Existing Christex Curriculum

The existing **Engineering-Curriculum-Web2** repository already provides a strong conceptual foundation.

The curriculum covers:

- HTTP fundamentals
- Request lifecycle
- Router → Controller → Service → Repository
- Middleware
- Authentication
- Authorization
- CRUD
- Databases
- Database relationships
- Search and filtering
- Security
- Caching
- Performance
- Logging
- Monitoring
- Webhooks
- Event-driven architecture
- Deployment
- Testing

Its teaching philosophy is already aligned with this product:

> concepts first, implementation second.

The instructor guide also repeatedly encourages instructors to:

- draw diagrams,
- demonstrate concepts visually,
- intentionally break systems,
- ask students to predict what happens,
- show slow operations before optimization,
- show cache hits vs misses,
- demonstrate authentication flows,
- make abstract engineering concepts tangible.

That is important.

The new platform should not replace the curriculum.

It should become the **interactive visual layer of the curriculum**.

The existing material tells instructors:

> Draw the request lifecycle.

The product should make that request lifecycle executable.

The curriculum tells instructors:

> Show cache hit vs cache miss.

The platform should let the student toggle caching and watch latency change.

The curriculum tells instructors:

> Show authentication and authorization separately.

The platform should let students watch a request pass authentication and fail authorization.

---

# 4. Product Vision

The long-term vision is:

> **A visual playground for understanding software engineering from first principles.**

Eventually, a learner could explore:

```text
Computers
↓
Internet
↓
HTTP
↓
Servers
↓
APIs
↓
Databases
↓
Authentication
↓
Application Architecture
↓
Performance
↓
Cloud
↓
Deployment
↓
Distributed Systems
↓
System Design
```

But V1 will deliberately stay much smaller.

---

# 5. V1 Objective

V1 exists to answer one question:

> **Does interactive visualization significantly improve a beginner's ability to explain software engineering concepts?**

We should not measure V1 mainly by:

- registrations,
- followers,
- certificates,
- number of lessons,
- number of pages,
- amount of content.

We should measure whether a learner can explain something they previously did not understand.

---

# 6. North-Star Learning Outcome

After completing a simulation, a learner should be able to answer:

> **“Can you explain what just happened without looking at the screen?”**

For V1, that matters more than course completion.

Example:

Before using the HTTP simulator:

> “What happens when a browser requests user data?”

Student answer:

> “It just goes to the backend.”

After using it:

> “The browser sends an HTTP request to the server. The request has a method, URL, headers and possibly a body. The server receives it, middleware can process it first, then the route/controller handles it, maybe accesses the database, and sends an HTTP response back.”

That change in understanding is the product.

---

# 7. V1 Target User

## Primary Persona — Beginner Engineering Student

A student who:

- has seen code before,
- may know basic JavaScript/Python,
- has heard words such as API, backend and database,
- can follow tutorials,
- struggles to visualize what is happening underneath,
- frequently asks “but how does this actually work?”

They might be:

- a university student,
- Christex learner,
- bootcamp student,
- Code & Coffee learner,
- self-taught beginner.

They do not need deep programming knowledge to begin V1.

---

# 8. Secondary Persona — Instructor

An instructor wants to teach concepts without spending half the lesson drawing the same diagrams repeatedly.

They need something they can:

- open instantly,
- display on a projector,
- pause,
- replay,
- manipulate,
- ask students questions around.

Example:

Instructor opens:

```text
/learn/http
```

Clicks:

**Send Request**

Then pauses as the request reaches the server.

Instructor asks:

> “What happens next?”

This makes the platform useful inside actual classrooms, not just for self-paced learners.

---

# 9. Product Principles

These rules should guide every design and engineering decision.

## Principle 1 — If we can simulate it, do not only explain it

Bad:

> Middleware is software that processes requests before your route handler.

Better:

```text
Request
   ↓
Logger
   ↓
Authentication
   ↓
Validation
   ↓
Controller
```

Best:

Let the student turn authentication middleware off and watch an unauthorized request pass through.

---

## Principle 2 — Concepts over technologies

Do not structure the platform as:

- Learn Express
- Learn Redis
- Learn PostgreSQL
- Learn JWT

Instead:

- Learn request routing
- Learn caching
- Learn relational databases
- Learn authentication

Technology can appear as examples.

The concept is the lesson.

---

## Principle 3 — Very little text

Text explains what animation cannot.

A screen should not look like documentation.

Aim for:

**70% interaction / visualization**

**30% explanation**

rather than the reverse.

---

## Principle 4 — Beginner language without removing technical accuracy

Students should encounter real vocabulary:

- HTTP
- header
- token
- middleware
- index
- controller
- latency

But explanations should remain simple.

Do not hide technical terminology.

Explain it.

---

## Principle 5 — Failure teaches

Students should be able to break the simulation.

Examples:

- remove token → 401
- wrong role → 403
- missing route → 404
- disable database → request fails
- disable cache → request becomes slower
- remove middleware → unexpected behavior

Failures create understanding.

---

## Principle 6 — No signup wall

A student opens the site and learns immediately.

No:

- email,
- password,
- onboarding questionnaire,
- account creation.

Progress can be stored locally.

---

## Principle 7 — Every simulation ends with explanation

A user should never finish with only:

> Congratulations!

Instead:

> **Explain what happened.**

---

# 10. V1 Scope

The biggest risk to this product is trying to teach everything immediately.

Therefore V1 should contain **6 core learning experiences**, not 30 or 100.

These six topics create a connected mental model.

## V1 Topics

1. **How a Web Request Works**
2. **HTTP Request & Response**
3. **CRUD + Database**
4. **Authentication vs Authorization**
5. **Middleware & Request Lifecycle**
6. **Deployment: From Laptop to Internet**

And one larger experience:

## V1 Capstone Simulation

**What Happens When You Log Into an App?**

This combines concepts from several lessons.

---

# 11. Why These Six Topics

They cover the most important invisible systems a beginner encounters when building web applications.

They also map strongly to the existing Christex backend curriculum.

They create a natural learning sequence:

```text
Browser
↓
HTTP
↓
Server
↓
Middleware
↓
Application Logic
↓
Database
↓
Authentication
↓
Response
↓
Deployment
```

Rather than creating unrelated mini-games, V1 should teach one coherent system.

---

# 12. Information Architecture

Home:

```text
/
```

Explore:

```text
/explore
```

Lessons:

```text
/learn/request-lifecycle
/learn/http
/learn/crud
/learn/auth
/learn/middleware
/learn/deployment
```

Combined simulation:

```text
/simulations/login
```

Instructor mode:

```text
/learn/http?present=true
```

No account pages in V1.

---

# 13. Homepage

## Hero

**Under the Hood**

> See how software actually works.

Supporting copy:

> Explore servers, requests, databases, authentication and deployment through interactive visual simulations.

CTA:

**Start Exploring**

Secondary:

**I'm teaching a class**

Small text:

> No signup required.

---

# 14. Explore Screen

Simple grid.

Example:

### Request Lifecycle

**What really happens after you click a button?**

Status:

```text
Start →
```

### HTTP

**See what travels between browsers and servers.**

### CRUD

**Create, read, update and delete real visual records.**

### Authentication

**See how applications know who you are.**

### Middleware

**Follow requests through application checkpoints.**

### Deployment

**Watch code move from your laptop to production.**

Then:

### Login Simulator

**Put everything together.**

---

# 15. Standard Lesson Structure

Every V1 lesson should follow the same experience.

## Stage 1 — Hook

Ask a simple question.

Example:

> You clicked “Get Profile.” What happens next?

Do not explain yet.

---

## Stage 2 — Predict

Student chooses:

```text
A. Browser talks directly to the database

B. Browser sends a request to a server

C. Database sends a request to the browser
```

No punishment for wrong answers.

This gets the learner thinking.

---

# Stage 3 — Run the Simulation

Student clicks:

**Run**

An animated request begins moving.

---

# Stage 4 — Pause and Inspect

The animation stops at important points.

Student can click the moving request.

Example:

```text
GET /api/profile

Headers
Authorization: Bearer eyJ...

Body
none
```

Explain only what is relevant.

---

# Stage 5 — Change Something

Examples:

- change GET → POST
- remove token
- remove middleware
- change a database row
- disable cache

---

# Stage 6 — Break It

Give the learner a challenge.

Example:

> Make this request fail with `401 Unauthorized`.

They remove the authentication token.

Result:

```text
401 Unauthorized
```

---

# Stage 7 — Explain It

Question:

> What does authentication middleware do?

Possible interactive assessment:

Drag into order:

```text
Request
Auth Middleware
Controller
Response
```

or multiple choice.

---

# Stage 8 — Final Explanation

Show a concise explanation.

Then ask:

> Could you explain this to another student?

```text
Not yet
I think so
Yes
```

Save locally.

---

# 16. Lesson 1 — Request Lifecycle

## Goal

Understand what happens between clicking something in a browser and receiving data.

## Visual Components

```text
Browser
Internet
Server
Router
Controller
Service
Database
Response
```

## Initial State

Browser with:

**Get Profile**

button.

Student clicks.

Animation:

```text
Browser
   ↓
Request
   ↓
Server
   ↓
Router
   ↓
Controller
   ↓
Service
   ↓
Database
```

Then reverse response animation.

---

## Concepts

- client
- server
- request
- response
- backend
- database
- route
- application logic

---

## Interaction

Pause at each stage.

Click component to see:

**Router**

> Decides which part of the application handles the request.

**Controller**

> Receives the request and coordinates what should happen.

**Service**

> Contains the application's business logic.

**Database**

> Stores and retrieves information.

---

## Challenge

> Put the request lifecycle in the correct order.

Drag:

```text
Database
Browser
Server
Controller
Response
```

Correct:

```text
Browser → Server → Controller → Database → Server → Browser
```

Keep simplified at this stage.

---

# 17. Lesson 2 — HTTP

## Goal

Understand what browsers and servers actually send to each other.

Visual:

```text
BROWSER                         SERVER

┌────────────┐               ┌────────────┐
│            │               │            │
│ Get User   │               │ /api/user  │
│            │               │            │
└────────────┘               └────────────┘

        ●──────────────→
```

The dot represents an HTTP request.

Student clicks it.

---

## Request Inspector

```text
GET /api/users/42

Headers
Accept: application/json

Body
None
```

Response:

```text
200 OK

{
  "id": 42,
  "name": "Mariama"
}
```

---

## Student Can Change

Method:

```text
GET
POST
PATCH
DELETE
```

Endpoint.

Body.

---

## Scenarios

Valid:

```text
GET /users/42
→ 200 OK
```

Missing:

```text
GET /users/999
→ 404 Not Found
```

Create:

```text
POST /users
→ 201 Created
```

Invalid request:

```text
POST /users
missing name
→ 400 Bad Request
```

---

# 18. Lesson 3 — CRUD + Database

## Goal

Understand that CRUD operations manipulate stored application data.

Visual database:

| ID | Name | Role |
|---|---|---|
| 1 | Mariama | Student |
| 2 | Abdul | Student |
| 3 | Sarah | Instructor |

Buttons:

```text
CREATE
READ
UPDATE
DELETE
```

---

## CREATE

Student adds:

```text
Name: Ibrahim
Role: Student
```

Visual request:

```text
POST /users
```

moves to server.

Then:

```text
INSERT
```

moves to database.

New row appears.

---

## UPDATE

Select Mariama.

Change:

```text
Student → Instructor
```

Watch row update.

---

## DELETE

Delete user.

Visual record fades out.

---

## Learning Outcome

Student should understand:

> CRUD describes the four basic operations applications perform on stored data: Create, Read, Update and Delete.

---

# 19. Lesson 4 — Authentication vs Authorization

This needs to be one of V1's strongest experiences.

## Goal

Students should never confuse these concepts again.

Visual:

### Authentication

```text
WHO ARE YOU?
```

### Authorization

```text
WHAT ARE YOU ALLOWED TO DO?
```

---

## Scenario

User:

```text
Name: Mariama
Role: Student
```

Attempts:

```text
GET /profile
```

Authentication:

```text
✅ Identity verified
```

Authorization:

```text
✅ User may view own profile
```

Then:

```text
DELETE /admin/users
```

Authentication:

```text
✅ Identity verified
```

Authorization:

```text
❌ Student role cannot perform this action

403 Forbidden
```

This visual distinction is the lesson.

---

# 20. Lesson 5 — Middleware

## Goal

Understand that middleware processes requests before they reach application logic.

Visual metaphor:

```text
REQUEST
   ↓
LOGGING
   ↓
AUTHENTICATION
   ↓
VALIDATION
   ↓
CONTROLLER
```

Each middleware is a physical checkpoint.

---

## Interaction

Toggle:

```text
[✓] Logging

[✓] Authentication

[✓] Validation
```

Turn authentication off.

Send protected request.

Request passes.

Display:

> Authentication middleware was disabled, so the request reached the route without identity verification.

---

## Challenge

> A request contains invalid data. Which middleware should stop it?

Student selects:

**Validation**

---

# 21. Lesson 6 — Deployment

## Goal

Understand what “deploying an application” means.

Visual starting point:

```text
Laptop
```

Student has:

```text
my-app/
```

Clicks:

**Deploy**

Animation:

```text
Laptop
 ↓
Git Push
 ↓
Repository
 ↓
Build
 ↓
Tests
 ↓
Cloud Server
 ↓
Domain
 ↓
Users
```

Status:

```text
Uploading code...
Building...
Running tests...
Starting application...
Connecting domain...

✅ LIVE
```

---

## Environment Demonstration

Tabs:

```text
LOCAL

STAGING

PRODUCTION
```

Explain:

**Local**

Runs on your computer.

**Production**

Runs somewhere users can reach over the internet.

---

## Failure Scenario

Tests fail.

Deployment stops.

Student sees:

```text
❌ TEST FAILED

Deployment cancelled.
```

This introduces CI/CD conceptually without teaching GitHub Actions syntax.

---

# 22. V1 Capstone — “What Happens When You Log In?”

This should be the centerpiece of the first release.

## Scenario

Simple application login:

```text
Email
Password

[ Login ]
```

Student clicks.

Then simulation begins.

---

## Step 1

Browser creates:

```text
POST /api/login

Body:
{
 email,
 password
}
```

---

## Step 2

Request travels to server.

---

## Step 3

Logging middleware records request.

---

## Step 4

Validation middleware checks input.

---

## Step 5

Router identifies login handler.

---

## Step 6

Authentication service requests user from database.

---

## Step 7

Database returns stored user.

Important visualization:

```text
Entered password
       ↓
Password verification
       ↓
Stored password hash
```

No need to teach bcrypt internals deeply in V1.

---

## Step 8

Credentials valid.

Server generates:

```text
Session / Token
```

---

## Step 9

Server returns:

```text
200 OK
```

---

## Step 10

Browser stores authentication state.

---

## Step 11

User enters dashboard.

---

# 23. Capstone Failure Modes

Student should be able to manipulate:

### Wrong Password

```text
401 Unauthorized
```

### Missing Email

```text
400 Bad Request
```

### Database unavailable

```text
500 Internal Server Error
```

### Invalid Token on protected request

```text
401 Unauthorized
```

### Valid user, wrong role

```text
403 Forbidden
```

This one simulation reinforces most of V1.

---

# 24. “Explain It” Assessment

Every topic needs a comprehension check.

Do not focus on memorization.

Ask students to reconstruct systems.

Example:

> Arrange this login flow.

Cards:

```text
Database
Browser
Server
Password Verification
HTTP Request
Response
```

Correct sequence.

---

Another:

> Why does a browser usually not communicate directly with the application's database?

Answers.

---

Another:

> Authentication succeeded but authorization failed. What does this mean?

Correct:

> The system knows who the user is, but the user does not have permission for the requested action.

---

# 25. Local Progress

No accounts.

Use:

```text
localStorage
```

Track:

```text
completedLessons
lessonProgress
quizResults
confidence
lastVisited
```

Example:

```text
Request Lifecycle       ✓

HTTP                    ✓

CRUD                    70%

Authentication          30%

Middleware              Not started

Deployment              Not started
```

---

# 26. Returning Student Experience

When they return:

```text
Welcome back.

Continue where you left off:

Authentication vs Authorization
Step 3 of 6

[ Continue ]
```

No identity required.

This creates continuity without creating account infrastructure.

---

# 27. Instructor Mode

V1 should support instructors from the beginning because this aligns directly with Christex.

Toggle:

```text
Presentation Mode
```

or URL parameter:

```text
?present=true
```

Presentation mode:

- hides progress UI,
- increases diagram size,
- increases text size,
- removes unnecessary navigation,
- allows keyboard control.

Controls:

```text
Space — Play/Pause

→ — Next step

← — Previous

R — Reset

F — Trigger failure
```

---

# 28. Instructor Questions

During simulation, optional prompts appear:

> Ask the class: What do you think happens next?

or:

> Ask: Why should the browser not store the user's password?

Instructor can hide prompts.

---

# 29. V1 Visual System

Consistency is critical.

A user should learn what components mean visually.

## Browser

Rectangle with browser toolbar.

## Request

Moving circular packet.

## Response

Different moving packet.

## Server

Server rack/card.

## Database

Cylinder.

## Middleware

Gate/checkpoint.

## User

Human/avatar icon.

## Error

Red state around failing component.

## Success

Simple success state.

---

# 30. Animation Rules

Animations should teach.

They should not exist purely to look beautiful.

Good animation:

A request visibly enters middleware and stops.

Bad animation:

Random floating gradients around the screen.

Animation speed should allow understanding.

Default:

~1 second between important stages.

Controls:

```text
Pause
Continue
Restart
Speed
```

Optional:

```text
0.5x
1x
2x
```

---

# 31. Mobile Experience

The platform should work on phones, but V1 design should prioritize:

1. laptops,
2. classroom projection,
3. tablets,
4. mobile.

On mobile, complex diagrams should become vertical.

Example desktop:

```text
Browser → Server → Database
```

Mobile:

```text
Browser
 ↓
Server
 ↓
Database
```

---

# 32. Performance

This matters especially for students using slower connections.

Target:

- minimal video,
- SVG/CSS animations,
- no unnecessary large assets,
- pages functional on moderate mobile networks,
- lazy-load simulations,
- avoid huge JavaScript dependencies where possible.

The teaching experience should not depend on streaming video.

---

# 33. Accessibility

V1 should include:

- keyboard navigation,
- visible focus states,
- text labels in addition to icon/color,
- reduced-motion support,
- responsive layouts,
- readable contrast,
- clear language.

Animation cannot be the only way information is communicated.

---

# 34. Recommended Technical Architecture

Keep V1 frontend-only unless a backend becomes necessary.

## Framework

```text
Next.js
```

## Language

```text
TypeScript
```

## Styling

```text
Tailwind CSS
```

## Animation

```text
Framer Motion
```

## Complex Diagram Interactions

Use:

```text
React Flow
```

only where necessary.

For basic simulations:

```text
SVG + React
```

will likely be lighter and easier.

---

# 35. Why No Backend in V1

V1 doesn't need:

- authentication,
- user accounts,
- cloud progress,
- instructor accounts,
- payments,
- certificates,
- admin dashboards.

Therefore adding:

- Supabase,
- PostgreSQL,
- authentication infrastructure,

would create work without improving the learning experiment.

Static deployment also makes the application easier to maintain and cheaper to operate.

---

# 36. Content Architecture

Lessons should be data-driven where practical.

Example:

```ts
type Lesson = {
  slug: string
  title: string
  description: string
  learningObjectives: string[]
  steps: Step[]
  challenges: Challenge[]
  questions: Question[]
}
```

Then individual simulation components can handle visual behavior.

---

# 37. Suggested Project Structure

```text
app/
  page.tsx

  explore/
    page.tsx

  learn/
    request-lifecycle/
    http/
    crud/
    auth/
    middleware/
    deployment/

  simulations/
    login/

components/

  simulation/
    Browser.tsx
    Server.tsx
    Database.tsx
    RequestPacket.tsx
    MiddlewareGate.tsx
    ResponsePacket.tsx

  learning/
    Prediction.tsx
    Explanation.tsx
    Challenge.tsx
    Quiz.tsx

  instructor/
    PresentationControls.tsx

content/

  request-lifecycle.ts
  http.ts
  crud.ts
  auth.ts
  middleware.ts
  deployment.ts

lib/

  progress.ts
```

---

# 38. V1 Design Direction

Avoid making it look like:

- LMS software,
- university portal,
- admin dashboard,
- coding bootcamp website.

It should feel exploratory.

Think:

- clean background,
- large interactive canvas,
- strong typography,
- minimal navigation,
- visual objects at the center.

The simulation should always be the hero.

---

# 39. Homepage Design Priorities

Users should understand the product within about five seconds.

Hero:

> **Software makes more sense when you can see it.**

Supporting:

> Explore how requests, servers, databases, authentication and deployment actually work.

CTA:

**Explore Software**

No giant product explanation before the learner sees something interactive.

---

# 40. Delight Without Distraction

A request packet can bounce slightly when waiting.

A database can pulse when queried.

A middleware gate can physically stop a request.

A successful deployment can show a short launch animation.

These small moments make learning memorable.

But avoid excessive:

- confetti,
- XP popups,
- streak warnings,
- cartoon mascots everywhere.

Understanding should be the reward.

---

# 41. Gamification in V1

Very light.

Possible:

```text
6 concepts

3 understood
```

Badges can wait.

No leaderboard.

No streak.

No XP economy.

We need to learn whether people enjoy the simulations first.

---

# 42. What Is Explicitly Out of Scope

V1 will NOT include:

- student accounts,
- instructor accounts,
- certificates,
- payments,
- leaderboards,
- streaks,
- AI tutors,
- AI-generated lessons,
- full coding IDE,
- code execution,
- social/community features,
- discussion forums,
- complete computer science curriculum,
- advanced algorithms,
- distributed systems,
- cloud provider-specific tutorials,
- Kubernetes,
- full system-design interview preparation,
- native mobile apps,
- complex analytics dashboard.

These can distract from testing the core idea.

---

# 43. V1 Content Boundaries

Even within V1 topics, do not overteach.

Example:

Authentication lesson does NOT need to deeply teach:

- OAuth flows,
- SAML,
- refresh-token rotation,
- public/private-key cryptography.

Teach the mental model first.

Advanced versions can come later.

---

# 44. Student Testing Plan

This is essential.

Before launch, test with real students.

Ideal initial group:

**10–20 learners.**

Preferably mix:

- beginners,
- university students,
- students who already build applications,
- Christex learners.

---

# 45. Learning Test

Before simulation:

Ask:

> Explain what happens when you log into a web application.

Record answer.

Let them use login simulation.

Afterward:

Ask exactly the same question.

Compare.

We want evidence of better mental models.

---

# 46. Qualitative Questions

Ask students:

- What confused you?
- Where did you want to click but couldn't?
- What part made something finally make sense?
- Did anything feel childish?
- Was anything too technical?
- What would you want to explore next?
- Would you use this without an instructor?
- Would you come back to learn another topic?

---

# 47. Instructor Testing

Ask instructors:

- Would you project this during class?
- Which simulation would replace one of your existing diagrams?
- Was it easy to pause and explain?
- Did students ask better questions?
- Did it save teaching time?
- What controls did you need?

---

# 48. V1 Success Metrics

Do not overcomplicate analytics.

## Primary

### Concept Explanation Improvement

Percentage of test students who can give a clearer and more accurate explanation after simulation.

Target:

**70%+ show clear improvement.**

---

## Secondary

### Simulation Completion

Percentage who reach explanation stage.

Target:

**70%+.**

### Interaction Rate

Did students actually change/toggle/break things?

Target:

**60%+ interact beyond simply pressing Next.**

### Return Intent

Question:

> Would you use this to learn another software engineering topic?

Target:

**70%+ yes.**

### Instructor Usefulness

Question:

> Would you use this during a real class?

Target:

**70%+ yes** among participating instructors.

These are discovery targets, not hard promises.

---

# 49. Analytics Without Accounts

Basic anonymous events:

```text
lesson_started

simulation_started

simulation_completed

challenge_attempted

challenge_completed

lesson_completed

presentation_mode_used
```

No personally identifying information needed.

For the earliest test, even manual observation may be more useful than a full analytics implementation.

---

# 50. Build Priorities

## P0 — Must Have

- homepage,
- explore screen,
- consistent visual system,
- request lifecycle simulation,
- HTTP simulation,
- CRUD simulation,
- authentication/authorization simulation,
- middleware simulation,
- deployment simulation,
- login capstone simulation,
- lesson progression,
- explanation questions,
- local progress,
- responsive layouts,
- presentation mode.

---

## P1 — Nice to Have

- simulation speed control,
- confidence rating,
- keyboard shortcuts,
- reduced-motion support,
- lightweight anonymous analytics,
- shareable direct links.

---

## P2 — Later

- badges,
- saved custom instructor sequences,
- downloadable lesson plans,
- local language support,
- AI explanation feedback,
- cloud sync,
- accounts.

---

# 51. Development Sequence

Do not build all six simulations simultaneously.

## Phase 1 — Build the System Language

First create:

- Browser
- Server
- Database
- Request
- Response
- Middleware
- animation engine/state model

Then these components can be reused.

---

## Phase 2 — Build One Excellent Simulation

Build:

# What Happens When You Log In?

Even though it is the eventual capstone, prototype it first.

Why?

Because it forces us to solve:

- animation,
- browser/server communication,
- authentication,
- database interaction,
- middleware,
- error states,
- explanation flow.

If login simulation feels great, the platform idea works.

---

# 52. Login Prototype Minimum

First internal prototype only needs:

```text
Login Screen

↓ click Login

HTTP Request

↓

Server

↓

Auth Middleware

↓

Database

↓

Password Check

↓

Token

↓

Response

↓

Dashboard
```

Add controls:

```text
Play

Pause

Next

Restart
```

Then one failure:

**Wrong password.**

That is enough for prototype #1.

---

# 53. Phase 3 — Student Test the Login Prototype

Before building anything else:

Give it to students.

Watch them without explaining how to use it.

Look for:

- Do they understand what is moving?
- Do they click components?
- Do they understand request vs response?
- Do they pause?
- Do they ask useful questions?
- Can they explain login afterward?

If not, fix the teaching model.

Do not solve poor learning with more features.

---

# 54. Phase 4 — Extract Reusable Simulation Engine

Once login works:

Turn patterns into reusable components.

For example:

```tsx
<Flow>
  <Browser />
  <Request />
  <Middleware />
  <Server />
  <Database />
</Flow>
```

Then build remaining lessons much faster.

---

# 55. Phase 5 — Build Remaining Core Topics

Order:

1. Request Lifecycle
2. HTTP
3. CRUD
4. Authentication + Authorization
5. Middleware
6. Deployment

Then reconnect everything into Login Simulator.

---

# 56. Suggested Release Definition

V1 is ready when:

A beginner can enter without an account and complete:

```text
Request Lifecycle
HTTP
CRUD
Authentication
Middleware
Deployment
```

and then complete:

**What Happens When You Log In?**

They can:

- play,
- pause,
- inspect,
- alter,
- break,
- retry,
- explain.

An instructor can display the same simulations in presentation mode.

That is V1.

---

# 57. What V1 Should Feel Like

Not:

> “I finished six lessons.”

Ideally:

> “I finally understand what the backend is doing.”

or:

> “Oh, that's where middleware comes in.”

or:

> “Now I understand the difference between 401 and 403.”

or:

> “So deployment basically means taking the application from my machine and putting it somewhere users can reach.”

Those moments are the product.

---

# 58. Risks

## Risk 1 — Overbuilding

Biggest risk.

There are hundreds of possible engineering topics.

Mitigation:

Do not add another topic until the first learning experiences are good.

---

## Risk 2 — Beautiful but shallow

Animations could look impressive without improving understanding.

Mitigation:

Every animation must answer a learning objective.

Test explanations afterward.

---

## Risk 3 — Too childish

Visual learning can easily become cartoonish.

Mitigation:

Professional visual design.

Simple language but real engineering terminology.

---

## Risk 4 — Too technical

If every packet displays raw networking detail, beginners will be overwhelmed.

Mitigation:

Progressive disclosure.

Simple default.

Click **See More** for deeper detail.

---

## Risk 5 — Passive animations

If students only press Next, this becomes a video disguised as a website.

Mitigation:

Require:

- predictions,
- toggles,
- failures,
- ordering,
- challenges.

---

## Risk 6 — Curriculum drift

The platform could slowly separate from what Christex actually teaches.

Mitigation:

Map each simulation to explicit curriculum concepts.

---

# 59. How This Extends the Existing Christex Curriculum

Example:

## Existing Week 1

Current learning objectives include:

- request lifecycle,
- HTTP,
- middleware,
- router/controller/service/repository.

The interactive platform can become the concept-teaching tool.

Then students move to the existing coding lesson.

Flow becomes:

```text
SEE IT

↓

UNDERSTAND IT

↓

BUILD IT
```

instead of:

```text
SLIDES

↓

AI GENERATED CODE

↓

TRY TO UNDERSTAND IT
```

That is a meaningful improvement.

---

# 60. How Instructors Can Use It With the Curriculum

Example class:

### First 20 minutes

Use Request Lifecycle simulator.

### Next 10 minutes

Students explain the lifecycle.

### Next 30 minutes

Instructor shows project architecture.

### Next section

Students build the actual Express server.

This means the platform does not compete with hands-on coding.

It makes the coding make more sense.

---

# 61. Future Curriculum Expansion

Only after V1 validation.

Possible next areas:

## V2

- database relationships,
- indexes,
- caching,
- webhooks,
- file uploads,
- logging,
- rate limiting.

## V3

- DNS,
- TCP/IP,
- queues,
- WebSockets,
- load balancers,
- CDNs,
- cloud architecture.

## V4

- algorithms,
- data structures,
- system design,
- distributed systems.

But these should remain future ideas, not V1 obligations.

---

# 62. Product Positioning

Do not position as:

> Learn Backend Development.

Too narrow.

Do not position as:

> Learn to Code.

Wrong problem.

Do not position as:

> System Design Interview Prep.

Too advanced.

Position it as:

> **Understand how software works.**

Or:

> **Software engineering, visually.**

Or:

> **See what's happening under the hood.**

---

# 63. Product Promise

A strong promise could be:

> **Don't just use servers, APIs and databases. Understand what they're doing.**

---

# 64. Differentiation

The product is not primarily:

- documentation,
- video,
- coding tutorials,
- quizzes,
- interview preparation.

Its strongest differentiation is:

## Interactive mental models.

Students manipulate the system itself.

The system teaches them.

---

# 65. Product Philosophy

This should sit somewhere in the project's README:

> **If we can show it, don't only explain it.  
> If we can simulate it, don't only show it.  
> If students can break it, let them.  
> If they cannot explain it afterward, we haven't taught it yet.**

---

# 66. First Engineering Milestone

Do **not** begin by creating the full homepage or course map.

The first milestone should be:

## One functioning Login Flow Simulator.

Success criteria:

A user can:

1. enter credentials,
2. click Login,
3. watch request travel,
4. inspect HTTP request,
5. see middleware,
6. see server handling,
7. see database lookup,
8. see password verification,
9. see token/session creation,
10. see HTTP response,
11. reach dashboard,
12. restart,
13. intentionally submit wrong password,
14. understand why request fails.

If this is genuinely good, everything else has a foundation.

---

# 67. First User Test Script

Before:

> What happens technically when you log into a website?

Do not help.

Record response.

Then:

> Use this simulation. Explore it however you want.

Observe.

After:

> Now explain what happens when you log into a website.

Then:

> What part of the simulation helped you understand it?

Then:

> What was confusing?

Then:

> What would you want to learn next using this style?

This single test will tell us more than weeks of speculation.

---

# 68. Decision Gate After Prototype

After 10–20 tests:

## Continue if:

- most students improve explanations,
- students interact voluntarily,
- instructors see classroom value,
- students want another topic.

## Rework if:

- students mainly watch animations passively,
- students still cannot explain concepts,
- UI requires constant instructor explanation.

## Stop or rethink if:

- visual interaction adds little compared with a good static diagram,
- users find the experience slower or more confusing than conventional teaching.

The idea should earn the right to become larger.

---

# 69. Final V1 Definition

Under the Hood V1 is:

> **A no-login interactive software engineering learning platform that helps beginners understand six fundamental web engineering concepts through visual simulations, experimentation and explanation, with a combined login-flow experience and a classroom presentation mode for instructors.**

It is **not** yet the complete software engineering school.

It is the proof that the teaching method works.

---

# 70. The Single Most Important Product Question

Throughout development, keep asking:

> **Will this interaction make the student better able to explain what is happening?**

If the answer is no, don't build it.

That should protect the product from becoming a collection of flashy animations with little educational value.

---

# 71. Recommended V1 Build Order

```text
1. Visual design system
        ↓
2. Login flow prototype
        ↓
3. Test with students
        ↓
4. Improve interaction model
        ↓
5. Reusable simulation components
        ↓
6. Request lifecycle
        ↓
7. HTTP
        ↓
8. CRUD
        ↓
9. Authentication + Authorization
        ↓
10. Middleware
        ↓
11. Deployment
        ↓
12. Rebuild Login simulator using all concepts
        ↓
13. Instructor presentation mode
        ↓
14. Local progress
        ↓
15. Test full V1
        ↓
16. Public release
```

The key is that **Step 3 happens before Step 6**.

We test the idea before building the curriculum.

---

# Closing Direction

The existing Christex curriculum gives us something valuable: the concepts, teaching structure, common student confusion, instructor guidance and learning outcomes are already there.

The product does not need to invent a completely new curriculum for V1.

It needs to invent a **better interface for understanding that curriculum**.

The first release should therefore stay focused.

Make one invisible software process visible.

Let students interact with it.

Let them break it.

Then ask them to explain it.

If that works, we can gradually build the larger vision:

> **A place where anyone can open software systems, look inside them, and finally understand how they work.**