"use client";

import Link from "next/link";
import { LessonCard } from "./lesson-card";
import { useProgress } from "@/hooks/use-progress";
import type { LessonStatus, LessonSummary } from "@/types/lesson";

/**
 * Lesson content stays static and server-rendered; only the learner's own
 * status is layered on here, where browser storage is available.
 */
export function LessonProgressGrid({ lessons }: { lessons: LessonSummary[] }) {
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
  const completedCount = lessons.filter((lesson) => progress.lessons[lesson.slug]?.completed).length;
  const nextLesson = lessons.find((lesson) => !progress.lessons[lesson.slug]?.completed);
  const canResume = resumeTarget && !resumeProgress?.completed;
  const capstoneComplete = progress.lessons["login-capstone"]?.completed;
  const suggestion = canResume
    ? { href: resumeTarget.href, title: resumeTarget.title, label: "Pick up where you left off", action: "Continue lesson" }
    : nextLesson
      ? {
          href: `/learn/${nextLesson.slug}`,
          title: nextLesson.title,
          label: completedCount > 0 ? "Your next discovery" : "A good place to start",
          action: completedCount > 0 ? "Start next lesson" : "Start exploring",
        }
      : capstoneComplete
        ? { href: "/playground", title: "Build a system of your own", label: "Keep experimenting", action: "Open playground" }
        : { href: "/simulations/login", title: "Put it together in the login lab", label: "All six lessons explored", action: "Try the login lab" };

  function statusFor(lesson: LessonSummary): LessonStatus {
    const record = progress.lessons[lesson.slug];
    if (record?.completed) return "completed";
    if (record) return "in-progress";
    return "available";
  }

  return (
    <>
      <div className="learning-overview">
        <div className="learning-suggestion">
          <span className="learning-suggestion-icon" aria-hidden="true">↗</span>
          <div className="learning-suggestion-copy">
            <span className="kicker">{suggestion.label}</span>
            <h2>{suggestion.title}</h2>
            <Link className="learning-start-link" href={suggestion.href}>{suggestion.action} <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="learning-progress">
          <div className="learning-progress-label"><span>Your discoveries</span><strong>{completedCount} <span>/ {lessons.length}</span></strong></div>
          <progress value={completedCount} max={lessons.length} aria-label={`${completedCount} of ${lessons.length} lessons explored`} />
          <p>Progress saved in this browser.</p>
        </div>
      </div>

      <section aria-labelledby="lesson-path-title">
        <div className="explore-section-heading">
          <h2 id="lesson-path-title">Explore the fundamentals</h2>
          <p>Follow the order, or jump into what makes you curious.</p>
        </div>
        <div className="lesson-grid">
          {lessons.map((lesson) => <LessonCard key={lesson.slug} lesson={{ ...lesson, status: statusFor(lesson) }} />)}
        </div>
      </section>

      <section className="explore-further" aria-labelledby="explore-further-title">
        <div className="explore-section-heading">
          <h2 id="explore-further-title">Connect the dots</h2>
          <p>Take what you discovered into a complete system.</p>
        </div>
        <div className="explore-further-grid">
          <Link className="explore-extra explore-extra-login" href="/simulations/login">
            <span className="kicker">{capstoneComplete ? "Explore again" : "The complete picture"}</span>
            <h3>What happens when you log in?</h3>
            <p>Follow one login through the browser, server, and database. Try a failure and see where it stops.</p>
            <span className="explore-extra-action">Open the login lab <span aria-hidden="true">↗</span></span>
          </Link>
          <Link className="explore-extra explore-extra-playground" href="/playground">
            <span className="kicker">Your turn to build</span>
            <h3>Make the system your own.</h3>
            <p>Connect the parts, send a request, and experiment with your own software system.</p>
            <span className="explore-extra-action">Open the playground <span aria-hidden="true">↗</span></span>
          </Link>
        </div>
      </section>
    </>
  );
}
