"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookMarked, Database, House, LayoutTemplate, ListChecks, RotateCcw, ScrollText, Search, Star, Swords } from "lucide-react";
import { TextSizeControl } from "./TextSize";
import { toBn } from "@/lib/levels";
import { computeXP, earnedBadges, useProgress } from "@/lib/progress";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Hint } from "./ui/hint";
import { LevelList } from "./Sidebar";
import { useSearch } from "./SearchDialog";

export const NAV = [
  { href: "/", label: "ম্যাপ", icon: House },
  { href: "/cheatsheet", label: "চিট শিট", icon: ScrollText },
  { href: "/revision", label: "রিভিশন", icon: RotateCcw },
  { href: "/glossary", label: "শব্দকোষ", icon: BookMarked },
  { href: "/templates", label: "টেমপ্লেট", icon: LayoutTemplate },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const current = pathname.startsWith("/level/") ? pathname.split("/")[2] : undefined;
  const [open, setOpen] = useState(false);
  const { progress } = useProgress();
  const { open: openSearch } = useSearch();
  const xp = computeXP(progress);
  const badges = earnedBadges(progress).length;

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <Hint label="সব লেভেলের তালিকা">
            <SheetTrigger
              className="brut-sm press press-sm flex h-11 items-center gap-2 bg-green px-3 font-h3"
              aria-label="সূচি খোলো"
            >
              <ListChecks className="size-5" strokeWidth={2.4} aria-hidden />
              <span className="hidden sm:inline">সূচি</span>
            </SheetTrigger>
          </Hint>
          <SheetContent title="সূচি" description="সব জোন আর লেভেলের তালিকা">
            <div data-scroll-box className="h-full">
              <nav aria-label="দ্রুত যাও" className="mb-5 grid grid-cols-2 gap-2">
                {NAV.slice(1).map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="brut-sm press press-sm flex items-center gap-2 bg-card px-3 py-2 font-h3 text-sm"
                  >
                    <Icon className="size-4" strokeWidth={2.4} aria-hidden />
                    {label}
                  </Link>
                ))}
                <Link
                  href="/level/level-4-5"
                  onClick={() => setOpen(false)}
                  className="brut-sm press press-sm flex items-center gap-2 bg-orange-soft px-3 py-2 font-h3 text-sm"
                >
                  <Swords className="size-4" strokeWidth={2.4} aria-hidden />
                  অ্যারেনা
                </Link>
              </nav>
              <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
                <span className="font-h3 text-sm">লেখার আকার</span>
                <TextSizeControl />
              </div>
              <LevelList current={current} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="ml-1 flex shrink-0 items-center gap-2" aria-label="MySQL বই, প্রথম পাতা">
          <span className="brut-sm grid size-10 -rotate-6 place-items-center bg-yellow">
            <Database className="size-5" strokeWidth={2.4} aria-hidden />
          </span>
          <span className="hidden font-h1 text-2xl min-[480px]:inline">MySQL বই</span>
        </Link>

        <nav aria-label="প্রধান" className="ml-2 hidden items-center gap-0.5 xl:flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="flex items-center gap-1.5 rounded-lg border-2 border-transparent px-2.5 py-1.5 font-h3 hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-blue-soft"
            >
              <Icon className="size-4" strokeWidth={2.4} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <TextSizeControl className="hidden sm:flex" />
          <Hint label={<>পুরো বইয়ে খোঁজো · <span className="font-code">Ctrl K</span> বা <span className="font-code">/</span></>}>
            <button
              type="button"
              onClick={openSearch}
              aria-label="খোঁজো"
              aria-keyshortcuts="Control+K Meta+K /"
              className="brut-sm press press-sm flex h-11 items-center gap-2 bg-card px-3 font-h3"
            >
              <Search className="size-5" strokeWidth={2.4} aria-hidden />
              <span className="hidden text-ink/70 2xl:inline">খোঁজো</span>
              <kbd className="kbd hidden !h-6 !min-w-0 whitespace-nowrap !text-[0.7rem] md:inline-grid">Ctrl K</kbd>
            </button>
          </Hint>

          <Hint label={`${badges > 0 ? `${toBn(badges)}টা ব্যাজ জিতেছ · ` : ""}ব্যাজ আর অগ্রগতি দেখো`}>
            <Link
              href="/#badges"
              className="brut-sm press press-sm flex h-11 items-center gap-1.5 whitespace-nowrap bg-pink px-3 font-h3 text-base"
              aria-label={`তোমার XP ${toBn(xp)}, ব্যাজ ${toBn(badges)}টা`}
            >
              <Star className="size-4 fill-yellow" strokeWidth={2.4} aria-hidden />
              {toBn(xp)} XP
            </Link>
          </Hint>
        </div>
      </div>
    </header>
  );
}
