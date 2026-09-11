"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ApplicationError } from "./application-error";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * An unexpected render fault in one simulation must not require reloading the
 * whole application. This is deliberately distinct from a simulated failure,
 * which is part of the lesson and rendered by the lab itself.
 */
export class SimulationErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Simulation failed to render", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ApplicationError
          title="This simulation could not be displayed"
          message="Your saved progress is safe. Restart the simulation to try again."
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
