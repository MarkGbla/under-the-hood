import type { Metadata } from "next";
import { LessonProgressGrid } from "@/components/site/lesson-progress-grid";
import { lessons } from "@/content/lessons";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <div className="page-surface">
      <section className="explore-hero">
        <div className="site-shell explore-heading">
          <div>
            <h1>Open up the system.</h1>
          </div>
        </div>
      </section>
      <section className="site-shell explore-content">
        <div className="path-marker"><span>Start here</span><i /></div>
        <LessonProgressGrid lessons={lessons} />
      </section>
    </div>
  );
}
