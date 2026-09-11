"use client";

import { useGuidedTour } from "@/hooks/use-guided-tour";

export function GuidedTour() {
  const {
    showChoice,
    guideError,
    startGuide,
    exploreWithoutGuide,
    dismissGuideError,
  } = useGuidedTour();

  return (
    <>
      <button className="guide-replay" type="button" onClick={startGuide} aria-label="Replay guided walkthrough">
        <span aria-hidden="true">?</span> Replay guide
      </button>

      {guideError ? (
        <div className="guide-error" role="alert">
          <span>{guideError}</span>
          <button type="button" onClick={dismissGuideError}>Dismiss</button>
        </div>
      ) : null}

      {showChoice ? (
        <div className="guide-choice-backdrop" role="presentation">
          <section className="guide-choice" role="dialog" aria-modal="true" aria-labelledby="guide-choice-title">
            <span className="kicker">Choose your learning mode</span>
            <h2 id="guide-choice-title">Want a guided first look?</h2>
            <p>Take a short tour of the authentication system, or begin experimenting immediately. You can replay the guide at any time.</p>
            <div>
              <button className="button button-primary" type="button" onClick={startGuide}>Guide me</button>
              <button className="button button-quiet" type="button" onClick={exploreWithoutGuide}>Explore myself</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
