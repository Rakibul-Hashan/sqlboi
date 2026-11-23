"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, BookMarked } from "lucide-react";
import { Popover, Tooltip } from "radix-ui";
import glossary from "@/lib/glossary.json";
import { getLevel, getZone } from "@/lib/levels";

type Entry = { id: string; term: string; def: string; level: string; aliases?: string[] };
const byId = new Map((glossary as Entry[]).map((g) => [g.id, g]));

function levelName(slug: string) {
  const l = getLevel(slug);
  if (!l) return "";
  return l.kind === "level" ? `লেভেল ${l.label}: ${l.title}` : `${l.label}: ${l.title}`;
}

/** শব্দকোষের শব্দ: মাউসে hover, ফোনে ট্যাপ, কিবোর্ডে Enter দিলে ছোট সংজ্ঞা দেখায় */
export function Term({ id, children }: { id: string; children: React.ReactNode }) {
  const entry = byId.get(id);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const byHover = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!entry) return <>{children}</>;
  const here = pathname === `/level/${entry.level}`;

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      byHover.current = true;
      setOpen(true);
    }, 180);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        byHover.current = false;
        setOpen(o);
      }}
    >
      <Popover.Trigger
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
        className="cursor-help border-b-[2.5px] border-dotted border-blue px-0 text-inherit [font:inherit] hover:bg-blue-soft"
        aria-label={`${entry.term}: সংজ্ঞা দেখো`}
      >
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={8}
          collisionPadding={12}
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          onOpenAutoFocus={(e) => {
            if (byHover.current) e.preventDefault();
          }}
          className="brut-sm z-50 w-[min(20rem,calc(100vw-2rem))] bg-card p-4 text-left font-body text-base leading-relaxed outline-none data-[state=open]:animate-[fade-in_.15s_ease-out]"
        >
          <p className="flex items-center gap-2 font-h3 text-lg">
            <BookMarked className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
            {entry.term}
          </p>
          <p className="mt-1">{entry.def}</p>
          {!here && (
            <Link
              href={`/level/${entry.level}`}
              className="mt-3 inline-flex items-center gap-1.5 font-h3 text-sm underline decoration-blue decoration-[3px] underline-offset-4"
            >
              বিস্তারিত: {levelName(entry.level)}
              <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden />
            </Link>
          )}
          <Link href={`/glossary#${entry.id}`} className="mt-1 block text-sm text-muted underline decoration-2 underline-offset-4">
            পুরো শব্দকোষ
          </Link>
          <Popover.Arrow width={14} height={8} className="fill-ink" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** "লেভেল ১৯"-এর মতো উল্লেখ: লিংক, আর hover করলে লেভেলের নাম */
export function LevelRef({ slug, children }: { slug: string; children: React.ReactNode }) {
  const l = getLevel(slug);
  if (!l) return <>{children}</>;
  return (
    <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Link href={`/level/${slug}`} className="!decoration-green">
            {children}
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            className="brut-sm z-50 max-w-xs bg-yellow px-3 py-1.5 font-h3 text-sm data-[state=delayed-open]:animate-[fade-in_.15s_ease-out]"
          >
            {levelName(slug)} · জোন {getZone(l.zone).number}
            <Tooltip.Arrow width={12} height={7} className="fill-ink" />
          </Tooltip.Content>
        </Tooltip.Portal>
    </Tooltip.Root>
  );
}
