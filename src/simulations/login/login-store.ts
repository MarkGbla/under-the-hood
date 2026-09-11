import { createSimulationStore } from "@/stores/simulation-store";
import { loginSimulationDefinition, signupSimulationDefinition } from "./login-definition";

export const loginSimulationStore = createSimulationStore(loginSimulationDefinition);
export const signupSimulationStore = createSimulationStore(signupSimulationDefinition);
