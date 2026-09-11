"use client";

import { useState } from "react";
import { ScenarioPicker } from "./scenario-picker";
import { SimulationCanvas, useLabSimulation } from "./simulation-canvas";
import type { FlowLabConfig, ScenarioOption } from "@/types/lab";
import type { Lesson } from "@/types/lesson";

export function FlowLab({ lesson, config, onInteraction }: { lesson: Lesson; config: FlowLabConfig; onInteraction: () => void }) {
  const store = useLabSimulation(lesson.simulation);
  const [activeId, setActiveId] = useState(config.scenarios[0].id);

  function run(scenario: ScenarioOption) {
    setActiveId(scenario.id);
    store.getState().restart();
    store.getState().triggerFailure(scenario.failure);
    store.getState().play();
    onInteraction();
  }

  return (
    <div className="lab-shell">
      <ScenarioPicker legend="Choose what the browser asks for" scenarios={config.scenarios} activeId={activeId} onSelect={run} />
      <SimulationCanvas store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction} />
    </div>
  );
}
