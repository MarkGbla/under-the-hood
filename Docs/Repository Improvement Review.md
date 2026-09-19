# Repository improvement review

Date: 2026-09-19

## Architecture and scope

Under the Hood is a static Next.js 16 / React 19 learning platform. Six lessons compose typed curriculum data with interactive labs, a deterministic simulation engine, Zustand stores, and shared visual components. Login/sign-up and the system builder provide larger practice environments. Progress is versioned and stored locally; simulated credentials and lab requests do not require a backend.

This review used four roles: integration and browser verification, engineering, UI/UX, and research/QA. Existing uncommitted playground, canvas, and keyboard work was preserved. No deployment or commit was performed.

## Improvements

- **Discovery:** the lesson overview explains the interaction, displays saved progress, recommends a first/next/continued lesson, and links to login and the playground. Mobile navigation exposes every destination. “Explored” accurately describes the current interaction-based progress model; it does not imply mastery. Only lesson summaries cross the overview's client boundary.
- **Persistence:** nested progress data is validated, invalid stages and values are normalized, valid legacy data survives corrupt current records or failed migration writes, and completion records stay consistent.
- **Playback:** late timer ticks cannot advance a paused/restarted simulation. Keyboard interaction updates progress and yields to dialogs, walkthroughs, and handled widget keys.
- **Onboarding:** a native modal contains focus and supports Escape. Walkthrough imports cannot start after unmount; active tours are destroyed on unmount, duplicate starts are ignored, and focus returns on dismissal.
- **Lab correctness:** HTTP parses JSON and validates names. HTTP, CRUD, authentication, and middleware capture the submitted request and response so the animation and inspector match the operation. Restart replays the submitted scenario; working retries repair inputs instead of clearing a failure against stale payloads. Completed HTTP creation correctly displays 201.
- **Deployment:** release status follows playback completion, resets correctly, and distinguishes blocked releases. Environment tabs support arrow keys, Home/End, and tab-panel relationships.

## Verification

| Check | Result |
| --- | --- |
| Automated tests | 127 passed across 20 files, up from 94 across 16 files |
| ESLint | Passed |
| TypeScript | Passed |
| Diff whitespace checks | Passed |
| Production static export | `npm run build -- --webpack` passed; all application routes prerendered |
| Desktop browser | All 11 entry routes rendered at 1440 px without horizontal page overflow or captured console errors |
| Phone browser | Explore, Components, Playground, all six lessons, and login rendered at 390 px without horizontal page overflow or captured console errors |

Live interaction checks covered mobile menu dismissal, onboarding focus/Escape, login 401 → corrected 200, guide replay, keyboard lesson progress, HTTP malformed JSON → 400 → restart retaining failure → corrected 201, deployment in-progress/completed/restarted status, deployment tab keys without advancing playback, student authorization 403 → admin retry 200, and the connected playground example reaching “Session created.”

The default Turbopack production build could not finish in this execution environment: its CSS worker was denied a local port. The supported Webpack build completed successfully, including TypeScript and static page generation. The normal build script remains unchanged.

## Research and remaining validation

Technical behavior was checked against [HTTP semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-400-bad-request), the [WAI tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), and [WAI modal dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Installed Next.js documentation was consulted for the project's exact version.

These checks establish behavior in the local browser and automated suite, not cross-browser or assistive-technology certification. The existing real learner/instructor study remains outstanding; this engineering review does not clear that research gate or establish educational effectiveness.
