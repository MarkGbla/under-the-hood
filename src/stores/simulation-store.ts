import { createStore, type StoreApi } from "zustand/vanilla";
import { advanceSimulation, getInitialSnapshot, moveToPreviousStep } from "@/simulations/engine/simulation-engine";
import { simulationSpeeds, type FailureType, type SimulationDefinition, type SimulationSnapshot, type SimulationSpeed } from "@/simulations/engine/types";

export type SimulationStore = SimulationSnapshot & {
  definition: SimulationDefinition;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  restart: () => void;
  setSpeed: (speed: SimulationSpeed) => void;
  triggerFailure: (failure: FailureType | null) => void;
  inspectCurrent: () => void;
  closeInspector: () => void;
  tick: () => void;
};

export type SimulationStoreApi = StoreApi<SimulationStore>;

export function createSimulationStore(definition: SimulationDefinition): SimulationStoreApi {
  if (definition.steps.length === 0) {
    throw new Error("A simulation requires at least one step.");
  }

  return createStore<SimulationStore>()((set, get) => ({
    ...getInitialSnapshot(),
    definition,
    play: () => set((state) => {
      if (state.status === "completed" || state.status === "failed") return state;
      return { status: "playing", inspectedStepId: null };
    }),
    pause: () => set((state) => state.status === "playing" ? { status: "paused" } : state),
    next: () => set((state) => advanceSimulation(definition, state, "manual")),
    previous: () => set((state) => moveToPreviousStep(state)),
    restart: () => set({ ...getInitialSnapshot(), definition }),
    setSpeed: (speed) => {
      if (simulationSpeeds.includes(speed)) set({ speed });
    },
    triggerFailure: (selectedFailure) => {
      if (selectedFailure && !definition.failureRules[selectedFailure]) {
        throw new Error(`Failure ${selectedFailure} is not supported by ${definition.id}.`);
      }
      set({
        ...getInitialSnapshot(),
        definition,
        selectedFailure,
        speed: get().speed,
      });
    },
    inspectCurrent: () => set((state) => {
      const step = definition.steps[state.currentStepIndex];
      return step.inspectable ? { inspectedStepId: step.id, status: state.status === "playing" ? "paused" : state.status } : state;
    }),
    closeInspector: () => set({ inspectedStepId: null }),
    tick: () => set((state) => advanceSimulation(definition, state, "automatic")),
  }));
}
