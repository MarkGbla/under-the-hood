"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { SimulationStoreApi } from "@/stores/simulation-store";

const CHANGE_EVENT = "under-the-hood:presentation-changed";

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("popstate", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function readPresentFlag() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("present") === "true";
}

/**
 * Presentation mode is the same route with `?present=true`, so there is never a
 * separate instructor application. Reading it from the URL directly (rather
 * than useSearchParams) keeps this working under `output: "export"` without a
 * Suspense boundary.
 */
export function usePresentationMode() {
  const isPresenting = useSyncExternalStore(subscribe, readPresentFlag, () => false);

  const setPresenting = useCallback((next: boolean) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("present", "true");
    else url.searchParams.delete("present");
    window.history.pushState({}, "", url);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { isPresenting, setPresenting };
}

type ShortcutOptions = {
  /** Escape only means "leave presentation", so it is gated on that. */
  presenting: boolean;
  store?: SimulationStoreApi;
  onExit: () => void;
  onFailure?: () => void;
  onInteraction?: () => void;
};

/**
 * True when a keypress belongs to whatever the learner is typing in, rather
 * than to the simulation.
 */
export function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  if (element.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(element.tagName);
}

/** Space and Enter belong to a focused button or link, not to playback. */
function isActivatableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return element ? ["BUTTON", "A", "SUMMARY"].includes(element.tagName) : false;
}

/**
 * Playback keys for every simulation, in learner mode as well as presentation:
 * Space play/pause, arrows step, R restart, F failure, Escape leaves presenting.
 */
export function useSimulationShortcuts({ presenting, store, onExit, onFailure, onInteraction }: ShortcutOptions) {
  useEffect(() => {
    function handle(event: KeyboardEvent) {
      // Dialogs and the walkthrough own their keys, including arrows and Escape.
      if (event.defaultPrevented || document.querySelector("dialog[open], [role='dialog'][aria-modal='true'], .driver-active")) return;
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const state = store?.getState();
      switch (event.key) {
        case " ":
          // Let Space press whatever button currently has focus.
          if (isActivatableTarget(event.target)) return;
          event.preventDefault();
          if (!state) return;
          if (state.status === "playing") state.pause(); else state.play();
          onInteraction?.();
          return;
        case "ArrowRight":
          event.preventDefault();
          state?.next();
          if (state) onInteraction?.();
          return;
        case "ArrowLeft":
          event.preventDefault();
          state?.previous();
          if (state) onInteraction?.();
          return;
        case "r":
        case "R":
          event.preventDefault();
          state?.restart();
          if (state) onInteraction?.();
          return;
        case "f":
        case "F":
          event.preventDefault();
          onFailure?.();
          if (onFailure) onInteraction?.();
          return;
        case "Escape":
          if (!presenting) return;
          event.preventDefault();
          onExit();
          return;
        default:
      }
    }

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [presenting, store, onExit, onFailure, onInteraction]);
}
