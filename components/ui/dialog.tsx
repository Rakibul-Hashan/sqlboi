"use client";

// shadcn/ui-ধাঁচের Dialog, Radix-এর ওপর। ফোকাস আটকানো, Esc দিয়ে বন্ধ, স্ক্রল লক: সব Radix দেয়।
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { useEnglish } from "../ReadingLanguage";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;

export function DialogContent({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const english = useEnglish();
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink/45 data-[state=closed]:animate-[fade-out_.15s_ease-in] data-[state=open]:animate-[fade-in_.2s_ease-out]" />
      <D.Content lang={english ? "en" : "bn"}
        className={`brut fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-1.5rem)] w-[min(30rem,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col bg-paper p-3 text-center shadow-[8px_8px_0_var(--color-ink)] outline-none sm:p-5 data-[state=closed]:animate-[pop-out_.15s_ease-in] data-[state=open]:animate-[pop-in_.3s_cubic-bezier(.2,.9,.3,1.25)] ${className}`}
      >
        <D.Close
          aria-label={label ?? (english ? "Close" : "বন্ধ করো")}
          className="brut-sm press press-sm grid size-11 shrink-0 place-items-center self-end bg-card"
        >
          <X className="size-5" strokeWidth={2.6} aria-hidden />
        </D.Close>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-2 [overflow-wrap:anywhere] sm:px-3">
          {children}
        </div>
      </D.Content>
    </D.Portal>
  );
}
