"use client";

import { useState } from "react";
import { SimulationCanvas, useLabSimulation } from "./simulation-canvas";
import { StatusCode } from "@/components/simulation/status-code";
import type { MiddlewareLabConfig } from "@/types/lab";
import type { Lesson } from "@/types/lesson";

type CheckpointId = MiddlewareLabConfig["checkpoints"][number]["id"];

export function MiddlewareLab({ lesson, config, onInteraction }: { lesson: Lesson; config: MiddlewareLabConfig; onInteraction: () => void }) {
  const store = useLabSimulation(lesson.simulation);
  const [enabled, setEnabled] = useState<Record<CheckpointId, boolean>>({ logging: true, authentication: true, validation: true });
  const [hasToken, setHasToken] = useState(true);
  const [validBody, setValidBody] = useState(true);
  const [outcome, setOutcome] = useState<{ status: 200 | 400 | 401; message: string } | null>(null);

  function toggle(id: CheckpointId) {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
    setOutcome(null);
    onInteraction();
  }

  function send() {
    // Order matters: authentication runs before validation.
    if (enabled.authentication && !hasToken) {
      setOutcome({ status: 401, message: "Stopped at Authentication. The controller never ran." });
      store.getState().restart();
      store.getState().triggerFailure("missing-token");
      store.getState().play();
      onInteraction();
      return;
    }
    if (enabled.validation && !validBody) {
      setOutcome({ status: 400, message: "Stopped at Validation. The controller never ran." });
      store.getState().restart();
      store.getState().triggerFailure("invalid-request");
      store.getState().play();
      onInteraction();
      return;
    }

    const warnings: string[] = [];
    if (!enabled.authentication && !hasToken) warnings.push("Authentication off → an unidentified request reached the controller.");
    if (!enabled.validation && !validBody) warnings.push("Validation off → malformed input reached the controller.");
    if (!enabled.logging) warnings.push("Logging off → no record kept, but the request still passed.");

    setOutcome({ status: 200, message: warnings.length ? warnings.join(" ") : "All enabled checkpoints passed." });
    store.getState().restart();
    store.getState().triggerFailure(null);
    store.getState().play();
    onInteraction();
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
          <button type="button" className="button button-primary" onClick={send}>Send protected request</button>
        </fieldset>
      </div>

      {outcome ? (
        <div className="http-outcome">
          <StatusCode code={outcome.status} />
          <p>{outcome.message}</p>
        </div>
      ) : null}

      <SimulationCanvas store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction} />
    </div>
  );
}
