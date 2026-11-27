"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BanglaContent, useEnglish } from "./ReadingLanguage";

export function ChapterReading({ bangla, english }: { bangla: ReactNode; english: ReactNode }) {
  const isEnglish = useEnglish();
  const [showBangla, setShowBangla] = useState(false);
  const englishRef = useRef<HTMLDivElement>(null);
  const banglaId = useId();

  useEffect(() => {
    if (!isEnglish) return;
    let frame = 0;
    function scrollToEnglishSection() {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const translatedId = /^q-\d+$/.test(id) ? `en-${id}` : id;
      const target = document.getElementById(translatedId);
      if (target && englishRef.current?.contains(target)) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => target.scrollIntoView());
      }
    }
    scrollToEnglishSection();
    window.addEventListener("hashchange", scrollToEnglishSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToEnglishSection);
    };
  }, [isEnglish]);

  return (
    <>
      <div ref={englishRef} hidden={!isEnglish} lang="en">
        <article className="prose-boi mt-8">{english}</article>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" aria-expanded={showBangla} aria-controls={banglaId}
            onClick={() => setShowBangla((visible) => !visible)}
            className="brut-sm press press-sm bg-card px-4 py-2 font-h3">
            {showBangla ? "Hide full Bangla lesson" : "Show full Bangla lesson"}
          </button>
          <p className="text-sm text-muted">Open the original walkthrough and exercises in Bangla.</p>
        </div>
      </div>
      <article id={banglaId} lang="bn" hidden={isEnglish && !showBangla} className="prose-boi mt-8">
        <BanglaContent>{bangla}</BanglaContent>
      </article>
    </>
  );
}
