import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonShell } from "@/components/learning/lesson-shell";
import { getLesson } from "@/content/lessons";

export const metadata: Metadata = { title: "CRUD + Database" };

export default function CrudPage() {
  const lesson = getLesson("crud");
  if (!lesson) notFound();
  return <LessonShell lesson={lesson} />;
}
