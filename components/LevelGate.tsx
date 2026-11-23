"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { getNeighbours } from "@/lib/levels";
import { useStatus } from "./StatusDot";

/** লক করা লেভেলে নোটিশ দেখায়; পড়া বন্ধ করে না, শেখা কখনো আটকানো উচিত না */
export function LevelGate({ slug }: { slug: string }) {
  const status = useStatus(slug);
  if (status !== "locked") return null;
  const { prev } = getNeighbours(slug);
  return (
    <div className="brut-sm flex gap-3 bg-orange-soft p-4 text-base">
      <Lock className="mt-1 size-5 shrink-0" strokeWidth={2.4} aria-hidden />
      <p>
        <span className="font-h3">এই লেভেলটা এখনো লক।</span> আগের লেভেলের চেকপয়েন্ট পাশ করলে খুলবে। পড়তে বাধা নেই, তবে এই লেভেল আগেরটার ওপর
        দাঁড়িয়ে আছে, তাই আগে{" "}
        {prev && (
          <Link href={`/level/${prev.slug}`} className="underline decoration-blue decoration-[3px] underline-offset-4">
            {prev.title}
          </Link>
        )}{" "}
        শেষ করে আসা ভালো।
      </p>
    </div>
  );
}
