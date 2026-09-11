"use client";

import { useMemo, type CSSProperties } from "react";
import { useStore } from "zustand";
import { Flow, FlowArrow, FlowStage } from "@/components/simulation/flow";
import { HttpInspector } from "@/components/simulation/http-inspector";
import { StatusCode } from "@/components/simulation/status-code";
import { SystemNode } from "@/components/simulation/system-node";
import { useSimulationPlayback } from "@/hooks/use-simulation-playback";
import { usePresentationMode, usePresentationShortcuts } from "@/hooks/use-presentation-mode";
import { useProgress } from "@/hooks/use-progress";
import { createSimulationStore, type SimulationStoreApi } from "@/stores/simulation-store";
import type { FailureType, SimulationDefinition, SimulationSpeed } from "@/simulations/engine/types";
import type { LessonVisualNode } from "@/types/lesson";
import type { SystemNodeState } from "@/types/simulation";

/** Each lab owns its own store instance, so two labs never share playback state. */
export function useLabSimulation(definition: SimulationDefinition): SimulationStoreApi {
  return useMemo(() => createSimulationStore(definition), [definition]);
}

const statusLabels = {
  idle: "Ready",
  playing: "Playing",
  paused: "Paused",
  completed: "Complete",
  failed: "Stopped safely",
} as const;

