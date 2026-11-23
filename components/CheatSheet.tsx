"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { tokenizeSQL } from "@/lib/highlight";
import { getLevel, kindLabel } from "@/lib/levels";
import type { CheatCategory } from "@/lib/cheatsheet";
import { CopyButton } from "./CopyButton";

function levelText(slug: string) {
  const l = getLevel(slug);
  if (!l) return slug;
  return l.kind === "level" ? `লেভেল ${l.label}` : kindLabel(l.kind);
}

export function Snippet({ code, lang = "sql" }: { code: string; lang?: "sql" | "bash" }) {
  return (
    <div className="brut-sm overflow-hidden bg-card">
      <div className={`flex items-center justify-between border-b-[2.5px] border-ink px-3 py-1 ${lang === "sql" ? "bg-blue-soft" : "bg-green-soft"}`}>
        <span className="font-h3 text-xs">{lang === "sql" ? "SQL" : "Terminal"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 font-code text-[0.82rem] leading-relaxed">
        <code>
          {lang === "sql"
            ? tokenizeSQL(code).map((t, i) =>
                t.type === "plain" ? t.value : <span key={i} className={`tok-${t.type}`}>{t.value}</span>
              )
            : code}
        </code>
      </pre>
    </div>
  );
}

/** খুঁজে পেতে: ছোট হাতের, বাড়তি ফাঁকা ছাড়া */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ");

export function CheatSheet({ data }: { data: CheatCategory[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = norm(q.trim());
    return data
      .filter((c) => !cat || c.id === cat)
      .map((c) => ({
        ...c,
        items: needle
          ? c.items.filter((i) => norm(`${i.title} ${i.code} ${i.note ?? ""} ${c.label}`).includes(needle))
          : c.items,
      }))
      .filter((c) => c.items.length > 0);
  }, [data, q, cat]);

  const count = visible.reduce((n, c) => n + c.items.length, 0);

  return (
    <div>
      <div className="sticky top-[67px] z-20 -mx-2 bg-paper/95 px-2 py-3 backdrop-blur-sm">
        <label className="brut-sm flex items-center gap-2 bg-card px-3 py-2 focus-within:shadow-brut">
          <Search className="size-5 shrink-0" strokeWidth={2.4} aria-hidden />
          <span className="sr-only">চিট শিটে খোঁজো</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="খোঁজো: JOIN, RANK, তারিখ, Upsert..."
            className="w-full bg-transparent font-body text-base outline-none placeholder:text-ink/50"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="খোঁজা মুছে ফেলো" className="rounded p-0.5 hover:bg-yellow-soft">
              <X className="size-4" strokeWidth={2.6} />
            </button>
          )}
        </label>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="বিভাগ">
          <button
            type="button"
            onClick={() => setCat(null)}
            aria-pressed={cat === null}
            className={`brut-sm press press-sm px-2.5 py-0.5 font-h3 text-sm ${cat === null ? "bg-yellow" : "bg-card"}`}
          >
            সব
          </button>
          {data.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(cat === c.id ? null : c.id)}
              aria-pressed={cat === c.id}
              className={`brut-sm press press-sm px-2.5 py-0.5 font-h3 text-sm ${cat === c.id ? "bg-yellow" : "bg-card"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink/70" aria-live="polite">
          {count === 0 ? "কিছু পাওয়া যায়নি। অন্য শব্দে খোঁজো, বা বিভাগ বদলাও।" : `${count.toLocaleString("bn-BD")}টা কার্ড`}
        </p>
      </div>

      <div className="mt-4 space-y-10">
        {visible.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`h-${c.id}`} className="scroll-mt-40">
            <h2 id={`h-${c.id}`} className={`brut-sm inline-block -rotate-1 px-3 py-1 font-h2 text-2xl ${c.color}`}>
              {c.label}
            </h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {c.items.map((i) => (
                <article key={i.id} id={`cs-${i.id}`} className="brut scroll-mt-40 bg-card p-4 target:bg-yellow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-h3 text-lg leading-snug">{i.title}</h3>
                    <Link
                      href={`/level/${i.level}`}
                      className="shrink-0 rounded border-2 border-ink bg-paper px-2 py-0.5 font-h3 text-xs hover:bg-yellow"
                    >
                      {levelText(i.level)} →
                    </Link>
                  </div>
                  <div className="mt-3">
                    <Snippet code={i.code} lang={i.lang} />
                  </div>
                  {i.note && <p className="mt-2.5 text-[0.95rem] leading-relaxed">💡 {i.note}</p>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
