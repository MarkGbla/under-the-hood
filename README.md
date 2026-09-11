# Under the Hood

Under the Hood is an interactive learning website that helps beginners see how software systems work.

Instead of only reading explanations, learners can watch requests move through a system, inspect what each part contains, trigger failures, and explain what happened.

## What you can learn

The project includes six guided lessons:

1. How a web request works
2. HTTP requests and responses
3. CRUD operations
4. Authentication and authorization
5. Middleware
6. Deployment

It also includes:

- An interactive login-flow simulation
- A visual playground for building and testing system diagrams
- Play, pause, step, restart, speed, and failure controls
- Inspectable request and response data
- Progress saved locally in the browser
- A presentation mode for classroom use

## Run the project locally

You need [Node.js](https://nodejs.org/) 20.9 or newer and npm 10 or newer.

```bash
git clone https://github.com/MarkGbla/under-the-hood.git
cd under-the-hood
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Main pages

| Page | Purpose |
| --- | --- |
| `/` | Home and lesson overview |
| `/explore` | Browse all lessons |
| `/learn/request-lifecycle` | Follow a browser request through a backend |
| `/learn/http` | Inspect HTTP requests and responses |
| `/learn/crud` | Explore create, read, update, and delete operations |
| `/learn/auth` | Compare authentication and authorization |
| `/learn/middleware` | See how middleware processes a request |
| `/learn/deployment` | Follow code from a laptop to production |
| `/simulations/login` | Explore a complete login flow |
| `/playground` | Build and test visual software systems |

Add `?present=true` to a lesson or the login simulation for classroom presentation mode.

## Useful commands

```bash
npm run dev        # Start the development server
npm run lint       # Check code style and common issues
npm run typecheck  # Check TypeScript types
npm test           # Run the automated tests
npm run build      # Create the production build
```

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Driver.js
- Vitest and Testing Library

## Project structure

```text
src/app/          Pages and routes
src/content/      Lesson content and curriculum data
src/components/   Shared interface, lesson, and simulation components
src/simulations/  Simulation engine and scenario definitions
src/hooks/        Playback, progress, tour, and presentation hooks
src/stores/       Client-side state
src/lib/          Shared utilities
Docs/             Product, technical, and testing documents
```

The main application flow is:

```text
Lesson content → Simulation engine → Visual components
```

## Data and privacy

This version is frontend-only. It uses simulated data, does not require an account, does not store real credentials, and saves learning progress only in the learner's browser.

## Deployment

`npm run build` creates a static export in `out/`. The app does not need environment variables, a database, or a backend service for its core experience, so it can be deployed to Vercel or any static hosting provider.

## Project documents

Detailed product and engineering notes are available in [`Docs`](./Docs). Current implementation progress is tracked in the [V1 implementation checklist](<./Docs/V1 Implementation Checklist.md>).
