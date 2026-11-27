"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useEnglish } from "./ReadingLanguage";

export function CopyButton({ text }: { text: string }) {
  const english = useEnglish();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // http বা পুরোনো ব্রাউজারে clipboard না-ও থাকতে পারে
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={english ? "Copy code" : "কোড কপি করো"}
      className="flex min-h-9 items-center gap-1.5 rounded-md border-2 border-ink bg-card px-2.5 font-h3 text-xs transition-transform active:translate-y-0.5"
    >
      {copied ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <Copy className="size-3.5" strokeWidth={2.4} aria-hidden />}
      {english ? (copied ? "Copied" : "Copy") : (copied ? "কপি হয়েছে" : "কপি")}
    </button>
  );
}
