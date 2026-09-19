"use client";

import { useState } from "react";
import { SimulationCanvas } from "./simulation-canvas";
import { createSimulationStore } from "@/stores/simulation-store";
import { createLabRun } from "./create-lab-run";
import { StatusCode } from "@/components/simulation/status-code";
import type { MiddlewareLabConfig } from "@/types/lab";
import type { Lesson } from "@/types/lesson";

type CheckpointId = MiddlewareLabConfig["checkpoints"][number]["id"];

export function MiddlewareLab({ lesson, config, onInteraction }: { lesson: Lesson; config: MiddlewareLabConfig; onInteraction: () => void }) {
  const [store, setStore] = useState(() => createSimulationStore(lesson.simulation));
  const [enabled, setEnabled] = useState<Record<CheckpointId, boolean>>({ logging: true, authentication: true, validation: true });
  const [hasToken, setHasToken] = useState(true);
  const [validBody, setValidBody] = useState(true);
  const [outcome, setOutcome] = useState<{ status: 200 | 400 | 401; message: string } | null>(null);

  function toggle(id: CheckpointId) {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
    setOutcome(null);
    onInteraction();
  }

  function send(requestHasToken = hasToken, requestBodyValid = validBody, checkpoints = enabled) {
    function run(status: 200 | 400 | 401, message: string) {
      setOutcome({ status, message });
      setStore(createLabRun({
        definition: lesson.simulation,
        speed: store.getState().speed,
        failure: status === 401 ? "missing-token" : status === 400 ? "invalid-request" : null,
        request: {
          method: "POST", path: "/api/profile", body: requestBodyValid ? JSON.stringify({ name: "Mariama" }, null, 2) : "{}",
          headers: [{ name: "Content-Type", value: "application/json" }, ...(requestHasToken ? [{ name: "Authorization", value: "Bearer [simulated valid token]" }] : [])],
        },
        response: { statusCode: status, body: JSON.stringify({ updated: status === 200, message }, null, 2) },
        mapStep: (step) => {
          const checkpoint = config.checkpoints.find((item) => `${item.id}-middleware` === step.id);
          return checkpoint && !checkpoints[checkpoint.id] ? {
            ...step, title: `${checkpoint.label} skipped`, description: `${checkpoint.label} is disabled. This checkpoint does not inspect or stop the request.`, inspectable: false, pauseAfter: false,
          } : step;
        },
      }));
      onInteraction();
    }

    // Order matters: authentication runs before validation.
    if (checkpoints.authentication && !requestHasToken) {
      run(401, "Stopped at Authentication. The controller never ran.");
      return;
    }
    if (checkpoints.validation && !requestBodyValid) {
      run(400, "Stopped at Validation. The controller never ran.");
      return;
    }

    const warnings: string[] = [];
    if (!checkpoints.authentication && !requestHasToken) warnings.push("Authentication off → an unidentified request reached the controller.");
    if (!checkpoints.validation && !requestBodyValid) warnings.push("Validation off → malformed input reached the controller.");
    if (!checkpoints.logging) warnings.push("Logging off → no record kept, but the request still passed.");

    run(200, warnings.length ? warnings.join(" ") : "All enabled checkpoints passed.");
  }

  return (
    <div className="lab-shell">
      <div className="middleware-grid">
        <fieldset className="middleware-panel">
          <legend>Pipeline checkpoints</legend>
          {config.checkpoints.map((checkpoint) => (
            <label key={checkpoint.id} className="toggle-row">
              <input type="checkbox" checked={enabled[checkpoint.id]} onChange={() => toggle(checkpoint.id)} />
              <span>
                <strong>{checkpoint.label}</strong>
                <small>{checkpoint.description}</small>
              </span>
              <span className={enabled[checkpoint.id] ? "toggle-state toggle-on" : "toggle-state toggle-off"}>
                {enabled[checkpoint.id] ? "Enabled" : "Disabled"}
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="middleware-panel">
          <legend>The request being sent</legend>
          <label className="toggle-row">
            <input type="checkbox" checked={hasToken} onChange={() => { setHasToken(!hasToken); setOutcome(null); }} />
            <span><strong>Carries an identity token</strong></span>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={validBody} onChange={() => { setValidBody(!validBody); setOutcome(null); }} />
            <span><strong>Body is valid</strong></span>
          </label>
          <button type="button" className="button button-primary" onClick={() => send()}>Send protected request</button>
        </fieldset>
      </div>

      {outcome ? (
        <div className="http-outcome" role="status">
          <StatusCode code={outcome.status} />
          <p>{outcome.message}</p>
        </div>
      ) : null}

      <SimulationCanvas
        store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction}
        onRunWorkingVersion={() => { setHasToken(true); setValidBody(true); send(true, true); }}
        onTriggerFailure={() => {
          const checkpoints = { ...enabled, authentication: true };
          setEnabled(checkpoints);
          setHasToken(false);
          send(false, validBody, checkpoints);
        }}
      />
    </div>
  );
}
