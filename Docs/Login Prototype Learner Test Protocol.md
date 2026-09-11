# Login Prototype Learner Test Protocol

**Status:** Ready for recruitment and moderated testing  
**Prototype:** `/simulations/login`  
**Decision unlocked by this study:** Continue, Rework, or Stop/Rethink before Tasks 8–17

This protocol turns Task 7 of the V1 implementation checklist into a repeatable, consent-appropriate study. It records anonymous evidence only. Do not collect names, email addresses, account credentials, or recordings without separate informed consent.

## 1. Sample and recruitment target

Recruit 10–20 learners. Seek a useful mix rather than demographic precision:

- Beginners with little or no software-engineering experience
- University or training-program students
- Christex learners where available
- Learners who have already built a small application
- At least two instructors for the classroom-use review where possible

Assign each participant a neutral ID such as `L01` or `I01`. Record only the broad experience category needed to interpret the result.

## 2. Moderator setup checklist

- [ ] Open a fresh browser session at `/simulations/login`.
- [ ] Confirm the Guide Me / Explore Myself choice appears.
- [ ] Confirm simulated credentials are visible and no real account is required.
- [ ] Confirm play, pause, previous, next, restart, speed, inspect, wrong-password, and retry controls work.
- [ ] Set the device type in the session record.
- [ ] Explain that the product—not the participant—is being tested.
- [ ] Ask permission to take anonymous written notes.
- [ ] Do not teach the login flow or demonstrate the controls before the test.

## 3. Standard learner script

Read the prompts consistently.

### Before the prototype

> What happens technically when you log into a website?

Record the answer as closely as practical. Do not correct or prompt the learner.

### Exploration task

> Use this simulation. Explore it however you want. Try to work out what the system is doing.

Allow the learner to proceed without operating instructions. If they are completely blocked, record the point of confusion before giving the smallest possible neutral prompt.

### Required task coverage

If free exploration does not naturally cover these actions, ask the learner to attempt them after the unprompted period:

- Complete one successful login.
- Inspect at least one request or response.
- Pause and move backward or forward.
- Intentionally use the wrong password.
- Explain why the request stopped at 401.
- Correct the password and retry without reloading.
- Restart the simulation.

### After the prototype

Ask the identical opening question:

> What happens technically when you log into a website?

Then ask:

1. What part of the simulation made something clearer?
2. What confused you?
3. Where did you want to click but could not?
4. Did anything feel childish?
5. Was anything too technical?
6. What would you explore next in this style?
7. Would you use this without an instructor? Why or why not?
8. Would you come back to learn another software-engineering topic?
9. How confident are you that you could explain the login flow to someone else: Not yet, I think so, or Yes?

## 4. Observation checklist

Mark only behavior that was directly observed.

- [ ] Chose Guide Me without prompting.
- [ ] Chose Explore Myself without prompting.
- [ ] Started the simulation without help.
- [ ] Followed the request packet or active system state.
- [ ] Opened an inspector voluntarily.
- [ ] Used pause voluntarily.
- [ ] Used previous or next for understanding rather than only completion.
- [ ] Changed playback speed.
- [ ] Triggered the wrong-password failure.
- [ ] Connected 401 Unauthorized to failed authentication.
- [ ] Corrected the password and retried.
- [ ] Reached the simulated dashboard.
- [ ] Restarted or replayed a stage.
- [ ] Interacted beyond simply pressing Next.
- [ ] Needed moderator help; describe the exact point below.

## 5. Explanation rubric

Score the pre- and post-test answers separately. Award one point for each accurate idea stated without prompting; do not require the exact product wording.

| Concept | 0 | 1 |
|---|---:|---:|
| The browser/client creates and sends a request | Missing or materially incorrect | Present and broadly accurate |
| The request has an endpoint/method and carries submitted input | Missing or materially incorrect | Present and broadly accurate |
| Server-side routing, middleware, or application logic handles the request | Missing or materially incorrect | Present and broadly accurate |
| The server looks up the user and verifies the password | Missing or materially incorrect | Present and broadly accurate |
| Success creates a session/token rather than sending the stored password back | Missing or materially incorrect | Present and broadly accurate |
| The server returns an HTTP response/status and the browser changes UI | Missing or materially incorrect | Present and broadly accurate |
| Failure can stop at a specific checkpoint, such as 401 at password verification | Missing or materially incorrect | Present and broadly accurate |

**Score:** 0–7.  
**Clear improvement:** the post score increases by at least two points and introduces no new material misconception. This study rule makes comparison consistent; it does not guarantee the PRD’s discovery target.

## 6. Anonymous learner session record

Copy this block once per participant.

```text
Participant ID:
Experience category:
Device: phone / tablet / laptop / projected classroom
Mode chosen: Guide Me / Explore Myself

Pre-test answer:
Pre-test rubric score (0–7):

Unprompted behavior and click sequence:
Points of hesitation or confusion:
Moderator help required:
Voluntary interaction beyond Next: yes / no
Successful login completed: yes / no
Wrong-password failure and retry completed: yes / no

Post-test answer:
Post-test rubric score (0–7):
Clear improvement by study rule: yes / no
Confidence: Not yet / I think so / Yes
Would learn another topic: yes / no / unsure

What created understanding:
What was confusing:
What felt childish or too technical:
What they wanted to explore next:
Other notes:
```

## 7. Instructor script and record

After the instructor uses or projects the prototype, ask:

1. Would you use this during a real class?
2. Which simulation could replace one of your existing diagrams?
3. Was it easy to pause and explain?
4. Did learners ask better questions?
5. Could this save teaching time?
6. Which controls or presentation changes were missing?

```text
Instructor ID:
Teaching context:
Device/projector context:
Would use in a real class: yes / no / unsure
Projectable and readable: yes / no; evidence:
Easy to control while teaching: yes / no; evidence:
Observed effect on learner questions:
Missing controls or presentation needs:
Other notes:
```

## 8. Research summary template

| Evidence measure | Result | PRD discovery target |
|---|---:|---:|
| Learners tested | 0 | 10–20 learners |
| Clear explanation improvement | 0% | 70%+ |
| Simulation completion | 0% | 70%+ |
| Voluntary interaction beyond Next | 0% | 60%+ |
| Would learn another topic | 0% | 70%+ |
| Instructors who would use it in class | 0% | 70%+ |

The targets are evidence targets, not promised outcomes or automatic release criteria. Summarize recurring behaviors and explanations alongside the percentages.

### Pattern summary

- Teaching-model strengths:
- Teaching-model weaknesses:
- Terminology problems:
- Control and timing problems:
- Responsive/projector problems:
- Highest-priority changes:
- Rework completed and retested:

## 9. Decision record

Choose exactly one after reviewing the complete evidence.

- [ ] **Continue:** Most learners improve their explanations, voluntary interaction is meaningful, instructors see classroom value, and learners want another topic.
- [ ] **Rework:** Learners mainly watch, still cannot explain the concepts, or need repeated moderator/instructor help. Keep Tasks 8–17 blocked until the changed prototype is tested again.
- [ ] **Stop/Rethink:** Interaction adds little over a strong static diagram, or makes learning slower or more confusing. Do not expand the curriculum without an approved product revision.

```text
Decision:
Decision date:
Evidence owner:
Evidence supporting the decision:
Required follow-up actions:
Approval to begin Task 8: yes / no
```
