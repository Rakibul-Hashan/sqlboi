"use client";

import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";
import glossary from "@/lib/glossary.json";
import { getLevel } from "@/lib/levels";
import { PageHeader } from "@/components/PageHeader";
import { useEnglish } from "./ReadingLanguage";
import { englishDefinitions, englishTerms } from "@/lib/english-glossary";
import { englishLevelLabel, englishLevels } from "@/lib/english-levels";

type Entry = { id: string; term: string; def: string; level: string; aliases?: string[] };

export function GlossaryPage() {
  const english = useEnglish();
  const entries = (glossary as Entry[]).map((entry) => ({
    ...entry,
    term: english ? englishTerms[entry.id] ?? entry.term : entry.term,
    def: english ? englishDefinitions[entry.id] : entry.def,
  })).sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
  const letters = [...new Set(entries.map((e) => e.term[0].toUpperCase()))];

  return (
    <main lang={english ? "en" : "bn"} className="mx-auto max-w-[72rem] px-4 py-12">
      <PageHeader
        tag={english ? "Glossary" : "শব্দকোষ"}
        title={english ? "SQL and database terms" : "জার্গনের অভিধান"}
        lead={english ? `Plain-English definitions for ${entries.length} terms, with links to the relevant chapters.` :
          `বইয়ে আসা ${entries.length.toLocaleString("bn-BD")}টা জার্গন, সংক্ষেপে। লেখার ভেতরে নীল ডট-দাগের শব্দে hover বা ট্যাপ করলেও এই সংজ্ঞাগুলো দেখা যায়।`}
      />

      <nav aria-label={english ? "Browse by letter" : "অক্ষর অনুযায়ী"} className="mt-8 flex flex-wrap gap-2">
        {letters.map((l) => (
          <a key={l} href={`#letter-${l}`} className="brut-sm press press-sm grid size-10 place-items-center bg-card font-code font-bold">
            {l}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} aria-label={letter} className="scroll-mt-24">
            <p className="brut-sm inline-grid size-12 -rotate-3 place-items-center bg-yellow font-code text-2xl font-bold">{letter}</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {entries
                .filter((e) => e.term[0].toUpperCase() === letter)
                .map((e) => {
                  const l = getLevel(e.level);
                  return (
                    <div key={e.id} id={e.id} className="brut-sm scroll-mt-24 bg-card p-4 target:bg-yellow-soft">
                      <dt className="flex items-center gap-2 font-h3 text-lg">
                        <BookMarked className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                        {e.term}
                      </dt>
                      <dd className="mt-1 text-base leading-relaxed">{e.def}</dd>
                      {l && (
                        <dd className="mt-2">
                          <Link
                            href={`/level/${l.slug}`}
                            className="inline-flex items-center gap-1.5 font-h3 text-sm underline decoration-blue decoration-[3px] underline-offset-4"
                          >
                            {english ? `${l.kind === "level" ? "Level " : ""}${englishLevelLabel(l)}: ${englishLevels[l.slug].title}` :
                              `${l.kind === "level" ? `লেভেল ${l.label}` : l.label}: ${l.title}`}
                            <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden />
                          </Link>
                        </dd>
                      )}
                    </div>
                  );
                })}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
}
