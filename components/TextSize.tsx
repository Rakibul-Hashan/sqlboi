"use client";

import { useEffect, useState } from "react";
import { Hint } from "./ui/hint";

/** লেখার আকার: ৪টা ধাপ, পছন্দ localStorage-এ থাকে। layout.tsx-এর ছোট স্ক্রিপ্ট পাতা আঁকার আগেই এটা বসায়, তাই ঝাঁকুনি নেই। */
export const TEXT_SIZES = ["sm", "md", "lg", "xl"] as const;
type Size = (typeof TEXT_SIZES)[number];
export const TEXT_SIZE_KEY = "boi-text-size";

/** <head>-এ চলে, React-এর আগে */
export const TEXT_SIZE_SCRIPT = `try{var s=localStorage.getItem("${TEXT_SIZE_KEY}");if(s&&s!=="md"&&/^(sm|lg|xl)$/.test(s))document.documentElement.dataset.text=s}catch(e){}`;

function read(): Size {
  if (typeof document === "undefined") return "md";
  const v = document.documentElement.dataset.text;
  return (TEXT_SIZES as readonly string[]).includes(v ?? "") ? (v as Size) : "md";
}

function apply(size: Size) {
  const el = document.documentElement;
  if (size === "md") delete el.dataset.text;
  else el.dataset.text = size;
  try {
    localStorage.setItem(TEXT_SIZE_KEY, size);
  } catch {
    /* প্রাইভেট মোডে localStorage না থাকলেও চলবে, শুধু মনে রাখবে না */
  }
}

export function TextSizeControl({ className = "" }: { className?: string }) {
  const [size, setSize] = useState<Size>("md");
  useEffect(() => setSize(read()), []);
  const i = TEXT_SIZES.indexOf(size);

  function step(d: -1 | 1) {
    const next = TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, Math.max(0, i + d))];
    setSize(next);
    apply(next);
  }

  const btn =
    "grid h-full min-w-10 place-items-center px-2 font-h3 hover:bg-yellow-soft disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <Hint label="লেখার আকার">
      <div role="group" aria-label="লেখার আকার" className={`brut-sm flex h-11 items-stretch overflow-hidden bg-card ${className}`}>
        <button type="button" className={`${btn} text-sm`} onClick={() => step(-1)} disabled={i === 0} aria-label="লেখা ছোট করো">
          অ−
        </button>
        <span className="w-0.5 bg-ink" aria-hidden />
        <button type="button" className={`${btn} text-lg`} onClick={() => step(1)} disabled={i === TEXT_SIZES.length - 1} aria-label="লেখা বড় করো">
          অ+
        </button>
      </div>
    </Hint>
  );
}