function formatSystemPart(value: string) {
  const words = value.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

type SimulationCanvasProps = {
  store: SimulationStoreApi;
  nodes: LessonVisualNode[];
  label: string;
  onInteraction?: () => void;
};

export function SimulationCanvas({ store, nodes, label, onInteraction }: SimulationCanvasProps) {
  // Presentation state lives in the URL, so the canvas reads it directly rather
  // than having every lab drill it through.
  const { isPresenting, setPresenting } = usePresentationMode();
  const progress = useProgress();
  const showInstructorPrompt = isPresenting && progress.preferences.showInstructorPrompts;
  const currentStepIndex = useStore(store, (state) => state.currentStepIndex);
  const status = useStore(store, (state) => state.status);
  const speed = useStore(store, (state) => state.speed);
  const failureResult = useStore(store, (state) => state.failureResult);
  const inspectedStepId = useStore(store, (state) => state.inspectedStepId);
  const definition = useStore(store, (state) => state.definition);

  useSimulationPlayback(store);

  const firstFailure = Object.keys(definition.failureRules)[0] as FailureType | undefined;
  usePresentationShortcuts({
    enabled: isPresenting,
    store,
    onExit: () => setPresenting(false),
    onFailure: firstFailure
      ? () => { store.getState().triggerFailure(firstFailure); store.getState().play(); }
      : undefined,
  });

  const currentStep = definition.steps[currentStepIndex];
  const isTerminal = status === "completed" || status === "failed";
  const payload = currentStep.payload;
  const activityKind = failureResult
    ? "error"
    : payload?.kind ?? (currentStep.action === "send-response" || currentStep.action === "show-result" ? "response" : "event");
  const activityLabel = payload?.headline ?? formatSystemPart(currentStep.action);
  const activityStyle = {
    "--activity-duration": `${Math.max(currentStep.duration / speed, 320)}ms`,
  } as CSSProperties;
  const activeNodeIndex = Math.max(0, nodes.findIndex((node) => currentStepIndex >= node.startStep && currentStepIndex <= node.endStep));
  const activitySource = failureResult
    ? nodes[Math.max(0, activeNodeIndex - 1)].label
    : formatSystemPart(currentStep.source);
  const activityTarget = failureResult
    ? nodes[activeNodeIndex].label
    : currentStep.target ? formatSystemPart(currentStep.target) : "Done";

  function act(run: () => void) {
    run();
    onInteraction?.();
  }

  function nodeState(node: LessonVisualNode): SystemNodeState {
    if (status === "failed") {
      if (currentStepIndex >= node.startStep && currentStepIndex <= node.endStep) return "rejected";
      return currentStepIndex > node.endStep ? "success" : "default";
    }
    if (status === "completed" || currentStepIndex > node.endStep) return "success";
    if (currentStepIndex < node.startStep) return "default";
    if (inspectedStepId === currentStep.id) return "inspected";
    if (status === "playing") return "active";
    if (status === "paused") return "paused";
    return "default";
  }

  function arrowState(index: number) {
    if (status === "idle") return "default" as const;
    if (status === "completed") return "complete" as const;
    if (status === "failed") {
      const failureConnectorIndex = Math.max(0, activeNodeIndex - 1);
      if (index < failureConnectorIndex) return "complete" as const;
      if (index === failureConnectorIndex) return "error" as const;
      return "default" as const;
    }
    if (index < activeNodeIndex) return "complete" as const;
    if (index === activeNodeIndex) {
      return status === "paused" ? "paused" as const : "active" as const;
    }
    return "default" as const;
  }

  return (
    <section className={isPresenting ? "lab-canvas lab-canvas-presenting" : "lab-canvas"} aria-label={label}>
      <div className="workbench-topbar">
        <div className={`workbench-status workbench-status-${status}`}><i />
          <span><strong>{definition.title}</strong><small>{statusLabels[status]} · Step {currentStepIndex + 1} of {definition.steps.length}</small></span>
        </div>
        <div className="workbench-controls" aria-label="Simulation playback controls">
          <button type="button" onClick={() => act(() => store.getState().restart())}>Restart</button>
          <button type="button" aria-label="Step backward" disabled={currentStepIndex === 0} onClick={() => act(() => store.getState().previous())}>◀</button>
          <button
            className="control-play"
            type="button"
            aria-label={status === "playing" ? "Pause simulation" : "Play simulation"}
            disabled={isTerminal}
            onClick={() => act(() => status === "playing" ? store.getState().pause() : store.getState().play())}
          >{status === "playing" ? "Pause" : "Play"}</button>
          <button type="button" aria-label="Step forward" disabled={isTerminal} onClick={() => act(() => store.getState().next())}>▶</button>
          <label className="speed-control">Speed
            <select value={speed} onChange={(event) => act(() => store.getState().setSpeed(Number(event.target.value) as SimulationSpeed))}>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </label>
        </div>
      </div>

      <div className={`simulation-activity simulation-activity-${status} simulation-activity-${activityKind}`} style={activityStyle}>
        <div className="simulation-activity-heading">
          <span><i /> {status === "idle" ? "Ready to run" : status === "playing" ? "Moving now" : status === "paused" ? "Paused here" : status === "failed" ? "Stopped here" : "Journey complete"}</span>
          <strong>{currentStep.title}</strong>
        </div>
        <div className="activity-route" aria-hidden="true">
          <span>{activitySource}</span>
          <div className="activity-track">
            <i />
            <div className="activity-token" key={`${currentStep.id}-${activityKind}`}>
              <b>{activityKind === "response" ? "RES" : activityKind === "error" ? "ERR" : activityKind === "request" ? "REQ" : "EVENT"}</b>
              <small>{activityLabel}</small>
            </div>
          </div>
          <span>{activityTarget}</span>
        </div>
      </div>

      <Flow className="lab-flow" label={`${label} sequence`}>
        {nodes.map((node, index) => (
          <div className="login-flow-segment" key={node.id}>
            <FlowStage number={index + 1} label={node.label}>
              <SystemNode kind={node.kind} label={node.label} detail={node.detail} state={nodeState(node)} compact />
            </FlowStage>
            {index < nodes.length - 1 ? <FlowArrow label={`${node.label} to ${nodes[index + 1].label}`} state={arrowState(index)} /> : null}
          </div>
        ))}
      </Flow>

      <div className="simulation-progress">
        <div className="simulation-progress-label"><span>Journey</span><strong>{currentStepIndex + 1} / {definition.steps.length}</strong></div>
        <ol className="step-dots" aria-label={`Step ${currentStepIndex + 1} of ${definition.steps.length}: ${currentStep.title}`}>
          {definition.steps.map((step, index) => {
            const state = failureResult && index === currentStepIndex ? "failed"
              : index < currentStepIndex || status === "completed" ? "done"
              : index === currentStepIndex ? "now"
              : "todo";
            return <li key={step.id} className={`dot-${state}`} title={step.title}>{state === "done" ? "✓" : state === "failed" ? "✕" : index + 1}</li>;
          })}
        </ol>
      </div>

      <div className="simulation-detail-panel">
        <div className={`current-event current-event-${status}`} aria-live="polite">
          <span>{String(currentStepIndex + 1).padStart(2, "0")}</span>
          <div>
            <small>Current event</small>
            <strong>{failureResult?.title ?? currentStep.title}</strong>
            <p>{failureResult?.explanation ?? currentStep.description}</p>
          </div>
          <button
            type="button"
            disabled={!currentStep.inspectable}
            onClick={() => act(() => store.getState().inspectCurrent())}
          >{currentStep.inspectable ? "Inspect details" : "No details for this step"}</button>
        </div>

        <div className="lab-inspection">
          {failureResult ? (
            <>
              {/* The status code already carries the explanation; don't repeat it. */}
              <StatusCode code={failureResult.statusCode as 400 | 401 | 403 | 404 | 409 | 500} />
              <div className="retry-panel">
                <button type="button" onClick={() => act(() => { store.getState().triggerFailure(null); store.getState().play(); })}>Run the working version</button>
              </div>
            </>
          ) : inspectedStepId && payload ? (
            <HttpInspector kind={payload.kind} headline={payload.headline} headers={payload.headers} body={payload.body} />
          ) : status === "completed" ? (
            <StatusCode code={200} />
          ) : (
            <div className="inspection-empty">
              <span aria-hidden="true">⌕</span>
              <div><strong>Inspect the live event</strong><p>Pause on a step with details, then open the request or response.</p></div>
            </div>
          )}
        </div>
      </div>

      {showInstructorPrompt && currentStep.instructorPrompt ? (
        <p className="instructor-cue" role="note"><strong>Teaching cue:</strong> {currentStep.instructorPrompt}</p>
      ) : null}
    </section>
  );
}
