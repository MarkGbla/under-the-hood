import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";

export const metadata: Metadata = { title: "Middleware" };

export default function MiddlewarePage() {
  const lesson = getLesson("middleware");
  if (!lesson) notFound();
  return <LessonShell lesson={lesson} />;
}
