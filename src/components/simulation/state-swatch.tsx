import type { SystemNodeState } from "@/types/simulation";

const descriptions: Record<SystemNodeState, string> = {
  default: "Ready for the next event",
  loading: "Waiting for work to finish",
  active: "Processing the current event",
  paused: "Playback stopped here",
  inspected: "Technical details are open",
  success: "The stage completed",
  rejected: "The system refused this action",
  error: "The application cannot continue",
  disabled: "This control or stage is unavailable",
};

export function StateSwatch({ state }: { state: SystemNodeState }) {
  return (
    <div className={`state-swatch state-swatch-${state}`}>
      <span aria-hidden="true" />
      <div><strong>{state}</strong><small>{descriptions[state]}</small></div>
    </div>
  );
}
