"use client";

import { useEffect } from "react";
import { useStore } from "zustand";
import type { SimulationStoreApi } from "@/stores/simulation-store";

export function useSimulationPlayback(store: SimulationStoreApi) {
  const status = useStore(store, (state) => state.status);
  const currentStepIndex = useStore(store, (state) => state.currentStepIndex);
  const speed = useStore(store, (state) => state.speed);
  const definition = useStore(store, (state) => state.definition);

  useEffect(() => {
    if (status !== "playing") return;

    const step = definition.steps[currentStepIndex];
    const timer = window.setTimeout(() => {
      store.getState().tick();
    }, step.duration / speed);

    return () => window.clearTimeout(timer);
  }, [currentStepIndex, definition, speed, status, store]);
}
