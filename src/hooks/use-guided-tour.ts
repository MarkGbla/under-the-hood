"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Driver } from "driver.js";
import { getTourStatus, saveTourStatus } from "@/lib/storage";

const TOUR_ID = "login";
const subscribeToTourStatus = () => () => undefined;

export function useGuidedTour() {
  const isFirstVisit = useSyncExternalStore(
    subscribeToTourStatus,
    () => getTourStatus(TOUR_ID) === null,
    () => false,
  );
  const [choiceDismissed, setChoiceDismissed] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const guideRef = useRef<Driver | null>(null);
  const pendingRef = useRef(false);
  const generationRef = useRef(0);
  const showChoice = isFirstVisit && !choiceDismissed;

  useEffect(() => () => {
    generationRef.current += 1;
    pendingRef.current = false;
    guideRef.current?.destroy();
    guideRef.current = null;
  }, []);

  const exploreWithoutGuide = useCallback(() => {
    saveTourStatus(TOUR_ID, "skipped");
    setChoiceDismissed(true);
  }, []);

  const startGuide = useCallback(async () => {
    if (pendingRef.current || guideRef.current?.isActive()) return;
    pendingRef.current = true;
    const generation = generationRef.current;
    setChoiceDismissed(true);
    setGuideError(null);

    try {
      const { driver } = await import("driver.js");
      // A learner can navigate away while the optional tour bundle is loading.
      if (generation !== generationRef.current) return;
      const previousFocus = document.activeElement;
      let outcomeRecorded = false;
      const recordOutcome = (status: "completed" | "skipped") => {
        if (outcomeRecorded) return;
        outcomeRecorded = true;
        saveTourStatus(TOUR_ID, status);
      };

      const guide = driver({
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        allowClose: true,
        allowKeyboardControl: true,
        showProgress: true,
        progressText: "{{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Explore the lab",
        overlayColor: "#102d2e",
        overlayOpacity: 0.72,
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "uth-tour-popover",
        onCloseClick: () => {
          recordOutcome("skipped");
          guide.destroy();
        },
        onDoneClick: () => {
          recordOutcome("completed");
          guide.destroy();
        },
        onDestroyed: () => {
          recordOutcome("skipped");
          guideRef.current = null;
          if (generation === generationRef.current && previousFocus instanceof HTMLElement && previousFocus.isConnected) {
            previousFocus.focus();
          }
        },
        steps: [
          { element: "[data-tour='browser']", popover: { title: "Start in the browser", description: "A login begins in the interface the learner can see and control." } },
          { element: "[data-tour='login-action']", popover: { title: "Send simulated credentials", description: "Use the visible demo password for success, or change it to see a safe 401 failure." } },
          { element: "[data-tour='packet']", popover: { title: "Follow the request", description: "This packet carries an HTTP method, route, headers, and body through the system." } },
          { element: "[data-tour='middleware']", popover: { title: "Pass through middleware", description: "Middleware logs and validates the request before application logic runs." } },
          { element: "[data-tour='database']", popover: { title: "Find the user", description: "The authentication service queries the database before comparing passwords." } },
          { element: "[data-tour='event']", popover: { title: "Read the current event", description: "Every state change explains what happened and why it matters." } },
          { element: "[data-tour='controls']", popover: { title: "Control the explanation", description: "Pause, step backward or forward, restart, and change playback speed at any time." } },
          { element: "[data-tour='inspector']", popover: { title: "Inspect technical details", description: "When a stage is inspectable, open its request or response without leaving the lesson." } },
        ],
      });

      guideRef.current = guide;
      guide.drive();
    } catch {
      guideRef.current?.destroy();
      guideRef.current = null;
      if (generation === generationRef.current) {
        setGuideError("The walkthrough could not load. The simulator is still fully available below.");
      }
    } finally {
      if (generation === generationRef.current) pendingRef.current = false;
    }
  }, []);

  return {
    showChoice,
    guideError,
    startGuide,
    exploreWithoutGuide,
    dismissGuideError: () => setGuideError(null),
  };
}
