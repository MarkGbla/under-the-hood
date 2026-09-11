"use client";

import { useEffect } from "react";
import { LoginSimulation } from "./login-simulation";
import { SimulationErrorBoundary } from "./error-boundary";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { saveLastVisited } from "@/lib/storage";
import { loginCapstoneContent } from "@/simulations/login/login-content";

export function LoginCapstone() {
  const { patch } = useLessonProgress("login-capstone", loginCapstoneContent.id);

  useEffect(() => {
    saveLastVisited("/simulations/login", loginCapstoneContent.id);
  }, []);

  return (
    <SimulationErrorBoundary>
      <LoginSimulation onInteraction={() => patch({ meaningfulInteraction: true })} />
    </SimulationErrorBoundary>
  );
}
