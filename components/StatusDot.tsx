"use client";

import { isUnlocked, useProgress } from "@/lib/progress";

export type Status = "done" | "open" | "locked";

export function useStatus(slug: string): Status {
  const { progress } = useProgress();
  if (progress.completed[slug]) return "done";
  return isUnlocked(progress, slug) ? "open" : "locked";
}
