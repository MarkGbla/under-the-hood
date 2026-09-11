import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";

export const metadata: Metadata = { title: "Authentication vs Authorization" };

export default function AuthPage() {
  const lesson = getLesson("auth");
  if (!lesson) notFound();
  return <LessonShell lesson={lesson} />;
}
