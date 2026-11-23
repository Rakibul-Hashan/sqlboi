"use client";

import { Tooltip } from "radix-ui";

/** ছোট টুলটিপ। Provider আছে components/Providers.tsx-এ। */
export function Hint({ label, children, side = "bottom" }: { label: React.ReactNode; children: React.ReactElement; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={side}
          sideOffset={8}
          className="brut-sm z-[60] max-w-64 bg-ink px-2.5 py-1.5 font-body text-sm text-paper data-[state=delayed-open]:animate-[fade-in_.12s_ease-out]"
        >
          {label}
          <Tooltip.Arrow className="fill-ink" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
