"use client";

import { useGuidedTour } from "@/hooks/use-guided-tour";
import { useEffect, useRef, type RefObject } from "react";

function GuideChoice({ onStart, onExplore, returnFocus }: {
  onStart: () => void;
  onExplore: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const replayButton = returnFocus.current;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      dialog.close();
      replayButton?.focus();
    };
  }, [returnFocus]);

  return (
    <dialog
      ref={dialogRef}
      className="guide-choice-backdrop"
      aria-labelledby="guide-choice-title"
      aria-describedby="guide-choice-description"
      onCancel={(event) => { event.preventDefault(); onExplore(); }}
    >
      <section className="guide-choice">
        <span className="kicker">Choose your learning mode</span>
        <h2 id="guide-choice-title">Want a guided first look?</h2>
        <p id="guide-choice-description">Take a short tour of the authentication system, or begin experimenting immediately. You can replay the guide at any time.</p>
        <div>
          <button className="button button-primary" type="button" onClick={onStart}>Guide me</button>
          <button className="button button-quiet" type="button" onClick={onExplore}>Explore myself</button>
        </div>
      </section>
    </dialog>
  );
}

export function GuidedTour() {
  const replayRef = useRef<HTMLButtonElement>(null);
  const {
    showChoice,
    guideError,
    startGuide,
    exploreWithoutGuide,
    dismissGuideError,
  } = useGuidedTour();

  return (
    <>
      <button ref={replayRef} className="guide-replay" type="button" onClick={startGuide} aria-label="Replay guided walkthrough">
        <span aria-hidden="true">?</span> Replay guide
      </button>

      {guideError ? (
        <div className="guide-error" role="alert">
          <span>{guideError}</span>
          <button type="button" onClick={dismissGuideError}>Dismiss</button>
        </div>
      ) : null}

      {showChoice ? (
        <GuideChoice onStart={startGuide} onExplore={exploreWithoutGuide} returnFocus={replayRef} />
      ) : null}
    </>
  );
}
