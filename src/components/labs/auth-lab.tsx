"use client";

import { useState } from "react";
import { SimulationCanvas } from "./simulation-canvas";
import { createSimulationStore } from "@/stores/simulation-store";
import { createLabRun } from "./create-lab-run";
import { StatusCode } from "@/components/simulation/status-code";
import { evaluatePermission, rolePermissions } from "@/lib/permissions";
import type { AuthLabConfig } from "@/types/lab";
import type { Lesson } from "@/types/lesson";
import type { PermissionAction } from "@/types/permission";
import type { HttpMethod } from "@/types/simulation";

export function AuthLab({ lesson, config, onInteraction }: { lesson: Lesson; config: AuthLabConfig; onInteraction: () => void }) {
  const [store, setStore] = useState(() => createSimulationStore(lesson.simulation));
  const [userId, setUserId] = useState(config.users[0].id);
  const [actionId, setActionId] = useState<PermissionAction>(config.actions[0].id);
  const [decided, setDecided] = useState(false);

  const user = config.users.find((candidate) => candidate.id === userId) ?? config.users[0];
  const action = config.actions.find((candidate) => candidate.id === actionId) ?? config.actions[0];
  const decision = evaluatePermission(user, action.id);

  function check(requestUser = user) {
    const result = evaluatePermission(requestUser, action.id);
    const failure = requestUser.tokenState === "missing" ? "missing-token"
      : requestUser.tokenState === "invalid" ? "invalid-token"
      : result.allowed ? null
      : "wrong-role";
    setUserId(requestUser.id);
    setDecided(true);
    const [method, path] = action.endpoint.split(" ");
    setStore(createLabRun({
      definition: lesson.simulation,
      speed: store.getState().speed,
      failure,
      request: {
        method: method as HttpMethod, path,
        headers: [{ name: "Accept", value: "application/json" }, ...(requestUser.tokenState === "missing" ? [] : [{ name: "Authorization", value: `Bearer [simulated ${requestUser.tokenState} token]` }])],
      },
      response: { statusCode: result.statusCode, body: JSON.stringify({ allowed: result.allowed, message: result.explanation }, null, 2) },
    }));
    onInteraction();
  }

  return (
    <div className="lab-shell">
      <div className="auth-grid">
        <fieldset className="auth-panel">
          <legend>Who is making the request?</legend>
          {config.users.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={candidate.id === userId ? "scenario-active" : ""}
              aria-pressed={candidate.id === userId}
              onClick={() => { setUserId(candidate.id); setDecided(false); }}
            >
              <strong>{candidate.name}</strong>
              <small>{candidate.role} · token {candidate.tokenState}</small>
            </button>
          ))}
        </fieldset>

        <fieldset className="auth-panel">
          <legend>What are they trying to do?</legend>
          {config.actions.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={candidate.id === actionId ? "scenario-active" : ""}
              aria-pressed={candidate.id === actionId}
              onClick={() => { setActionId(candidate.id); setDecided(false); }}
            >
              <strong>{candidate.label}</strong>
              <small>{candidate.endpoint}</small>
            </button>
          ))}
        </fieldset>

        <div className="auth-panel auth-summary">
          <h3>Permissions for {user.role}</h3>
          <ul>
            {rolePermissions[user.role].map((permission) => <li key={permission}>{permission.replaceAll("-", " ")}</li>)}
          </ul>
          <p className="auth-question"><strong>Authentication</strong> — who are you?<br /><strong>Authorization</strong> — what may you do?</p>
          <button type="button" className="button button-primary" onClick={() => check()}>Check access</button>
        </div>
      </div>

      {decided ? (
        <div className="http-outcome" role="status">
          <StatusCode code={decision.statusCode} />
          <p><strong>{decision.allowed ? "Access granted" : `Stopped at ${decision.stage}`}</strong><br />{decision.explanation}</p>
        </div>
      ) : null}

      <SimulationCanvas
        store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction}
        onRunWorkingVersion={() => check(config.users.find((candidate) => evaluatePermission(candidate, action.id).allowed) ?? user)}
        onTriggerFailure={() => check(config.users.find((candidate) => candidate.tokenState === "missing") ?? user)}
      />
    </div>
  );
}
