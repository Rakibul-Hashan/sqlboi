import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TemplatesWorkbench } from "@/components/templates/Workbench";
import { TriggerTable } from "@/components/templates/TriggerTable";
import { ReadingText } from "@/components/ReadingLanguage";

export const metadata: Metadata = {
  title: "প্রশ্ন ভাঙার টেমপ্লেট",
  description:
    "প্রশ্ন পেস্ট করো, সংকেত-শব্দ দেখে টেমপ্লেট বাছো, নিজের টেবিল-Column বসাও: Query তৈরি, ব্রাউজারেই চালিয়ে দেখো। সাথে ছয় ধাপের প্রশ্ন ভাঙার ছক।",
};

const QUICK = [
  {
    n: "১",
    title: "প্রতি Row-তে কী?",
    body: "উত্তরের এক লাইন কী: একজন ছাত্র, একটা ক্যাটাগরি, নাকি একটাই সংখ্যা? এটা ঠিক হলে বোঝা যায় দল (GROUP BY) লাগবে কি না।",
    englishTitle: "What does one row represent?",
    englishBody: "Decide whether the result is one row per student, one row per category, or a single value. That helps you choose whether to group.",
    bg: "bg-blue-soft",
  },
  {
    n: "২",
    title: "সংকেত-শব্দ খোঁজো",
    body: "at least one, never, every, total … exceeds, own, most, supervisor: প্রায় প্রতিটা প্রশ্নে এমন একটা শব্দ থাকে, যা বলে দেয় কোন নকশা।",
    englishTitle: "Look for clues",
    englishBody: "Phrases like “at least one”, “never”, “every”, and “total exceeds” point to common query patterns.",
    bg: "bg-yellow-soft",
  },
  {
    n: "৩",
    title: "টেমপ্লেটে নাম বসাও",
    body: "নকশার টেমপ্লেটে নিজের টেবিল আর Column-এর নাম দাও। Query তৈরি হবে, চালিয়ে দেখো, আর পাশের ফাঁদের তালিকা মিলিয়ে নাও।",
    englishTitle: "Fill in the template",
    englishBody: "Enter your table and column names, run the generated query, and check for edge cases.",
    bg: "bg-green-soft",
  },
];

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-[88rem] px-4 py-12 xl:px-8">
      <PageHeader
        tag={<ReadingText bn="টেমপ্লেট" en="Templates" />}
        title={<ReadingText bn="প্রশ্ন ভাঙার টেমপ্লেট" en="SQL Query Templates" />}
        lead={<ReadingText bn="পুরো ছয় ধাপ প্রতিবার ভারী লাগলে এখান থেকে শুরু করো। প্রশ্ন পেস্ট করো, টেমপ্লেট বাছো, নাম বসাও, চালাও। পদ্ধতির পুরো ব্যাখ্যা লেভেল ৫.১-এ।" en="Paste a question, choose a query pattern, and run it with your own table and column names. Level 5.1 explains the full method." />}
      />

      <section aria-labelledby="quick" className="mt-10">
        <h2 id="quick" className="font-h2 text-3xl">
          <ReadingText bn="সবচেয়ে দ্রুত পথ: তিনটা প্রশ্ন" en="Start with these three steps" />
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {QUICK.map((q, index) => (
            <li key={q.n} className={`brut-sm p-5 ${q.bg}`}>
              <span className="grid size-10 place-items-center rounded-full border-[2.5px] border-ink bg-card font-h2 text-xl"><ReadingText bn={q.n} en={index + 1} /></span>
              <h3 className="mt-3 font-h3 text-xl"><ReadingText bn={q.title} en={q.englishTitle} /></h3>
              <p className="mt-1.5 text-[1.05rem] leading-relaxed"><ReadingText bn={q.body} en={q.englishBody} /></p>
            </li>
          ))}
        </ol>

        <TriggerTable />
      </section>

      <TemplatesWorkbench />

      <p className="mt-16 max-w-4xl text-[1.05rem] leading-relaxed text-muted">
        <ReadingText bn={<>টেমপ্লেট শুরু করার জন্য, শেষ কথা না: তৈরি Query সবসময় হাতের উত্তরের সাথে মিলিয়ে দেখো। প্রতিটা টেমপ্লেটের উদাহরণ অ্যাসাইনমেন্টের Database-এ চালিয়ে
          যাচাই করা; পুরো ব্যাখ্যা <Link href="/level/level-5-2" className="underline">লেভেল ৫.২</Link> থেকে{" "}
          <Link href="/level/level-5-5" className="underline">৫.৫</Link>-এ।</>}
          en={<>Check the generated result against what you expected from the data. See the worked problems from <Link href="/level/level-5-2" className="underline">Level 5.2</Link> through <Link href="/level/level-5-5" className="underline">Level 5.5</Link>.</>} />
      </p>
    </main>
  );
}
