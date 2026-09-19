"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useStore } from "zustand";
import { ScenarioPicker } from "./scenario-picker";
import { SimulationCanvas, useLabSimulation } from "./simulation-canvas";
import type { DeploymentLabConfig, ScenarioOption } from "@/types/lab";
import type { Lesson } from "@/types/lesson";

type EnvironmentId = DeploymentLabConfig["environments"][number]["id"];

export function DeploymentLab({ lesson, config, onInteraction }: { lesson: Lesson; config: DeploymentLabConfig; onInteraction: () => void }) {
  const store = useLabSimulation(lesson.simulation);
  const [environment, setEnvironment] = useState<EnvironmentId>(config.environments[0].id);
  const status = useStore(store, (state) => state.status);
  const selectedFailure = useStore(store, (state) => state.selectedFailure);
  const tabId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const released = status === "completed" && !selectedFailure;
  const activeId = config.scenarios.find((scenario) => scenario.failure === selectedFailure)?.id ?? config.scenarios[0].id;

  const active = config.environments.find((item) => item.id === environment) ?? config.environments[0];

  function run(scenario: ScenarioOption) {
    store.getState().restart();
    store.getState().triggerFailure(scenario.failure);
    store.getState().play();
    onInteraction();
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = config.environments.length - 1;
    const nextIndex = event.key === "ArrowRight" ? (index + 1) % config.environments.length
      : event.key === "ArrowLeft" ? (index + lastIndex) % config.environments.length
      : event.key === "Home" ? 0
      : event.key === "End" ? lastIndex
      : null;
    if (nextIndex === null) return;
    event.preventDefault();
    setEnvironment(config.environments[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
    onInteraction();
  }

  return (
    <div className="lab-shell">
      <div className="environment-tabs" role="tablist" aria-label="Deployment environments">
        {config.environments.map((item, index) => (
          <button
            key={item.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            type="button"
            role="tab"
            id={`${tabId}-${item.id}`}
            aria-selected={item.id === environment}
            aria-controls={`${tabId}-panel`}
            tabIndex={item.id === environment ? 0 : -1}
            className={item.id === environment ? "environment-active" : ""}
            onKeyDown={(event) => moveTab(event, index)}
            onClick={() => { setEnvironment(item.id); onInteraction(); }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="environment-description" role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${environment}`} tabIndex={0}>{active.description}</p>

      <ScenarioPicker legend="Release this version" scenarios={config.scenarios} activeId={activeId} onSelect={run} />

      <div className={released ? "release-banner release-live" : "release-banner"} role="status">
        <strong>{released ? "LIVE in production" : status === "failed" ? "Release blocked" : status === "idle" ? "Not released" : "Release in progress"}</strong>
        <p>{released ? "Users can reach this version." : "Production still runs the previous version."}</p>
      </div>

      <SimulationCanvas store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction} />
    </div>
  );
}
