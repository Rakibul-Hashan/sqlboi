"use client";

// Off-canvas প্যানেল (shadcn/ui-এর Sheet-এর মতো): Radix Dialog, পাশ থেকে স্লাইড করে আসে।
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";

export const Sheet = D.Root;
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;

export function SheetContent({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=closed]:animate-[fade-out_.2s_ease-in] data-[state=open]:animate-[fade-in_.2s_ease-out]" />
      <D.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(24rem,88vw)] flex-col border-r-[3px] border-ink bg-paper shadow-[8px_0_0_var(--color-ink)] outline-none data-[state=closed]:animate-[sheet-out_.2s_ease-in] data-[state=open]:animate-[sheet-in_.3s_cubic-bezier(.2,.8,.2,1)]">
        <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink bg-yellow px-5 py-3">
          <D.Title className="font-h2 text-2xl">{title}</D.Title>
          <D.Close aria-label="সূচি বন্ধ করো" className="brut-sm press press-sm grid size-11 place-items-center bg-card">
            <X className="size-5" strokeWidth={2.6} aria-hidden />
          </D.Close>
        </div>
        {description && <D.Description className="sr-only">{description}</D.Description>}
        <div className="flex-1 overflow-y-auto px-4 py-5">{children}</div>
      </D.Content>
    </D.Portal>
  );
}
