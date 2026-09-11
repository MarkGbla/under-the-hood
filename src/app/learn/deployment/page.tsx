import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";

export const metadata: Metadata = { title: "Deployment" };

export default function DeploymentPage() {
  const lesson = getLesson("deployment");
  if (!lesson) notFound();
  return <LessonShell lesson={lesson} />;
}
