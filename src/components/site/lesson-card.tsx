import Link from "next/link";
import type { LessonSummary } from "@/types/lesson";

type LessonCardProps = {
  lesson: LessonSummary;
};

export function LessonCard({ lesson }: LessonCardProps) {
  const action = lesson.status === "completed" ? "Explore again" : lesson.status === "in-progress" ? "Continue lesson" : "Start lesson";

  return (
    <Link className={`lesson-card accent-${lesson.accent}`} href={`/learn/${lesson.slug}`} aria-label={`${action}: ${lesson.title}`}>
      <div className="lesson-card-topline">
        <span className="lesson-index">LESSON {String(lesson.index).padStart(2, "0")}</span>
        <span className={`lesson-status lesson-status-${lesson.status}`}>
          {lesson.status === "completed" ? "✓ Explored" : lesson.status === "in-progress" ? "In progress" : "Ready to explore"}
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
        <span>{action}</span>
        <span className="round-arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
