import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loginSimulationDefinition } from "@/simulations/login/login-definition";
import { createSimulationStore } from "@/stores/simulation-store";
import { useSimulationPlayback } from "./use-simulation-playback";

describe("simulation playback controller", () => {
  afterEach(() => vi.useRealTimers());

  it("cancels scheduled playback when its consumer unmounts", () => {
    vi.useFakeTimers();
    const store = createSimulationStore(loginSimulationDefinition);
    const { unmount } = renderHook(() => useSimulationPlayback(store));

    act(() => store.getState().play());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses one state-driven timer and respects the selected speed", () => {
    vi.useFakeTimers();
    const store = createSimulationStore(loginSimulationDefinition);
    renderHook(() => useSimulationPlayback(store));
    act(() => {
      store.getState().setSpeed(2);
      store.getState().play();
    });

    act(() => vi.advanceTimersByTime(loginSimulationDefinition.steps[0].duration / 2));
    expect(store.getState().currentStepIndex).toBe(1);
  });
});
