"use client";

import { useState } from "react";
import { SimulationCanvas } from "./simulation-canvas";
import { HttpInspector } from "@/components/simulation/http-inspector";
import { StatusCode, statusReason } from "@/components/simulation/status-code";
import { createSimulationStore } from "@/stores/simulation-store";
import { createLabRun } from "./create-lab-run";
import type { HttpLabConfig, HttpScenario } from "@/types/lab";
import type { Lesson } from "@/types/lesson";
import type { HttpMethod } from "@/types/simulation";

const methods: HttpMethod[] = ["GET", "POST", "PATCH", "DELETE"];

export function HttpLab({ lesson, config, onInteraction }: { lesson: Lesson; config: HttpLabConfig; onInteraction: () => void }) {
  const [store, setStore] = useState(() => createSimulationStore(lesson.simulation));
  const first = config.scenarios[0];
  const [method, setMethod] = useState<HttpMethod>(first.method);
  const [endpoint, setEndpoint] = useState(first.endpoint);
  const [body, setBody] = useState(first.body);
  const [sent, setSent] = useState<HttpScenario | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  /** Deterministic: the same method, endpoint, and body always resolve the same way. */
  function resolve(): HttpScenario {
    const request = { method, endpoint: endpoint.trim(), body };
    const match = config.scenarios.find((scenario) => scenario.method === method && scenario.endpoint === request.endpoint);
    if (!match) {
      const missing = config.scenarios.find((scenario) => scenario.failure === "missing-route") ?? first;
      return { ...missing, ...request, description: "No route matches this method and endpoint.", responseBody: JSON.stringify({ error: "route not found" }, null, 2) };
    }
    if (match.method === "POST") {
      const invalid = config.scenarios.find((scenario) => scenario.failure === "invalid-request") ?? match;
      let parsed: unknown;
      try {
        parsed = JSON.parse(body);
      } catch {
        return { ...invalid, ...request, description: "The request body must be valid JSON.", responseBody: JSON.stringify({ error: "invalid JSON" }, null, 2) };
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !("name" in parsed) || typeof parsed.name !== "string" || !parsed.name.trim()) {
        return { ...invalid, ...request, description: "Provide a non-empty name as a JSON string.", responseBody: JSON.stringify({ error: "name must be a non-empty string" }, null, 2) };
      }
      return { ...match, ...request, description: `Created ${parsed.name.trim()}.`, responseBody: JSON.stringify({ id: 43, name: parsed.name.trim() }, null, 2) };
    }
    return { ...match, ...request };
  }

  function sendScenario(scenario: HttpScenario) {
    const nextStore = createLabRun({
      definition: lesson.simulation,
      speed: store.getState().speed,
      failure: scenario.failure,
      request: { method: scenario.method, path: scenario.endpoint, body: scenario.body },
      response: { statusCode: scenario.statusCode, body: scenario.responseBody },
    });
    setStore(nextStore);
    setSent(scenario);
    onInteraction();
  }

  function load(scenario: HttpScenario) {
    setMethod(scenario.method);
    setEndpoint(scenario.endpoint);
    setBody(scenario.body);
    setSent(null);
  }

  function runPreset(scenario: HttpScenario) {
    load(scenario);
    sendScenario(scenario);
  }

  return (
    <div className="lab-shell">
      <div className="http-composer">
        <div className="composer-row">
          <label>Method
            <select value={method} onChange={(event) => setMethod(event.target.value as HttpMethod)}>
              {methods.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="composer-endpoint">Endpoint
            <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} spellCheck={false} />
          </label>
        </div>
        <label>Body
          <textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} spellCheck={false} placeholder="None" />
        </label>
        <div className="composer-actions">
          <button type="button" className="button button-primary" onClick={() => sendScenario(resolve())}>Send request</button>
          <button type="button" className="button button-quiet" onClick={() => setShowDetail((open) => !open)} aria-expanded={showDetail}>
            {showDetail ? "Hide full message" : "See more detail"}
          </button>
        </div>
        <div className="composer-presets">
          <span>Try:</span>
          {config.scenarios.map((scenario) => (
            <button key={scenario.id} type="button" onClick={() => load(scenario)}>{scenario.label}</button>
          ))}
        </div>
      </div>

      {sent ? (
        <div className="http-outcome" role="status">
          <StatusCode code={sent.statusCode} />
          <p>{sent.description}</p>
        </div>
      ) : null}

      {showDetail ? (
        <div>
          <p>{sent ? "Last sent exchange" : "Request preview · send a request to see its response"}</p>
          <div className="inspector-showcase">
          <HttpInspector
            kind="request"
            headline={`${sent?.method ?? method} ${sent?.endpoint ?? endpoint}`}
            headers={[{ name: "Accept", value: "application/json" }, ...((sent?.body ?? body).trim() ? [{ name: "Content-Type", value: "application/json" }] : [])]}
            body={(sent?.body ?? body).trim() || undefined}
          />
          <HttpInspector
            kind="response"
            headline={sent ? `${sent.statusCode} ${statusReason(sent.statusCode)}` : "Send a request first"}
            headers={[{ name: "Content-Type", value: "application/json" }]}
            body={sent?.responseBody}
          />
          </div>
        </div>
      ) : null}

      <SimulationCanvas
        store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction}
        onRunWorkingVersion={() => runPreset(config.scenarios.find((scenario) => !scenario.failure && scenario.method === sent?.method) ?? first)}
        onTriggerFailure={() => runPreset(config.scenarios.find((scenario) => scenario.failure === "invalid-request") ?? first)}
      />
    </div>
  );
}
