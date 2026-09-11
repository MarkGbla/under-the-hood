import type { SystemNodeKind, SystemNodeState } from "@/types/simulation";
import { NodeIcon } from "./node-icon";

type SystemNodeProps = {
  kind: SystemNodeKind;
  label: string;
  detail?: string;
  state?: SystemNodeState;
  compact?: boolean;
  className?: string;
};

export function SystemNode({
  kind,
  label,
  detail,
  state = "default",
  compact = false,
  className = "",
}: SystemNodeProps) {
  const stateLabel: Partial<Record<SystemNodeState, string>> = {
    loading: "Loading",
    active: "Processing",
    paused: "Paused",
    inspected: "Inspecting",
    success: "Complete",
    rejected: "Rejected",
    error: "Stopped",
    disabled: "Off",
  };

  return (
    <div
      className={`system-node system-node-${kind} node-state-${state} ${compact ? "system-node-compact" : ""} ${className}`.trim()}
      data-kind={kind}
      data-state={state}
      aria-label={`${label}: ${stateLabel[state] ?? "Ready"}${detail ? `. ${detail}` : ""}`}
    >
      <span className="node-icon"><NodeIcon kind={kind} /></span>
      <span className="node-copy">
        <strong>{label}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      {stateLabel[state] ? <span className="node-state-label">{stateLabel[state]}</span> : null}
    </div>
  );
}
