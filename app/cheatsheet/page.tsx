import type { Metadata } from "next";
import Link from "next/link";
import { Keyboard, Zap } from "lucide-react";
import { cheatsheet, siteShortcuts, tricks } from "@/lib/cheatsheet";
import { PageHeader } from "@/components/PageHeader";
import { CheatSheet, Snippet } from "@/components/CheatSheet";
import { Inline } from "@/components/Summary";

export const metadata: Metadata = {
  title: "চিট শিট",
  description: "পুরো বইয়ের SQL এক পাতায়: DDL থেকে Window Function আর CTE, কপি করার বোতাম আর খোঁজার সুবিধাসহ।",
};

export default function CheatSheetPage() {
  const total = cheatsheet.reduce((n, c) => n + c.items.length, 0);
  return (
    <main className="mx-auto max-w-[88rem] px-4 py-12">
      <PageHeader
        tag="চিট শিট"
        title="এক পাতায় পুরো SQL"
        lead={`${total.toLocaleString("bn-BD")}টা কার্ড, ${cheatsheet.length.toLocaleString("bn-BD")}টা বিভাগে। প্রতিটা উদাহরণ বইয়ের school Database-এ চালিয়ে যাচাই করা; পাশের লেভেল-বোতামে বিস্তারিত ব্যাখ্যা।`}
      />

      <div className="mt-8">
        <CheatSheet data={cheatsheet} />
      </div>

      <section aria-labelledby="tricks" className="mt-16">
        <h2 id="tricks" className="flex items-center gap-2 font-h2 text-3xl">
          <Zap className="size-7" strokeWidth={2.4} aria-hidden />
          শর্টকাট আর কৌশল
        </h2>
        <p className="mt-2 max-w-3xl">ছোট ছোট জিনিস, যা জানলে কাজ দ্রুত হয় আর ভুল কমে।</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {tricks.map((t) => (
            <article key={t.title} className="brut-sm bg-card p-4">
              <h3 className="font-h3 text-lg">{t.title}</h3>
              <p className="mt-1.5 leading-relaxed">
                <Inline text={t.text} />
              </p>
              {t.code && (
                <div className="mt-3">
                  <Snippet code={t.code} />
                </div>
              )}
              <Link href={`/level/${t.level}`} className="mt-2 inline-block text-sm underline decoration-2 underline-offset-4 hover:bg-yellow-soft">
                বিস্তারিত →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="keys" className="mt-16">
        <h2 id="keys" className="flex items-center gap-2 font-h2 text-3xl">
          <Keyboard className="size-7" strokeWidth={2.4} aria-hidden />
          এই সাইটের কিবোর্ড শর্টকাট
        </h2>
        <ul className="brut mt-6 divide-y-2 divide-dashed divide-ink/30 bg-card px-5 py-2">
          {siteShortcuts.map((s) => (
            <li key={s.text} className="flex items-center justify-between gap-4 py-3">
              <span>{s.text}</span>
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
