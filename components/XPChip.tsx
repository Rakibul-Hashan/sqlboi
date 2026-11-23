"use client";

import { toBn } from "@/lib/levels";
import { computeXP, earnedBadges, useProgress } from "@/lib/progress";

export function XPChip() {
  const { progress } = useProgress();
  const xp = computeXP(progress);
  const badges = earnedBadges(progress);
  return (
    <div className="flex items-center gap-2 font-h3 text-sm" aria-label={`তোমার XP ${toBn(xp)}`}>
      {badges.length > 0 && (
        <span title={badges.map((b) => b.name).join(", ")} aria-label="ব্যাজ">
          {badges.map((b) => b.emoji).join("")}
        </span>
      )}
      <span className="rounded-full border border-line bg-card px-3 py-0.5 text-slate">⭐ {toBn(xp)} XP</span>
    </div>
  );
}
