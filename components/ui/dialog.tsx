"use client";

// shadcn/ui-ধাঁচের Dialog, Radix-এর ওপর। ফোকাস আটকানো, Esc দিয়ে বন্ধ, স্ক্রল লক: সব Radix দেয়।
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;

export function DialogContent({
  children,
  className = "",
  label = "বন্ধ করো",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink/45 data-[state=closed]:animate-[fade-out_.15s_ease-in] data-[state=open]:animate-[fade-in_.2s_ease-out]" />
      <D.Content
        className={`brut fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-paper p-7 text-center shadow-[10px_10px_0_var(--color-ink)] outline-none data-[state=closed]:animate-[pop-out_.15s_ease-in] data-[state=open]:animate-[pop-in_.3s_cubic-bezier(.2,.9,.3,1.25)] ${className}`}
      >
        {children}
        <D.Close
          aria-label={label}
          className="brut-sm press press-sm absolute right-3 top-3 grid size-11 place-items-center bg-card"
        >
          <X className="size-5" strokeWidth={2.6} aria-hidden />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}
