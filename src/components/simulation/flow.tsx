import type { ReactNode } from "react";

type FlowProps = {
  children: ReactNode;
  direction?: "responsive" | "horizontal" | "vertical";
  label: string;
  className?: string;
};

export function Flow({ children, direction = "responsive", label, className = "" }: FlowProps) {
  return (
    <div
      className={`flow flow-${direction} ${className}`.trim()}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}

type FlowStageProps = {
  children: ReactNode;
  number: number;
  label: string;
};

export function FlowStage({ children, number, label }: FlowStageProps) {
  return (
    <div className="flow-stage">
      <span className="flow-stage-label">Stage {number}: {label}</span>
      {children}
    </div>
  );
}

type FlowArrowProps = {
  label: string;
  state?: "default" | "active" | "paused" | "complete" | "error";
  reverse?: boolean;
};

export function FlowArrow({ label, state = "default", reverse = false }: FlowArrowProps) {
  return (
    <div
      className={`flow-arrow flow-arrow-${state} ${reverse ? "flow-arrow-reverse" : ""}`.trim()}
      aria-label={`${label}: ${state}`}
    >
      <span>{label}</span>
      <i aria-hidden="true" />
      <b aria-hidden="true">{reverse ? "‹" : "›"}</b>
    </div>
  );
}
