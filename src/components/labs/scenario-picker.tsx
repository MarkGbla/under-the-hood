"use client";

import type { ScenarioOption } from "@/types/lab";

type ScenarioPickerProps = {
  legend: string;
  scenarios: ScenarioOption[];
  activeId: string;
  onSelect: (scenario: ScenarioOption) => void;
};

export function ScenarioPicker({ legend, scenarios, activeId, onSelect }: ScenarioPickerProps) {
  return (
    <fieldset className="scenario-picker">
      <legend>{legend}</legend>
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          type="button"
          className={scenario.id === activeId ? "scenario-active" : ""}
          aria-pressed={scenario.id === activeId}
          onClick={() => onSelect(scenario)}
        >
          <strong>{scenario.label}</strong>
          <small>{scenario.description}</small>
          <span className={scenario.failure ? "scenario-tag scenario-tag-fail" : "scenario-tag"}>{scenario.statusCode}</span>
        </button>
      ))}
    </fieldset>
  );
}
