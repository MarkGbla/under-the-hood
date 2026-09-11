import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";

export const metadata: Metadata = { title: "HTTP Request & Response" };

export default function HttpPage() {
  const lesson = getLesson("http");
  if (!lesson) notFound();
  return <LessonShell lesson={lesson} />;
}
