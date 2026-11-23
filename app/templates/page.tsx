import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TemplatesWorkbench } from "@/components/templates/Workbench";
import { patterns } from "@/lib/templates";

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
    bg: "bg-blue-soft",
  },
  {
    n: "২",
    title: "সংকেত-শব্দ খোঁজো",
    body: "at least one, never, every, total … exceeds, own, most, supervisor: প্রায় প্রতিটা প্রশ্নে এমন একটা শব্দ থাকে, যা বলে দেয় কোন নকশা।",
    bg: "bg-yellow-soft",
  },
  {
    n: "৩",
    title: "টেমপ্লেটে নাম বসাও",
    body: "নকশার টেমপ্লেটে নিজের টেবিল আর Column-এর নাম দাও। Query তৈরি হবে, চালিয়ে দেখো, আর পাশের ফাঁদের তালিকা মিলিয়ে নাও।",
    bg: "bg-green-soft",
  },
];

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-[88rem] px-4 py-12 xl:px-8">
      <PageHeader
        tag="টেমপ্লেট"
        title="প্রশ্ন ভাঙার টেমপ্লেট"
        lead="পুরো ছয় ধাপ প্রতিবার ভারী লাগলে এখান থেকে শুরু করো। প্রশ্ন পেস্ট করো, টেমপ্লেট বাছো, নাম বসাও, চালাও। পদ্ধতির পুরো ব্যাখ্যা লেভেল ৫.১-এ।"
      />

      <section aria-labelledby="quick" className="mt-10">
        <h2 id="quick" className="font-h2 text-3xl">
          সবচেয়ে দ্রুত পথ: তিনটা প্রশ্ন
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {QUICK.map((q) => (
            <li key={q.n} className={`brut-sm p-5 ${q.bg}`}>
              <span className="grid size-10 place-items-center rounded-full border-[2.5px] border-ink bg-card font-h2 text-xl">{q.n}</span>
              <h3 className="mt-3 font-h3 text-xl">{q.title}</h3>
              <p className="mt-1.5 text-[1.05rem] leading-relaxed">{q.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 overflow-x-auto rounded-[14px] border-[3px] border-ink bg-card shadow-[var(--shadow-brut-sm)]">
          <table className="w-full border-collapse text-[1.02rem] leading-relaxed">
            <thead className="bg-yellow-soft">
              <tr>
                <th className="border-b-[2.5px] border-ink px-4 py-2 text-left font-h3">প্রশ্নে এই শব্দ</th>
                <th className="border-b-[2.5px] border-ink px-4 py-2 text-left font-h3">টেমপ্লেট</th>
                <th className="border-b-[2.5px] border-ink px-4 py-2 text-left font-h3">প্রতি Row-তে</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.id} className="border-b-2 border-grid last:border-0">
                  <td className="px-4 py-2 font-code text-[0.92rem]">{p.triggers.join(" · ")}</td>
                  <td className="px-4 py-2">
                    <Link href={`/templates?p=${p.id}`} className="font-h3 underline decoration-2 underline-offset-4 hover:bg-blue-soft">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-[0.95rem]">{p.grain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <TemplatesWorkbench />

      <p className="mt-16 max-w-4xl text-[1.05rem] leading-relaxed text-muted">
        টেমপ্লেট শুরু করার জন্য, শেষ কথা না: তৈরি Query সবসময় হাতের উত্তরের সাথে মিলিয়ে দেখো। প্রতিটা টেমপ্লেটের উদাহরণ অ্যাসাইনমেন্টের Database-এ চালিয়ে
        যাচাই করা; পুরো ব্যাখ্যা <Link href="/level/level-5-2" className="underline">লেভেল ৫.২</Link> থেকে{" "}
        <Link href="/level/level-5-5" className="underline">৫.৫</Link>-এ।
      </p>
    </main>
  );
}
