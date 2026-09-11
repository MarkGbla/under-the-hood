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
  enabled: boolean;
  store?: SimulationStoreApi;
  onExit: () => void;
  onFailure?: () => void;
};

/** Space play/pause, arrows step, R restart, F failure, Escape exit. */
export function usePresentationShortcuts({ enabled, store, onExit, onFailure }: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handle(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      // Never hijack keys while an instructor is typing.
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;

      const state = store?.getState();
      switch (event.key) {
        case " ":
          event.preventDefault();
          if (!state) return;
          if (state.status === "playing") state.pause(); else state.play();
          return;
        case "ArrowRight":
          event.preventDefault();
          state?.next();
          return;
        case "ArrowLeft":
          event.preventDefault();
          state?.previous();
          return;
        case "r":
        case "R":
          event.preventDefault();
          state?.restart();
          return;
        case "f":
        case "F":
          event.preventDefault();
          onFailure?.();
          return;
        case "Escape":
          event.preventDefault();
          onExit();
          return;
        default:
      }
    }

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [enabled, store, onExit, onFailure]);
}
