import type { Metadata } from "next";
import Link from "next/link";
import { Keyboard, Zap } from "lucide-react";
import { cheatsheet, englishShortcuts, englishTricks, siteShortcuts, tricks } from "@/lib/cheatsheet";
import { PageHeader } from "@/components/PageHeader";
import { CheatSheet, Snippet } from "@/components/CheatSheet";
import { Inline } from "@/components/Summary";
import { ReadingText } from "@/components/ReadingLanguage";

export const metadata: Metadata = {
  title: "চিট শিট",
  description: "পুরো বইয়ের SQL এক পাতায়: DDL থেকে Window Function আর CTE, কপি করার বোতাম আর খোঁজার সুবিধাসহ।",
};

export default function CheatSheetPage() {
  const total = cheatsheet.reduce((n, c) => n + c.items.length, 0);
  return (
    <main className="mx-auto max-w-[88rem] px-4 py-12">
      <PageHeader
        tag={<ReadingText bn="চিট শিট" en="Cheat Sheet" />}
        title={<ReadingText bn="এক পাতায় পুরো SQL" en="SQL at a glance" />}
        lead={<ReadingText bn={`${total.toLocaleString("bn-BD")}টা কার্ড, ${cheatsheet.length.toLocaleString("bn-BD")}টা বিভাগে। প্রতিটা উদাহরণ বইয়ের school Database-এ চালিয়ে যাচাই করা; পাশের লেভেল-বোতামে বিস্তারিত ব্যাখ্যা।`} en={`${total} examples in ${cheatsheet.length} categories. Copy a query or open its chapter for a walkthrough.`} />}
      />

      <div className="mt-8">
        <CheatSheet />
      </div>

      <section aria-labelledby="tricks" className="mt-16">
        <h2 id="tricks" className="flex items-center gap-2 font-h2 text-3xl">
          <Zap className="size-7" strokeWidth={2.4} aria-hidden />
          <ReadingText bn="শর্টকাট আর কৌশল" en="MySQL tips and shortcuts" />
        </h2>
        <p className="mt-2 max-w-3xl"><ReadingText bn="ছোট ছোট জিনিস, যা জানলে কাজ দ্রুত হয় আর ভুল কমে।" en="Use these commands to preview changes, inspect warnings, and read wide results." /></p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {tricks.map((t, index) => (
            <article key={t.title} className="brut-sm min-w-0 bg-card p-4">
              <h3 className="font-h3 text-lg"><ReadingText bn={t.title} en={englishTricks[index].title} /></h3>
              <p className="mt-1.5 leading-relaxed">
                <ReadingText bn={<Inline text={t.text} />} en={<Inline text={englishTricks[index].text} />} />
              </p>
              {t.code && (
                <div className="mt-3">
                  <ReadingText bn={<Snippet code={t.code} />} en={<Snippet code={englishTricks[index].code ?? t.code} />} />
                </div>
              )}
              <Link href={`/level/${t.level}`} className="mt-2 inline-block text-sm underline decoration-2 underline-offset-4 hover:bg-yellow-soft">
                <ReadingText bn="বিস্তারিত →" en="Read more →" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="keys" className="mt-16">
        <h2 id="keys" className="flex items-center gap-2 font-h2 text-3xl">
          <Keyboard className="size-7" strokeWidth={2.4} aria-hidden />
          <ReadingText bn="এই সাইটের কিবোর্ড শর্টকাট" en="Keyboard shortcuts" />
        </h2>
        <ul className="brut mt-6 divide-y-2 divide-dashed divide-ink/30 bg-card px-5 py-2">
          {siteShortcuts.map((s, index) => (
            <li key={s.text} className="flex flex-wrap items-center justify-between gap-2 py-3 sm:gap-4">
              <span><ReadingText bn={s.text} en={englishShortcuts[index].text} /></span>
              <span className="flex shrink-0 gap-1.5">
                {s.keys.map((k) => (
                  <kbd key={k} className="kbd">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
