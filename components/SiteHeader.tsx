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
import { LanguageSwitcher, useEnglish } from "./ReadingLanguage";

export const NAV = [
  { href: "/", label: "ম্যাপ", en: "Map", icon: House },
  { href: "/cheatsheet", label: "চিট শিট", en: "Cheat Sheet", icon: ScrollText },
  { href: "/revision", label: "রিভিশন", en: "Revision", icon: RotateCcw },
  { href: "/glossary", label: "শব্দকোষ", en: "Glossary", icon: BookMarked },
  { href: "/templates", label: "টেমপ্লেট", en: "Templates", icon: LayoutTemplate },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const current = pathname.startsWith("/level/") ? pathname.split("/")[2] : undefined;
  const [open, setOpen] = useState(false);
  const { progress } = useProgress();
  const { open: openSearch } = useSearch();
  const english = useEnglish();
  const xp = computeXP(progress);
  const badges = earnedBadges(progress).length;

  return (
    <header lang={english ? "en" : "bn"} className="@container/header sticky top-0 z-40 border-b-[3px] border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-[88rem] items-center gap-1.5 px-2 py-1 sm:gap-3 sm:px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <Hint label={english ? "Browse all chapters" : "সব লেভেলের তালিকা"}>
            <SheetTrigger
              className="brut-sm press press-sm flex h-11 shrink-0 items-center gap-2 bg-green px-2 font-h3 @min-[34rem]/header:px-3"
              aria-label={english ? "Open contents" : "সূচি খোলো"}
            >
              <ListChecks className="size-5" strokeWidth={2.4} aria-hidden />
              <span className="hidden whitespace-nowrap @min-[34rem]/header:inline">{english ? "Contents" : "সূচি"}</span>
            </SheetTrigger>
          </Hint>
          <SheetContent title={english ? "Contents" : "সূচি"} description={english ? "All zones and chapters" : "সব জোন আর লেভেলের তালিকা"}>
            <div>
              <nav aria-label={english ? "Quick links" : "দ্রুত যাও"} className="mb-5 grid grid-cols-2 gap-2 [overflow-wrap:anywhere]">
                {NAV.map(({ href, label, en, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="brut-sm press press-sm flex items-center gap-2 bg-card px-3 py-2 font-h3 text-sm"
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                    {english ? en : label}
                  </Link>
                ))}
                <Link
                  href="/level/level-4-5"
                  onClick={() => setOpen(false)}
                  className="brut-sm press press-sm flex items-center gap-2 bg-orange-soft px-3 py-2 font-h3 text-sm"
                >
                  <Swords className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                  {english ? "Practice Arena" : "অ্যারেনা"}
                </Link>
              </nav>
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="font-h3 text-sm">{english ? "Text size" : "লেখার আকার"}</span>
                <TextSizeControl />
              </div>
              <LevelList current={current} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="hidden shrink-0 items-center gap-2 @min-[20rem]/header:flex sm:ml-1" aria-label={english ? "MySQL Book, home" : "MySQL বই, প্রথম পাতা"}>
          <span className="brut-sm grid size-10 -rotate-6 place-items-center bg-yellow">
            <Database className="size-5" strokeWidth={2.4} aria-hidden />
          </span>
          <span className="hidden whitespace-nowrap font-h1 text-2xl @min-[29rem]/header:inline">{english ? "MySQL Book" : "MySQL বই"}</span>
        </Link>

        <div className="@container/nav min-w-0 flex-1">
          <nav aria-label={english ? "Main navigation" : "প্রধান"} className="hidden items-center gap-0.5 @min-[35rem]/nav:flex">
            {NAV.map(({ href, label, en, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-transparent px-2 py-1.5 font-h3 text-base hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-blue-soft"
              >
                <Icon className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                {english ? en : label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <TextSizeControl className="hidden @min-[44rem]/header:flex" />
          <Hint label={<>{english ? "Search the book" : "পুরো বইয়ে খোঁজো"} · <span className="font-code">Ctrl K</span> {english ? "or" : "বা"} <span className="font-code">/</span></>}>
            <button
              type="button"
              onClick={openSearch}
              aria-label={english ? "Search" : "খোঁজো"}
              aria-keyshortcuts="Control+K Meta+K /"
              className="brut-sm press press-sm flex h-11 items-center gap-2 bg-card px-2 font-h3 @min-[34rem]/header:px-3"
            >
              <Search className="size-5" strokeWidth={2.4} aria-hidden />
              <span className="hidden whitespace-nowrap text-ink/70 @min-[54rem]/header:inline">{english ? "Search" : "খোঁজো"}</span>
              <kbd className="kbd hidden !h-6 !min-w-0 whitespace-nowrap !text-[0.7rem] @min-[68rem]/header:inline-grid">Ctrl K</kbd>
            </button>
          </Hint>

          <Hint label={english ? "View badges and progress" : `${badges > 0 ? `${toBn(badges)}টা ব্যাজ জিতেছ · ` : ""}ব্যাজ আর অগ্রগতি দেখো`}>
            <Link
              href="/#badges"
              className="brut-sm press press-sm flex h-11 items-center gap-1.5 whitespace-nowrap bg-pink px-2 font-h3 text-base @min-[34rem]/header:px-3"
              aria-label={english ? `${xp} XP, ${badges} earned badges` : `তোমার XP ${toBn(xp)}, ব্যাজ ${toBn(badges)}টা`}
            >
              <Star className="size-4 fill-yellow" strokeWidth={2.4} aria-hidden />
              <span className="hidden @min-[23rem]/header:inline">{english ? xp : toBn(xp)} XP</span>
            </Link>
          </Hint>
        </div>
      </div>
    </header>
  );
}
