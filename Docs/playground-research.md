# Visual Systems Playground: Research and Product Rationale

## Executive conclusion

A visual system-building playground is worthwhile for beginner software students, but only if it teaches causal reasoning rather than rewarding the placement of attractive boxes. The useful product is not a generic diagram editor. It is a constrained simulation environment where students assemble a system, predict an outcome, run a request, see state change over time, locate the stopping point, and repair the cause.

The evidence supports five decisions:

1. Students should construct and manipulate a runnable model, not merely watch an animation. The ICAP framework predicts deeper learning as activity moves from passive viewing to active manipulation, constructive explanation, and meaningful interaction.[^1]
2. The system must expose execution over time. Python Tutor was designed around stepping through execution while keeping runtime state visible, addressing the gap between static source and dynamic behavior.[^2]
3. Failure feedback must identify the location, cause, and next diagnostic action. A randomized study involving more than 700 novice programmers found that readable, concise error messages with resolution hints reduced debugging time and improved perceived usefulness.[^3]
4. Beginners need a low floor and gradually fading support. Cognitive-load research finds that novices often benefit from worked examples and that guidance should be reduced as expertise grows.[^4]
5. The simulator must disclose its simplifications and connect visual models to real software vocabulary. Cisco explicitly describes Packet Tracer as a medium-fidelity model and states that real networks remain the benchmark.[^5]

The implemented first version is therefore a guided system editor with three missions, seven component types, direct connectors with keyboard equivalents, deterministic tests, stepwise execution, plain-language failure explanations, repair suggestions, and an optional prediction. It preserves the existing component catalogue as a reference page and uses the `/playground` route for construction and testing.

## Why this matters

### It makes an invisible process inspectable

Beginners see a button click and then a result. The route match, authentication check, application logic, database query, response creation, and UI update are normally hidden. This encourages fragile mental models, such as believing that a browser talks directly to a database or that a `401` and a `404` are interchangeable.

Program visualization exists to bridge this gap between a static representation and a dynamic process. Python Tutor’s original design pairs step controls with visible runtime state and supports moving both forward and backward through execution.[^2] A systems playground can apply the same principle at a higher level of abstraction: the learner sees not only which component exists, but which component is acting, what entered it, what decision it made, and what left it.

### It turns debugging into a teachable practice

Failure is often presented to beginners as a red endpoint rather than a chain of evidence. That misses the central skill: forming a hypothesis, observing state, locating the divergence, and testing a repair.

Research on novice error messages shows that wording matters. Messages are more useful when they are readable, short, positive in tone, and include a resolution hint.[^3] Earlier controlled work also found that explicit debugging instruction and explanations of common errors improved novices’ success at fixing errors, particularly semantic errors.[^6] The interface should therefore avoid messages such as “Invalid topology” without further help. A useful explanation is: “The request reached the router, but no route matched `POST /api/signup`. Add a Router before the Server or restore its route. Result: 404 Not Found.”

### It supports learning through construction

Constructionism emphasizes learning through making public, inspectable artifacts.[^7] Scratch extends that idea through a creative learning spiral—imagine, create, play, share, reflect, and imagine again—and argues for projects, passion, peers, and play as design principles.[^8]

For this product, “making” does not require unlimited freedom on day one. A student can own a system by choosing components, ordering them, configuring their behavior, testing alternatives, and repairing failures. Blockly’s experience is instructive: learners disliked heavily locked fill-in-the-blank solutions, while building one exercise from a learner’s own previous solution created a stronger sense of ownership.[^9]

### It can reduce irrelevant difficulty

Block and structured environments reduce the need to recall exact syntax and can make legal actions easier to recognize. A meta-analysis reports a positive overall effect of block-based visual programming on student learning, with outcomes varying by educational stage, tool, treatment, and location.[^10] Google’s Blockly guidance also recommends gradual learning, multiple representations, and multimodal cues for accessibility.[^11]

The implication is not to copy a block language. It is to apply the same “recognition before recall” principle to system architecture. Students should choose “Router — finds the correct endpoint” rather than memorize a component name before they understand its job. Technical vocabulary remains visible so the tool becomes a bridge to real software concepts rather than a separate toy language.

## What the evidence does not justify

### A visual interface is not automatically educational

ICAP distinguishes manipulating something from generating an explanation.[^1] Dragging boxes can remain only an active behavior; it becomes constructive when the learner predicts an outcome, explains a failure, or creates a working system from constraints. Python Tutor’s authors similarly warned that usage and anecdotes were not substitutes for rigorous efficacy evidence, and proposed embedded questions and prompts to encourage active engagement rather than passive viewing.[^2]

