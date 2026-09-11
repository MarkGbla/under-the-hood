"use client";

import { useState } from "react";
import { ScenarioPicker } from "./scenario-picker";
import { SimulationCanvas, useLabSimulation } from "./simulation-canvas";
import type { DeploymentLabConfig, ScenarioOption } from "@/types/lab";
import type { Lesson } from "@/types/lesson";

type EnvironmentId = DeploymentLabConfig["environments"][number]["id"];

export function DeploymentLab({ lesson, config, onInteraction }: { lesson: Lesson; config: DeploymentLabConfig; onInteraction: () => void }) {
  const store = useLabSimulation(lesson.simulation);
  const [environment, setEnvironment] = useState<EnvironmentId>("local");
  const [activeId, setActiveId] = useState(config.scenarios[0].id);
  const [released, setReleased] = useState(false);

  const active = config.environments.find((item) => item.id === environment) ?? config.environments[0];

  function run(scenario: ScenarioOption) {
    setActiveId(scenario.id);
    // A blocked release can never reach the live state without an explicit rerun.
    setReleased(!scenario.failure);
    store.getState().restart();
    store.getState().triggerFailure(scenario.failure);
    store.getState().play();
    onInteraction();
  }

  return (
    <div className="lab-shell">
      <div className="environment-tabs" role="tablist" aria-label="Deployment environments">
        {config.environments.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === environment}
            className={item.id === environment ? "environment-active" : ""}
            onClick={() => { setEnvironment(item.id); onInteraction(); }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="environment-description">{active.description}</p>

      <ScenarioPicker legend="Release this version" scenarios={config.scenarios} activeId={activeId} onSelect={run} />

      <div className={released ? "release-banner release-live" : "release-banner"}>
        <strong>{released ? "LIVE in production" : "Not released"}</strong>
        <p>{released ? "Users can reach this version." : "Production still runs the previous version."}</p>
      </div>

      <SimulationCanvas store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction} />
    </div>
  );
}
