import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";

export const metadata: Metadata = { title: "Request Lifecycle" };

export default function RequestLifecyclePage() {
  const lesson = getLesson("request-lifecycle");
  if (!lesson) notFound();
  return <LessonShell lesson={lesson} />;
}