The playground should therefore ask for a prediction and, after a run, present a concise causal explanation. A future assessment can ask the student to explain the flow without the animation.

### Unlimited canvases can overload novices

Open exploration is valuable, but novices have limited domain schemas. Cognitive-load research finds that worked examples can outperform unsupported problem solving for beginners, while excessive guidance becomes redundant for more experienced learners.[^4] The product needs progressive freedom:

- Begin with a working example that can be tested immediately.
- Let students remove, reorder, or break one part.
- Offer mission requirements and contextual hints.
- Provide a blank canvas as an explicit option, not the only starting point.
- Later fade hints and allow more components or branching.

### Simulation fidelity has limits

Packet Tracer calls itself a medium-fidelity simulation and notes that real networks remain the benchmark.[^5] This playground will simplify concurrency, retries, caching, distributed state, database consistency, and security. It must clearly label the model as a learning model. When it reports `401`, `404`, `409`, `500`, or `503`, the explanation should connect the simplified event to the real HTTP concept without implying that all production systems behave identically.

## Lessons from comparable tools

| Tool or research | Useful pattern | Product implication |
| --- | --- | --- |
| Scratch | Create and remix personally meaningful projects; use a low floor, wide walls, and high ceiling.[^8] | Start with examples but preserve ownership through editable systems and multiple missions. |
| Blockly | Recognition over recall; contextual prompts outperform detached instructions; provide a path toward authentic text vocabulary.[^9] | Use click-to-add components, in-context hints, and visible HTTP/system terms. Avoid long onboarding modals. |
| Python Tutor | Step through dynamic execution while state stays visible.[^2] | Animate one request through the student’s exact system and provide step/replay controls. |
| Cisco Packet Tracer | Combine construction, visualization, simulation, troubleshooting, and assessment while acknowledging model limits.[^5] | Treat testing and diagnosis as first-class modes; describe the simulator as simplified. |
| CircuitVerse | Keep a component library, properties panel, canvas, and timing/debug view together; allow live troubleshooting.[^12] | Use a three-part workspace: component shelf, system canvas, and selected-component/test inspector. |

## Draw.io as an interaction reference

Draw.io is useful here because its editor layout makes a large set of diagramming operations discoverable without displacing the canvas. Its classic editor keeps shape libraries on the left, the drawing surface in the centre, a context-sensitive format panel on the right, and a compact toolbar above.[^13] That spatial model maps well to the Playground: software components belong in the left library, the student-owned system belongs in the centre, and explanations or configuration belong beside the selected object.

Several draw.io patterns transfer directly:

- **A searchable shape library with reusable templates.** Draw.io organises shapes into libraries and provides searchable, previewable templates as starting points.[^13][^14] The Playground uses a small domain-specific library and working, broken, and blank templates so learners can choose their level of support.
- **Direct manipulation plus efficient alternatives.** Draw.io supports dragging shapes, clicking to add, quick-connect arrows, and keyboard shortcuts.[^15] The Playground likewise supports dragging, click-to-add, visible connection ports, a Connect tool, and button-based movement so motor precision is never the only way to complete the task.
- **Context-sensitive properties.** Draw.io changes the right panel based on whether the diagram, a shape, connector, or text is selected.[^13] The Playground changes its inspector between component responsibility, connector meaning, test evidence, and tutor challenge controls.
- **Connectors carry meaning.** Draw.io treats connectors as relationships rather than decoration and supports direct creation between shapes.[^15] In the Playground, connector direction is executable: it determines the request path and can produce a disconnected component, loop, ambiguous branch, or successful flow.
- **Canvas navigation and cleanup.** Draw.io provides grid controls, an infinite/page canvas choice, zoom, overview, and arrangement tools.[^13] The Playground keeps a bounded learning canvas with a functional grid, zoom controls, and automatic arrangement. A bounded canvas avoids adding navigation complexity before students understand the system model.
- **Shared authoring patterns.** Draw.io supports shared cursors, selections, and real-time changes on supported storage platforms.[^16] That is a useful future direction for live classroom facilitation. The current local version instead provides Student and Tutor modes on one device: a tutor can write a challenge, control guidance, inspect the expected path, and present the configured canvas.

The features that should not be copied are equally important. A general-purpose style editor, arbitrary shape libraries, layers, rich text, freehand drawing, multi-page diagrams, and import/export formats would increase interface load without improving the first learning objective. Draw.io uses those capabilities to support many diagram types; the Playground should remain domain-specific and executable. Visual freedom is valuable only when every permitted object and connector still has a teachable system meaning.

