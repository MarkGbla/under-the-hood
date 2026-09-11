"use client";

import { useSyncExternalStore } from "react";
import { createEmptyProgress, getProgress, getProgressSnapshot, subscribeToProgress } from "@/lib/storage";

export function useProgress() {
  // "server" is returned during SSR and hydration, so the first client render
  // matches the server HTML before React re-renders with real stored progress.
  const snapshot = useSyncExternalStore(subscribeToProgress, getProgressSnapshot, () => "server");
  return snapshot === "server" ? createEmptyProgress() : getProgress();
}
