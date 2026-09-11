"use client";

import { AuthLab } from "./auth-lab";
import { CrudLab } from "./crud-lab";
import { DeploymentLab } from "./deployment-lab";
import { FlowLab } from "./flow-lab";
import { HttpLab } from "./http-lab";
import { MiddlewareLab } from "./middleware-lab";
import type { Lesson } from "@/types/lesson";

export function LessonLab({ lesson, onInteraction }: { lesson: Lesson; onInteraction: () => void }) {
  const lab = lesson.lab;

  switch (lab.kind) {
    case "flow":
      return <FlowLab lesson={lesson} config={lab} onInteraction={onInteraction} />;
    case "http":
      return <HttpLab lesson={lesson} config={lab} onInteraction={onInteraction} />;
    case "crud":
      return <CrudLab lesson={lesson} config={lab} onInteraction={onInteraction} />;
    case "auth":
      return <AuthLab lesson={lesson} config={lab} onInteraction={onInteraction} />;
    case "middleware":
      return <MiddlewareLab lesson={lesson} config={lab} onInteraction={onInteraction} />;
    case "deployment":
      return <DeploymentLab lesson={lesson} config={lab} onInteraction={onInteraction} />;
  }
}