## Recommended learning loop

### 1. Choose a mission

Each mission gives the system a purpose and defines what “works” means:

- **Load a profile** — teach request routing, server logic, database lookup, `200`, `404`, and `503`.
- **Open a protected dashboard** — add middleware/authentication and distinguish `401` from other failures.
- **Create an account** — teach request validation and a database conflict through `409`.

The mission description should be one sentence and remain visible. The builder should never force the learner to remember the task after closing a modal.

### 2. Build the system

Students add components from a small library. The first version should use click-to-add rather than drag-and-drop as the only input method. Click-to-add is easier to make keyboard accessible, more reliable on touch screens, and reduces spatial motor demands. Components can be reordered with explicit Previous/Next controls and removed with a labeled button.

Connections should be explicit because choosing what receives the request is part of the system model. Direct manipulation may be used for speed, but click-based connection tools and keyboard movement must provide equivalent access. The version-one runner intentionally accepts one unambiguous path: it explains disconnected nodes, loops, merges, and branches instead of pretending to execute an unclear graph. Branch execution can be introduced after the single-path mental model is proven.

### 3. Configure one meaningful property

Each selected component exposes a single “working/broken” condition expressed in domain language:

- Browser: request body is valid or malformed.
- Router: matching route exists or is missing.
- Middleware: identity/token is present or rejected.
- Server: handler is ready or throws an error.
- Database: mission-specific data condition succeeds or fails.

One property per component creates controlled counterfactuals. The student can isolate a cause instead of changing five variables at once.

### 4. Predict

Before or beside the Test button, the student can record whether the system will succeed or where it will stop. The prediction should take one click and never become a quiz gate. Its value is metacognitive: after the run, the result can say “You predicted Router; the request actually stopped at Database.”

### 5. Test and watch

The request moves through the exact sequence the learner built. Only one component is active at a time. Completed components remain visibly completed; future components remain quiet. The event log and graphical state must use the same words so animation is never the only source of meaning.

### 6. Diagnose

The result panel should answer four questions:

1. What happened?
2. Where did it stop?
3. Why did it stop?
4. What change should be tried next?

The status code supports the explanation rather than replacing it.

### 7. Repair and rerun

The failed component stays selected. The suggested repair points to the relevant property or missing component. The student makes the change and runs the same test again. Success should show the complete round trip and invite a new variation rather than ending the activity.

## Product and interface specification

### First viewport

This is a working surface, not a marketing page. The first viewport should contain:

- A component shelf on the left.
- The system canvas in the center.
- A contextual inspector/result panel on the right.
- A compact toolbar with persistent Test, Pause, Step, panel, and zoom controls.
- A collapsible execution timeline below the canvas.

Use the existing cream paper, deep green ink, coral attention color, lime run control, blue request, teal success, and amber paused state. The graph-paper canvas already established elsewhere in the product is appropriate because it communicates construction without decorative imagery.

### Full-screen workspace decision

The Playground should occupy every pixel below the persistent product navigation. It should not be centered inside a maximum-width page, surrounded by gutters, or styled as a rounded card. The browser document remains fixed while the component shelf, canvas, inspector, and timeline manage their own overflow. This follows draw.io’s editor anatomy: shape libraries on the left, a dominant canvas in the center, a context-sensitive panel on the right, and a compact toolbar above.[^13]

The useful draw.io pattern is spatial consistency, not feature volume. The learning tool should copy the editor’s panel placement, direct manipulation, panel toggles, grid, zoom, and quick-connect affordances. It should not copy arbitrary styling, layers, freehand drawing, multi-page documents, or import/export complexity. Draw.io explicitly lets people hide panels or use a simpler editor theme to increase canvas space; the Playground should provide the same control through visible Components, Inspector, and Timeline toggles.[^17]

The desktop workspace uses three columns: a 224-pixel component shelf, a fluid canvas, and a 300-pixel inspector. Below tablet width, side panels become edge drawers so opening them never pushes the canvas below the fold. On phones, the canvas remains primary, controls use touch-sized targets, and only one side drawer should be needed at a time. WCAG 2.2 sets a 24-by-24 CSS-pixel minimum target size, while this interface uses larger targets for its primary editor actions.[^18]

The inspector remains context-sensitive. Selecting a component exposes its responsibility and working/broken condition; selecting a connector explains its direction; a failed test puts the causal explanation and repair beside the affected object. This reduces split attention by keeping a visual element and its explanation spatially close.[^19]

