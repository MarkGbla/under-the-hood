"use client";

import { type FormEvent, useEffect, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { useStore } from "zustand";
import { Flow, FlowArrow, FlowStage } from "./flow";
import { GuidedTour } from "./guided-tour";
import { HttpInspector } from "./http-inspector";
import { Packet } from "./packet";
import { StatusCode, statusReason } from "./status-code";
import { SystemNode } from "./system-node";
import { useSimulationPlayback } from "@/hooks/use-simulation-playback";
import { usePresentationMode, useSimulationShortcuts } from "@/hooks/use-presentation-mode";
import {
  loginSimulationDefinition,
  signupSimulationDefinition,
  simulatedLoginCredentials,
  simulatedSignupCredentials,
} from "@/simulations/login/login-definition";
import { loginSimulationStore, signupSimulationStore } from "@/simulations/login/login-store";
import type { FailureType, SimulationSpeed } from "@/simulations/engine/types";
import type { SystemNodeState } from "@/types/simulation";

type AuthMode = "login" | "signup";

const loginStages = [
  { id: "browser", label: "Browser", detail: "Creates request", kind: "browser", start: 0, end: 1 },
  { id: "middleware", label: "Middleware", detail: "Logs + validates", kind: "middleware", start: 2, end: 3, tour: "middleware" },
  { id: "router", label: "Router", detail: "Matches endpoint", kind: "router", start: 4, end: 4 },
  { id: "service", label: "Auth service", detail: "Starts verification", kind: "service", start: 5, end: 5 },
  { id: "database", label: "Identity check", detail: "Finds + verifies user", kind: "database", start: 6, end: 7, tour: "database" },
  { id: "token", label: "Token", detail: "Simulated session", kind: "token", start: 8, end: 8 },
  { id: "dashboard", label: "Dashboard", detail: "Shows result", kind: "browser", start: 9, end: 10 },
] as const;

const signupStages = [
  { id: "browser", label: "Browser", detail: "Creates request", kind: "browser", start: 0, end: 1 },
  { id: "middleware", label: "Middleware", detail: "Logs + validates", kind: "middleware", start: 2, end: 3, tour: "middleware" },
  { id: "router", label: "Router", detail: "Matches endpoint", kind: "router", start: 4, end: 4 },
  { id: "service", label: "Account service", detail: "Prepares account", kind: "service", start: 5, end: 5 },
  { id: "database", label: "Account storage", detail: "Checks, hashes + saves", kind: "database", start: 6, end: 8, tour: "database" },
  { id: "token", label: "Token", detail: "Starts session", kind: "token", start: 9, end: 9 },
  { id: "welcome", label: "Welcome", detail: "Shows result", kind: "browser", start: 10, end: 11 },
] as const;

type Scenario = { id: FailureType | null; label: string; detail: string; status: number };

const loginScenarios: Scenario[] = [
  { id: null, label: "Successful login", detail: "Every check passes and a session is created.", status: 200 },
  { id: "invalid-request", label: "Missing email", detail: "Validation rejects the request before any lookup.", status: 400 },
  { id: "missing-route", label: "Wrong endpoint", detail: "No route handles this method and path.", status: 404 },
  { id: "wrong-password", label: "Wrong password", detail: "The user exists, but the password does not match.", status: 401 },
  { id: "database-unavailable", label: "Database unavailable", detail: "The server cannot reach stored user data.", status: 500 },
  { id: "invalid-token", label: "Invalid token", detail: "A protected follow-up request carries an untrusted token.", status: 401 },
  { id: "wrong-role", label: "Insufficient role", detail: "Identity is valid, but the role cannot perform this action.", status: 403 },
];

const signupScenarios: Scenario[] = [
  { id: null, label: "Successful sign up", detail: "A secure user record and session are created.", status: 201 },
  { id: "invalid-request", label: "Invalid form", detail: "Validation rejects incomplete or mismatched fields.", status: 400 },
  { id: "missing-route", label: "Wrong endpoint", detail: "No route handles this method and path.", status: 404 },
  { id: "email-taken", label: "Email already used", detail: "The uniqueness check prevents a duplicate account.", status: 409 },
  { id: "database-unavailable", label: "Database unavailable", detail: "The account cannot be checked or saved.", status: 500 },
];

const statusLabels = {
  idle: "Ready",
  playing: "Playing",
  paused: "Paused",
  completed: "Complete",
  failed: "Failed safely",
} as const;

export function LoginSimulation({ onInteraction }: { onInteraction?: () => void } = {}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState<string>(simulatedSignupCredentials.name);
  const [email, setEmail] = useState<string>(simulatedLoginCredentials.email);
  const [password, setPassword] = useState<string>(simulatedLoginCredentials.password);
  const [confirmPassword, setConfirmPassword] = useState<string>(simulatedSignupCredentials.password);

  const isSignup = mode === "signup";
  const store = isSignup ? signupSimulationStore : loginSimulationStore;
  const definition = isSignup ? signupSimulationDefinition : loginSimulationDefinition;
  const stages = isSignup ? signupStages : loginStages;
  const scenarios = isSignup ? signupScenarios : loginScenarios;
  const successCode = isSignup ? 201 : 200;
  const apiPath = isSignup ? "/api/signup" : "/api/login";

  const currentStepIndex = useStore(store, (state) => state.currentStepIndex);
  const status = useStore(store, (state) => state.status);
  const speed = useStore(store, (state) => state.speed);
  const failureResult = useStore(store, (state) => state.failureResult);
  const inspectedStepId = useStore(store, (state) => state.inspectedStepId);
  const currentStep = definition.steps[currentStepIndex];
  const isTerminal = status === "completed" || status === "failed";
  const canEdit = status === "idle" || isTerminal;

  useSimulationPlayback(store);

  const { isPresenting, setPresenting } = usePresentationMode();
  useSimulationShortcuts({
    presenting: isPresenting,
    store,
    onExit: () => setPresenting(false),
    onFailure: () => runScenario(isSignup ? "email-taken" : "wrong-password"),
    onInteraction,
  });

  useEffect(() => () => {
    loginSimulationStore.getState().restart();
    signupSimulationStore.getState().restart();
  }, []);

  function changeMode(nextMode: AuthMode) {
    if (nextMode === mode || !canEdit) return;
    loginSimulationStore.getState().restart();
    signupSimulationStore.getState().restart();
    setMode(nextMode);

    if (nextMode === "signup") {
      setName(simulatedSignupCredentials.name);
      setEmail(simulatedSignupCredentials.email);
      setPassword(simulatedSignupCredentials.password);
      setConfirmPassword(simulatedSignupCredentials.password);
    } else {
      setEmail(simulatedLoginCredentials.email);
      setPassword(simulatedLoginCredentials.password);
    }
    onInteraction?.();
  }

  function startAttempt(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (isSignup) {
      const fieldsAreInvalid = !name.trim()
        || !email.trim()
        || password.length < 8
        || password !== confirmPassword;
      const failure = fieldsAreInvalid
        ? "invalid-request"
        : email.trim().toLowerCase() === simulatedLoginCredentials.email
          ? "email-taken"
          : null;
      runScenario(failure);
      return;
    }

    const emailMatches = email.trim().toLowerCase() === simulatedLoginCredentials.email;
    const passwordMatches = password === simulatedLoginCredentials.password;
    const failure = !email.trim()
      ? "invalid-request"
      : !emailMatches || !passwordMatches
        ? "wrong-password"
        : null;
    runScenario(failure);
  }

  function runScenario(failure: FailureType | null) {
    store.getState().restart();
    store.getState().triggerFailure(failure);
    store.getState().play();
    onInteraction?.();
  }

  function retrySuccessfully() {
    if (isSignup) {
      setName(simulatedSignupCredentials.name);
      setEmail(simulatedSignupCredentials.email);
      setPassword(simulatedSignupCredentials.password);
      setConfirmPassword(simulatedSignupCredentials.password);
    } else {
      setEmail(simulatedLoginCredentials.email);
      setPassword(simulatedLoginCredentials.password);
    }
    runScenario(null);
  }

  function stageState(start: number, end: number): SystemNodeState {
    if (currentStepIndex > end || status === "completed") return "success";
    if (currentStepIndex < start) return "default";
    if (status === "failed") return "rejected";
    if (inspectedStepId === currentStep.id) return "inspected";
    if (status === "playing") return "active";
    if (status === "paused") return "paused";
    return "default";
  }

  function arrowState(index: number) {
    const currentStage = stages[index];
    const nextStage = stages[index + 1];

    if (status === "completed" || currentStepIndex > nextStage.end) return "complete" as const;
    if (status === "failed") {
      if (currentStepIndex >= nextStage.start) return "error" as const;
      if (currentStepIndex > currentStage.end) return "complete" as const;
      return "default" as const;
    }
    if (currentStepIndex >= currentStage.end || currentStepIndex >= nextStage.start) {
      return status === "paused" ? "paused" as const : "active" as const;
    }
    return "default" as const;
  }

  const responseBeginsAt = isSignup ? 9 : 8;
  const packetKind = failureResult || currentStepIndex >= responseBeginsAt ? "response" : "request";
  const packetState = failureResult
    ? "error"
    : status === "paused"
      ? "paused"
      : status === "completed"
        ? "success"
        : status === "playing"
          ? "travelling"
          : "idle";
  const openPayload = currentStep.payload;

  return (
    <MotionConfig reducedMotion="user">
      <div className={isPresenting ? "page-surface lab-page presenting" : "page-surface lab-page"}>
        <GuidedTour />
        <div className="site-shell lab-page-shell">
          <header className="lab-page-header">
            <div>
              <div className="eyebrow"><span>●</span> Interactive authentication lab</div>
              <h1>What happens when you log in or sign up?</h1>
              <p>Switch between both flows, watch every system decision, then break a check to see exactly where and why it stops.</p>
            </div>
            <div className="lab-header-side">
              <div className={`build-status build-status-${status}`} aria-live="polite"><i />{statusLabels[status]}<span>Step {currentStepIndex + 1} of {definition.steps.length}</span></div>
              <button type="button" className="present-toggle" onClick={() => setPresenting(!isPresenting)}>
                {isPresenting ? "Exit presentation" : "Presentation mode"}
              </button>
              {isPresenting ? <span className="present-keys">Space play · ← → step · R restart · F failure · Esc exit</span> : null}
            </div>
          </header>

          <section className="login-workbench" aria-label="Interactive login and sign-up simulation">
            <div className="workbench-topbar">
              <div><i /><span>{isSignup ? "Sign-up" : "Login"} flow · {statusLabels[status]}</span></div>
              <div className="workbench-controls" data-tour="controls" aria-label="Simulation playback controls">
                <span className="key-legend" aria-hidden="true"><kbd>Space</kbd> play <kbd>←</kbd><kbd>→</kbd> step <kbd>R</kbd> restart</span>
                <button type="button" onClick={() => store.getState().restart()}>Restart</button>
                <button type="button" aria-label="Step backward" disabled={currentStepIndex === 0} onClick={() => store.getState().previous()}>◀</button>
                <button
                  type="button"
                  aria-label={status === "playing" ? "Pause simulation" : "Play simulation"}
                  disabled={isTerminal}
                  onClick={() => status === "playing" ? store.getState().pause() : store.getState().play()}
                >{status === "playing" ? "Pause" : "Play"}</button>
                <button type="button" aria-label="Step forward" disabled={isTerminal} onClick={() => store.getState().next()}>▶</button>
                <label className="speed-control">Speed
                  <select value={speed} onChange={(event) => store.getState().setSpeed(Number(event.target.value) as SimulationSpeed)}>
                    <option value={0.5}>0.5×</option>
                    <option value={1}>1×</option>
                    <option value={2}>2×</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="login-grid">
              <div className="login-demo-card" data-tour="browser">
                <div className="browser-chrome"><span /><span /><span /><small>app.local/{mode}</small></div>
                <form className="login-form-preview" onSubmit={startAttempt}>
                  <div className="auth-mode-switch" role="tablist" aria-label="Authentication flow">
                    <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? "auth-mode-active" : ""} disabled={!canEdit} onClick={() => changeMode("login")}>Log in</button>
                    <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? "auth-mode-active" : ""} disabled={!canEdit} onClick={() => changeMode("signup")}>Sign up</button>
                  </div>

                  {status === "completed" ? (
                    <div className="simulated-dashboard" role="status">
                      <span aria-hidden="true">✓</span>
                      <h2>{isSignup ? "Account created" : "Welcome, student"}</h2>
                      <p>{isSignup ? "The browser received the new profile and simulated session." : "The browser received a successful response and can now show the dashboard."}</p>
                      <button type="button" onClick={() => store.getState().restart()}>Run it again</button>
                    </div>
                  ) : (
                    <>
                      <div className="mini-logo">UTH</div>
                      <h2>{status === "failed" ? (isSignup ? "Sign up stopped" : "Login rejected") : (isSignup ? "Create your account" : "Welcome back")}</h2>
                      <p>These details are simulated and never leave this browser.</p>
                      {isSignup ? <label>Name<input aria-label="Name" value={name} disabled={!canEdit} onChange={(event) => setName(event.target.value)} /></label> : null}
                      <label>Email<input aria-label="Email" type="email" value={email} disabled={!canEdit} onChange={(event) => setEmail(event.target.value)} /></label>
                      <label>Password<input aria-label="Password" type="text" value={password} disabled={!canEdit} onChange={(event) => setPassword(event.target.value)} /></label>
                      {isSignup ? <label>Confirm password<input aria-label="Confirm password" type="text" value={confirmPassword} disabled={!canEdit} onChange={(event) => setConfirmPassword(event.target.value)} /></label> : null}
                      <button data-tour="login-action" type="submit" disabled={!canEdit}>{status === "failed" ? `Try edited ${isSignup ? "details" : "credentials"}` : (isSignup ? "Create account" : "Start login")}</button>
                      <small>{isSignup ? `Demo new account: ${simulatedSignupCredentials.email}` : `Demo success: ${simulatedLoginCredentials.email} / ${simulatedLoginCredentials.password}`}</small>
                      <div className="scenario-shortcuts" aria-label="Choose a simulation outcome">
                        {isSignup ? (
                          <>
                            <button type="button" disabled={!canEdit} onClick={() => setEmail(simulatedSignupCredentials.email)}>Use new email</button>
                            <button type="button" disabled={!canEdit} onClick={() => setEmail(simulatedLoginCredentials.email)}>Use existing email</button>
                          </>
                        ) : (
                          <>
                            <button type="button" disabled={!canEdit} onClick={() => setPassword(simulatedLoginCredentials.password)}>Use correct password</button>
                            <button type="button" disabled={!canEdit} onClick={() => setPassword("wrong-password")}>Use wrong password</button>
                          </>
                        )}
                      </div>
                      <fieldset className="break-panel">
                        <legend>Break it on purpose</legend>
                        {scenarios.map((scenario) => (
                          <button key={scenario.id ?? "success"} type="button" disabled={!canEdit} onClick={() => runScenario(scenario.id)}>
                            <strong>{scenario.label}</strong>
                            <small>{scenario.detail}</small>
                            <span className={scenario.id ? "scenario-tag scenario-tag-fail" : "scenario-tag"}>{scenario.status}</span>
                          </button>
                        ))}
                      </fieldset>
                    </>
                  )}
                </form>
              </div>

              <div className="login-system-preview">
                <div className="system-preview-heading"><span>Live system map · {isSignup ? "Sign up" : "Log in"}</span><small>Deterministic · no network or real account</small></div>
                <motion.div
                  className="live-packet"
                  data-tour="packet"
                  key={`${mode}-${currentStep.id}-${failureResult?.type ?? "normal"}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 / speed }}
                >
                  <Packet
                    kind={packetKind}
                    method="POST"
                    path={apiPath}
                    statusCode={failureResult?.statusCode ?? successCode}
                    state={packetState}
                    compact
                  />
                </motion.div>

                <Flow className="login-live-flow" label={`${isSignup ? "Sign-up" : "Login"} request and response route`}>
                  {stages.map((stage, index) => (
                    <div className="login-flow-segment" key={stage.id}>
                      <FlowStage number={index + 1} label={stage.label}>
                        <div data-tour={"tour" in stage ? stage.tour : undefined}>
                          <SystemNode kind={stage.kind} label={stage.label} detail={stage.detail} state={stageState(stage.start, stage.end)} compact />
                        </div>
                      </FlowStage>
                      {index < stages.length - 1 ? <FlowArrow label={index === stages.length - 2 ? "Response" : "Next event"} state={arrowState(index)} /> : null}
                    </div>
                  ))}
                </Flow>

                <div className="current-event" data-tour="event" aria-live="polite">
                  <span>{String(currentStepIndex + 1).padStart(2, "0")}</span>
                  <div><strong>{currentStep.title}</strong><p>{failureResult?.explanation ?? currentStep.description}</p></div>
                  {currentStep.inspectable ? (
                    <button data-tour="inspector" type="button" onClick={() => store.getState().inspectCurrent()}>
                      Inspect {currentStep.payload?.kind ?? "event"}
                    </button>
                  ) : <button data-tour="inspector" type="button" disabled>No payload here</button>}
                </div>
              </div>
            </div>

            <div className="simulation-detail-grid">
              <ol className="event-timeline" aria-label={`${isSignup ? "Sign-up" : "Login"} simulation stages`}>
                {definition.steps.map((step, index) => (
                  <li key={step.id} className={index === currentStepIndex ? "event-current" : index < currentStepIndex ? "event-complete" : ""}>
                    <span>{index < currentStepIndex || status === "completed" ? "✓" : index + 1}</span>
                    <div><strong>{step.title}</strong><small>{step.action.replaceAll("-", " ")}</small></div>
                  </li>
                ))}
              </ol>

              <div className="inspection-area">
                {failureResult ? (
                  <>
                    <StatusCode code={failureResult.statusCode as 400 | 401 | 403 | 404 | 409 | 500} />
                    <HttpInspector
                      kind="response"
                      headline={`${failureResult.statusCode} ${statusReason(failureResult.statusCode)}`}
                      headers={[{ name: "Content-Type", value: "application/json" }, { name: "Cache-Control", value: "no-store" }]}
                      body={`{\n  "${isSignup ? "created" : "authenticated"}": false,\n  "error": ${JSON.stringify(failureResult.title)}\n}`}
                    />
                    <div className="retry-panel"><strong>{failureResult.title}</strong><p>{failureResult.explanation} Failure is part of the lesson — the same input always produces the same outcome.</p><button type="button" onClick={retrySuccessfully}>
                      {failureResult.type === "wrong-password" ? "Use correct password and retry" : isSignup ? "Run the successful sign-up instead" : "Run the successful login instead"}
                    </button></div>
                  </>
                ) : inspectedStepId && openPayload ? (
                  <HttpInspector kind={openPayload.kind} headline={openPayload.headline} headers={openPayload.headers} body={openPayload.body} />
                ) : status === "completed" ? (
                  <><StatusCode code={successCode} /><div className="outcome-explanation"><strong>{isSignup ? "Account creation succeeded" : "Authentication succeeded"}</strong><p>{isSignup ? "The server checked the email, hashed the password, stored the new user, and returned only a safe result and simulated session." : "The database lookup and password comparison happened on the server. Only the result and simulated session returned to the browser."}</p></div></>
                ) : (
                  <div className="inspection-empty">
                    <span aria-hidden="true">⌕</span>
                    <strong>Pause and inspect</strong>
                    <p>Inspectable stages expose a focused request, query, token, or response. Password values stay masked.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}
