"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTyping } from "./SearchDialog";

/** [ আগের লেভেল, ] পরের লেভেল (লেখার ঘরে থাকলে কাজ করে না) */
export function LevelHotkeys({ prev, next }: { prev?: string; next?: string }) {
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e) || document.querySelector("[role=dialog]")) return;
      if (e.key === "[" && prev) router.push(`/level/${prev}`);
      else if (e.key === "]" && next) router.push(`/level/${next}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);
  return null;
}
