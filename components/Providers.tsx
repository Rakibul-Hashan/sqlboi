"use client";

import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { Tooltip } from "radix-ui";
import { SearchProvider } from "./SearchDialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ইউজার সিস্টেমে "Reduce motion" চালু রাখলে Motion-এর অ্যানিমেশন বন্ধ থাকবে
    <MotionConfig reducedMotion="user">
      <Tooltip.Provider delayDuration={200}>
        <SearchProvider>{children}</SearchProvider>
      </Tooltip.Provider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "brut flex items-center gap-3 bg-yellow px-4 py-3 font-h3 text-ink w-[min(22rem,90vw)]",
            title: "text-base",
            description: "font-body text-sm",
          },
        }}
      />
    </MotionConfig>
  );
}
