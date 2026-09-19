import type { Metadata } from "next";
import { LessonProgressGrid } from "@/components/site/lesson-progress-grid";
import { lessons } from "@/content/lessons";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  const lessonSummaries = lessons.map(({ id, slug, index, title, shortTitle, description, question, concepts, accent, status }) => ({
    id, slug, index, title, shortTitle, description, question, concepts, accent, status,
  }));

  return (
    <div className="page-surface explore-page">
      <section className="explore-hero">
        <div className="site-shell explore-heading">
          <div>
            <p className="eyebrow"><span aria-hidden="true">↗</span> Learn by exploring</p>
            <h1>Open up the system.</h1>
            <p className="explore-intro">See what happens behind every click. Run a simulation, inspect the moving parts, and find out what happens when things break.</p>
            <div className="explore-facts"><span>6 interactive lessons</span><span>Go at your own pace</span><span>No signup needed</span></div>
          </div>
        </div>
      </section>
      <section className="site-shell explore-content">
        <LessonProgressGrid lessons={lessonSummaries} />
      </section>
    </div>
  );
}
