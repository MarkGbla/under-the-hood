"use client";

import Link from "next/link";
import { LessonCard } from "./lesson-card";
import { useProgress } from "@/hooks/use-progress";
import { learningStages, type Lesson, type LessonStatus } from "@/types/lesson";

/**
 * Lesson content stays static and server-rendered; only the learner's own
 * status is layered on here, where browser storage is available.
 */
export function LessonProgressGrid({ lessons }: { lessons: Lesson[] }) {
  const progress = useProgress();

  const resume = progress.lastVisited;
  const resumeLesson = resume?.lessonId
    ? lessons.find((lesson) => lesson.id === resume.lessonId)
    : undefined;
  // The capstone is not one of the six lessons, so resolve it separately rather
  // than silently dropping the resume banner.
  const resumeCapstone = !resumeLesson && resume?.path === "/simulations/login";
  const resumeTarget = resumeLesson
    ? { href: `/learn/${resumeLesson.slug}`, title: resumeLesson.title, key: resumeLesson.slug as keyof typeof progress.lessons }
    : resumeCapstone
      ? { href: "/simulations/login", title: "What happens when you log in or sign up?", key: "login-capstone" as const }
      : null;
  const resumeProgress = resumeTarget ? progress.lessons[resumeTarget.key] : undefined;

  function statusFor(lesson: Lesson): LessonStatus {
    const record = progress.lessons[lesson.slug];
    if (record?.completed) return "completed";
    if (record) return "in-progress";
    return "available";
  }

  return (
    <>
      {resumeTarget && !resumeProgress?.completed ? (
        <div className="resume-banner">
          <div>
            <span className="kicker">Welcome back</span>
            <h2>Continue where you left off</h2>
            <p>
              {resumeTarget.title}
              {resumeProgress && resumeLesson ? ` · ${resumeProgress.stage} stage (${resumeProgress.stageIndex + 1} of ${learningStages.length})` : ""}
            </p>
          </div>
          <Link className="button button-primary" href={resumeTarget.href}>Continue <span aria-hidden="true">→</span></Link>
        </div>
      ) : null}

      <div className="lesson-grid">
        {lessons.map((lesson) => <LessonCard key={lesson.slug} lesson={{ ...lesson, status: statusFor(lesson) }} />)}
      </div>
    </>
  );
}
