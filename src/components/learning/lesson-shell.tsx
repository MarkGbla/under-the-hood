"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LessonLab } from "@/components/labs/lesson-lab";
import { SimulationErrorBoundary } from "@/components/simulation/error-boundary";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { usePresentationMode } from "@/hooks/use-presentation-mode";
import { saveLastVisited } from "@/lib/storage";
import type { Lesson } from "@/types/lesson";

/**
 * A lesson is the lab, framed. Same shape as the login lab: a title, the
 * question it answers, and the simulation. No stages, no stepper, no quiz.
 */
export function LessonShell({ lesson }: { lesson: Lesson }) {
  const { patch } = useLessonProgress(lesson.slug, lesson.id);
  const { isPresenting, setPresenting } = usePresentationMode();

  useEffect(() => {
    saveLastVisited(`/learn/${lesson.slug}`, lesson.id);
  }, [lesson.slug, lesson.id]);

  const lab = (
    <SimulationErrorBoundary>
      <LessonLab lesson={lesson} onInteraction={() => patch({ meaningfulInteraction: true })} />
    </SimulationErrorBoundary>
  );

  if (isPresenting) {
    return (
      <div className="lesson-page page-surface presenting">
        <div className="site-shell lesson-page-shell">
          <div className="present-bar">
            <h1>{lesson.title}</h1>
            <div>
              <span className="present-keys">Space play · ← → step · R restart · F failure · Esc exit</span>
              <button type="button" onClick={() => setPresenting(false)}>Exit presentation</button>
            </div>
          </div>
          {lesson.instructorPrompt ? <p className="instructor-cue" role="note"><strong>Teaching cue:</strong> {lesson.instructorPrompt}</p> : null}
          {lab}
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page page-surface">
      <div className="site-shell lesson-page-shell">
        <div className="lesson-breadcrumb">
          <Link href="/explore">Explore</Link><span>/</span><span>Lesson {lesson.index}</span>
          <button type="button" className="present-toggle" onClick={() => setPresenting(true)}>Presentation mode</button>
        </div>

        <header className="lesson-preview-header">
          <div>
            <span className={`lesson-number accent-${lesson.accent}`}>Lesson {String(lesson.index).padStart(2, "0")}</span>
            <h1>{lesson.title}</h1>
          </div>
          <div className="lesson-preview-meta">
            <strong>{lesson.question}</strong>
          </div>
        </header>

        {lab}

        <div className="lesson-preview-footer">
          <div className="concept-list"><strong>Concepts:</strong>{lesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>
          <Link className="text-link" href="/explore">All lessons <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </div>
  );
}
