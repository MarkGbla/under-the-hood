import Link from "next/link";
import type { LessonSummary } from "@/types/lesson";

type LessonCardProps = {
  lesson: LessonSummary;
};

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <Link className={`lesson-card accent-${lesson.accent}`} href={`/learn/${lesson.slug}`}>
      <div className="lesson-card-topline">
        <span className="lesson-index">{String(lesson.index).padStart(2, "0")}</span>
        <span className="lesson-status">
          {lesson.status === "completed" ? "Completed" : lesson.status === "in-progress" ? "Continue" : "Available"}
        </span>
      </div>
      <div>
        <p className="lesson-question">{lesson.question}</p>
        <h3>{lesson.title}</h3>
        <p className="lesson-description">{lesson.description}</p>
      </div>
      <div className="concept-list" aria-label="Concepts covered">
        {lesson.concepts.map((concept) => (
          <span key={concept}>{concept}</span>
        ))}
      </div>
      <div className="lesson-card-action">
        <span>Open lesson</span>
        <span className="round-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