### Full-screen information hierarchy

1. **Product navigation:** identifies Under the Hood and keeps Explore, Components, and Playground reachable without a second marketing header.
2. **Editor toolbar:** exposes panels, Select, Connect, Arrange, Delete, Clear, run status, Pause, Step, and Test/Replay.
3. **Component shelf:** provides search, click-to-add, drag-to-add, and working/broken/blank starting points.
4. **Canvas:** owns the largest area and shows the learner’s actual executable graph on a continuous grid.
5. **Status lane:** states the current event or structural problem in plain language.
6. **Inspector:** explains and edits the selected component or connector and retains causal test evidence.
7. **Timeline:** stays collapsed while editing and opens for execution so students can inspect the path without permanently shrinking the canvas.

Panel controls use `aria-expanded` and named controlled regions. The global live region announces meaningful run-state changes. Motion remains optional, and color is paired with text and icons. Toolbar keyboard behavior should eventually follow the WAI-ARIA toolbar pattern instead of forcing learners through every button with repeated Tab presses.[^20]

### Interaction states

- **Ready:** live structural check and a clear Test action.
- **Running:** one animated request, current event text, Pause, and Step.
- **Paused:** motion stops but all state remains visible.
- **Success:** completed path, `200`/`201`, prediction comparison, and “Try a failure” suggestion.
- **Runtime failure:** path stops at the responsible component, later components are disabled, and a repair is proposed.
- **Design failure:** no animation pretends to run; the exact missing or misplaced component is identified.

### Accessibility

- Every canvas action has a button-based keyboard equivalent.
- State uses words and shapes as well as color.
- Status changes use a polite live region.
- Focus moves only when the learner requests an action; animation never steals focus.
- Reduced-motion mode replaces travel animation with discrete state changes.
- Mobile uses a vertical sequence and stacked panels; controls remain at least 44px tall.

Blockly’s current accessibility work emphasizes keyboard navigation, screen-reader support, multimodal representation, and gradual scaffolding.[^11] A system builder should not depend on freehand dragging or connector geometry for meaning.

## Technical recommendation

The existing application already has the right visual primitives: `SystemNode`, `NodeIcon`, `Connection`, `Packet`, `StatusCode`, and `HttpInspector`. The new builder should reuse them and add a small pure evaluation engine.

The engine should accept a mission and an ordered list of configured nodes, then return a deterministic result:

- structural issues;
- execution trace;
- failing node, if any;
- HTTP outcome;
- plain-language cause;
- suggested repair.

Keeping evaluation pure makes the rules testable without a browser. The client component owns only editing and playback state. The Next.js page remains a Server Component and renders the client workbench at a narrow boundary, which remains compatible with the project’s static export.

The current catalogue should move unchanged to `/components`. Navigation should expose **Explore**, **Components**, and **Playground**, making the distinction clear: Components explains the visual language; Playground lets a student build with it.

## Evaluation plan

The feature should be judged by learning behavior, not time on page.

### Product checks

- Percentage of learners who successfully repair a deliberately broken starter.
- Number of test–change–retest cycles per session.
- Whether learners can identify the failing component before opening the explanation.
- Accessibility completion rates using keyboard-only interaction.
- Drop-off between blank canvas, first component, first test, first diagnosis, and first repair.

### Learning checks

- Pre/post ordering task for browser, router, middleware, server, and database.
- Transfer question using a system the learner did not build.
- Explanation quality: location, cause, effect, and repair.
- Delayed check that removes visual hints.

The main experimental comparison should not be “visual tool versus no tool.” A better test compares passive animation with the complete predict–build–diagnose–repair loop. That isolates whether constructive and reflective actions add value beyond watching.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Learners optimize for green status without understanding | Require or invite a prediction; show causal explanations; add transfer questions later. |
| The model teaches one rigid architecture | Support multiple missions and optional components; explicitly call the sequence simplified. |
| Too much freedom overwhelms beginners | Default to a working starter, offer contextual hints, and make blank canvas optional. |
| The visual language becomes a dead end | Keep authentic terms, HTTP methods, paths, and status codes visible. |
| Error hints simply give away the answer | State the failed condition and next diagnostic action, not the final complete topology. |
| Dragging excludes keyboard or motor-impaired users | Make click-to-add and explicit reorder controls canonical; dragging can be progressive enhancement later. |
| Animation distracts from reasoning | Animate only state transitions, provide pause/step, and honor reduced motion. |

## Sources

