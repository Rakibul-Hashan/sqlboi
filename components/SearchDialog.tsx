"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as D } from "radix-ui";
import { Command } from "cmdk";
import MiniSearch, { type SearchResult } from "minisearch";
import { BookMarked, BookOpen, FileText, Hash, Loader2, ScrollText, Search, Sparkles } from "lucide-react";
import type { DocType, SearchDoc } from "@/lib/search-docs";

const TYPE_META: Record<DocType, { label: string; icon: typeof Search; bg: string }> = {
  page: { label: "পাতা", icon: FileText, bg: "bg-yellow-soft" },
  level: { label: "লেভেল", icon: BookOpen, bg: "bg-blue-soft" },
  section: { label: "অংশ", icon: Hash, bg: "bg-card" },
  summary: { label: "সারাংশ", icon: Sparkles, bg: "bg-green-soft" },
  term: { label: "শব্দ", icon: BookMarked, bg: "bg-purple-soft" },
  cheat: { label: "চিট শিট", icon: ScrollText, bg: "bg-orange-soft" },
};

const QUICK: { title: string; href: string }[] = [
  { title: "চিট শিট", href: "/cheatsheet" },
  { title: "রিভিশন", href: "/revision" },
  { title: "শব্দকোষ", href: "/glossary" },
  { title: "প্র্যাকটিস অ্যারেনা", href: "/level/level-4-5" },
  { title: "প্রশ্ন ভাঙার কৌশল", href: "/level/level-5-1" },
  { title: "প্রশ্ন ভাঙার টেমপ্লেট", href: "/templates" },
];

interface Ctx {
  open: () => void;
}
const SearchContext = createContext<Ctx>({ open: () => {} });
export const useSearch = () => useContext(SearchContext);

/** লেখার জায়গায় থাকলে শর্টকাট কাজ করবে না */
export function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}

type Hit = SearchResult & SearchDoc;

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchDialog open={isOpen} onOpenChange={setOpen} />
    </SearchContext.Provider>
  );
}

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const engine = useRef<MiniSearch<SearchDoc> | null>(null);

  // সূচি প্রথমবার খোলার সময় একবারই নামে
  useEffect(() => {
    if (!open || state !== "idle") return;
    setState("loading");
    fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<SearchDoc[]>;
      })
      .then((docs) => {
        const ms = new MiniSearch<SearchDoc>({
          fields: ["title", "text", "where"],
          storeFields: ["type", "title", "where", "href", "text"],
          searchOptions: { boost: { title: 3, where: 1.2 }, prefix: true, fuzzy: 0.2, combineWith: "AND" },
        });
        ms.addAll(docs);
        engine.current = ms;
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [open, state]);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim();
    if (!term || state !== "ready" || !engine.current) return [];
    let res = engine.current.search(term) as Hit[];
    // AND-এ কিছু না পেলে OR দিয়ে আবার
    if (res.length === 0) res = engine.current.search(term, { combineWith: "OR" }) as Hit[];
    return res.slice(0, 30);
  }, [q, state]);

  function go(href: string) {
    onOpenChange(false);
    setQ("");
    router.push(href);
  }

  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-ink/45 data-[state=closed]:animate-[fade-out_.15s_ease-in] data-[state=open]:animate-[fade-in_.2s_ease-out]" />
        <D.Content
          aria-describedby={undefined}
          className="brut fixed left-1/2 top-[8vh] z-50 flex max-h-[80dvh] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col overflow-hidden bg-paper shadow-[10px_10px_0_var(--color-ink)] outline-none data-[state=open]:animate-[fade-in_.15s_ease-out]"
        >
          <D.Title className="sr-only">পুরো বইয়ে খোঁজো</D.Title>
          <Command shouldFilter={false} label="পুরো বইয়ে খোঁজো" className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 border-b-[3px] border-ink px-4">
              <Search className="size-5 shrink-0" strokeWidth={2.5} aria-hidden />
              <Command.Input
                value={q}
                onValueChange={setQ}
                placeholder="খোঁজো: JOIN, Window, নরমালাইজেশন..."
                className="h-14 w-full bg-transparent font-body text-lg outline-none placeholder:text-ink/50"
              />
              <kbd className="kbd hidden sm:inline-grid">Esc</kbd>
            </div>
            <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {state === "loading" && (
                <Command.Loading>
                  <div className="flex items-center gap-2 px-3 py-6 text-ink/70">
                    <Loader2 className="size-4 animate-spin" aria-hidden /> সূচি আনছি...
                  </div>
                </Command.Loading>
              )}
              {state === "error" && <p className="px-3 py-6">সূচি আনা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।</p>}

              {!q.trim() && state !== "error" && (
                <Command.Group heading="দ্রুত যাও" className="search-group">
                  {QUICK.map((x) => (
                    <Command.Item key={x.href} value={x.href} onSelect={() => go(x.href)} className="search-item">
                      <FileText className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                      {x.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {q.trim() && state === "ready" && (
                <Command.Empty className="px-3 py-8 text-center">
                  &ldquo;{q}&rdquo; পাওয়া যায়নি। অন্য বানানে, বা ইংরেজি শব্দে (যেমন JOIN) খোঁজো।
                </Command.Empty>
              )}

              {hits.map((h) => {
                const meta = TYPE_META[h.type];
                const Icon = meta.icon;
                return (
                  <Command.Item key={h.id} value={h.id} onSelect={() => go(h.href)} className="search-item items-start">
                    <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border-2 border-ink ${meta.bg}`}>
                      <Icon className="size-4" strokeWidth={2.4} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-h3">{h.title}</span>
                      <span className="block truncate text-sm text-ink/70">
                        <span className="sr-only">{meta.label}: </span>
                        {h.type === "section" || h.type === "summary" ? `${meta.label} · ${h.where}` : h.where}
                      </span>
                      {h.text && <span className="mt-0.5 line-clamp-1 text-sm">{h.text}</span>}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.List>
            <div className="hidden items-center gap-3 border-t-2 border-dashed border-ink/40 px-4 py-2 text-xs text-ink/70 sm:flex">
              <span className="flex items-center gap-1"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> বাছাই</span>
              <span className="flex items-center gap-1"><kbd className="kbd">Enter</kbd> খোলো</span>
              <span className="ml-auto flex items-center gap-1"><kbd className="kbd">Ctrl</kbd><kbd className="kbd">K</kbd> যেকোনো পাতা থেকে</span>
            </div>
          </Command>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
