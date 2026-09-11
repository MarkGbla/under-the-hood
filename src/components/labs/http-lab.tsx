"use client";

import { useState } from "react";
import { SimulationCanvas, useLabSimulation } from "./simulation-canvas";
import { HttpInspector } from "@/components/simulation/http-inspector";
import { StatusCode } from "@/components/simulation/status-code";
import type { HttpLabConfig, HttpScenario } from "@/types/lab";
import type { Lesson } from "@/types/lesson";
import type { HttpMethod } from "@/types/simulation";

const methods: HttpMethod[] = ["GET", "POST", "PATCH", "DELETE"];

export function HttpLab({ lesson, config, onInteraction }: { lesson: Lesson; config: HttpLabConfig; onInteraction: () => void }) {
  const store = useLabSimulation(lesson.simulation);
  const first = config.scenarios[0];
  const [method, setMethod] = useState<HttpMethod>(first.method);
  const [endpoint, setEndpoint] = useState(first.endpoint);
  const [body, setBody] = useState(first.body);
  const [sent, setSent] = useState<HttpScenario | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  /** Deterministic: the same method, endpoint, and body always resolve the same way. */
  function resolve(): HttpScenario {
    const match = config.scenarios.find((scenario) => scenario.method === method && scenario.endpoint === endpoint.trim());
    if (!match) return config.scenarios.find((scenario) => scenario.failure === "missing-route") ?? first;
    if (match.method === "POST" && !body.includes("name")) {
      return config.scenarios.find((scenario) => scenario.failure === "invalid-request") ?? match;
    }
    return match;
  }

  function send() {
    const scenario = resolve();
    setSent(scenario);
    store.getState().restart();
    store.getState().triggerFailure(scenario.failure);
    store.getState().play();
    onInteraction();
  }

  function load(scenario: HttpScenario) {
    setMethod(scenario.method);
    setEndpoint(scenario.endpoint);
    setBody(scenario.body);
    setSent(null);
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
          <button type="button" className="button button-primary" onClick={send}>Send request</button>
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
        <div className="http-outcome">
          <StatusCode code={sent.statusCode} />
          <p>{sent.description}</p>
        </div>
      ) : null}

      {showDetail ? (
        <div className="inspector-showcase">
          <HttpInspector
            kind="request"
            headline={`${method} ${endpoint}`}
            headers={[{ name: "Accept", value: "application/json" }, ...(body.trim() ? [{ name: "Content-Type", value: "application/json" }] : [])]}
            body={body.trim() || undefined}
          />
          <HttpInspector
            kind="response"
            headline={sent ? `${sent.statusCode} response` : "Send a request first"}
            headers={[{ name: "Content-Type", value: "application/json" }]}
            body={sent?.responseBody}
          />
        </div>
      ) : null}

      <SimulationCanvas store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction} />
    </div>
  );
}