[^1]: Michelene T. H. Chi and Ruth Wylie, “[The ICAP Framework: Linking Cognitive Engagement to Active Learning Outcomes](https://education.asu.edu/sites/default/files/lcl/chiwylie2014icap_2.pdf),” *Educational Psychologist*, 2014.
[^2]: Philip J. Guo, “[Online Python Tutor: Embeddable Web-Based Program Visualization for CS Education](https://pg.ucsd.edu/publications/Online-Python-Tutor-web-based-program-visualization_SIGCSE-2013.pdf),” SIGCSE, 2013.
[^3]: Brett A. Becker et al., “[Error Message Readability and Novice Debugging Performance](https://doi.org/10.1145/3341525.3387384),” ITiCSE, 2020.
[^4]: Fred Paas and Jeroen J. G. van Merriënboer, “[Cognitive-Load Theory: Methods to Manage Working Memory Load in the Learning of Complex Tasks](https://doi.org/10.1177/0963721420922183),” *Current Directions in Psychological Science*, 2020; Alexander Renkl, Robert K. Atkinson, and Cornelia S. Grosse, “[How Fading Worked Solution Steps Works](https://eric.ed.gov/?id=EJ732331),” *Instructional Science*, 2004.
[^5]: Cisco Networking Academy, “[Introduction to Cisco Packet Tracer](https://tutorials.ptnetacad.net/help/default/intro.htm).”
[^6]: Carl Martin Allwood and Carl-Gustav Björhag, “[Training of Pascal Novices’ Error Handling Ability](https://doi.org/10.1016/0001-6918(91)90008-N),” *Acta Psychologica*, 1991.
[^7]: Seymour Papert and Idit Harel, “[Situating Constructionism](https://web.eecs.umich.edu/~mjguz/csl/home.cc.gatech.edu/allison/uploads/4/papert91.html),” 1991.
[^8]: MIT Media Lab, “[Creative Learning](https://www.media.mit.edu/projects/creative-learning/overview/)”; Scratch Foundation, “[Scratch’s Creative Learning Philosophy](https://www.scratchfoundation.org/learn/learning-library/scratch-creative-learning-philosophy).”
[^9]: Neil Fraser, “[Ten Things We’ve Learned from Blockly](https://developers.google.com/static/blockly/publications/papers/TenThingsWeveLearnedFromBlockly.pdf),” IEEE Blocks and Beyond Workshop, 2015.
[^10]: Yue Hu, Cheng-Huan Chen, and Chien-Yuan Su, “[Exploring the Effectiveness and Moderators of Block-Based Visual Programming on Student Learning: A Meta-Analysis](https://doi.org/10.1177/0735633120945935),” *Journal of Educational Computing Research*, 2021.
[^11]: Google for Developers, “[Blockly Accessibility Overview](https://developers.google.com/blockly/accessibility).”
[^12]: CircuitVerse, “[Key Features](https://docs.circuitverse.org/chapter1/chapter1-keyfeatures/)” and “[Understanding the Simulator Interface](https://docs.circuitverse.org/chapter3/chapter3-understandingcvsimulator/).”
[^13]: draw.io, “[Using the draw.io editor](https://www.drawio.com/docs/manual/editor/)” and “[Panels and dialogs in draw.io](https://www.drawio.com/docs/manual/editor/panels/).”
[^14]: draw.io, “[Template diagrams with previews, subcategories and search](https://www.drawio.com/docs/manual/templates/template-diagrams/).”
[^15]: draw.io, “[Work with connectors in draw.io](https://www.drawio.com/docs/manual/connectors/)” and “[Connect shapes quickly](https://www.drawio.com/docs/manual/connectors/connect-shapes/).”
[^16]: draw.io, “[Collaborate in real time using draw.io](https://www.drawio.com/docs/manual/collaboration/concurrent-editing/).”
[^17]: draw.io, “[Increase the drawing canvas space](https://www.drawio.com/docs/manual/editor/increase-drawing-canvas/)” and “[Toolbars in draw.io editor themes](https://www.drawio.com/docs/manual/editor/toolbars/).”
[^18]: W3C Web Accessibility Initiative, “[Understanding Success Criterion 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).”
[^19]: Paul Chandler and John Sweller, “[The Split-Attention Effect as a Factor in the Design of Instruction](https://doi.org/10.1111/j.2044-8279.1992.tb01017.x),” *British Journal of Educational Psychology*, 1992.
[^20]: W3C Web Accessibility Initiative, “[Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)” and “[Understanding Success Criterion 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).”
