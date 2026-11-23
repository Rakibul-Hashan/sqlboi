import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { levels, zoneBg, type ZoneId } from "@/lib/levels";
import { PageHeader } from "@/components/PageHeader";
import { Inline, SummaryBody } from "@/components/Summary";
import { RevisionTabs, type TierTab } from "@/components/RevisionTabs";

export const metadata: Metadata = {
  title: "রিভিশন",
  description: "পুরো DBMS এক জায়গায়: বেসিক থেকে এক্সপার্ট, চার ধাপে সাজানো সারাংশ, ফাঁদ আর নিজেকে যাচাইয়ের প্রশ্ন।",
};

const golden = [
  "`UPDATE`/`DELETE`-এ আগে `WHERE`, আর আগে একই `WHERE` দিয়ে `SELECT`।",
  "`NULL` খুঁজতে `IS NULL`; Subquery-তে `NOT IN`-এর বদলে `NOT EXISTS`।",
  "টাকা `DECIMAL`, বাংলা `utf8mb4`, দৈর্ঘ্য `CHAR_LENGTH`।",
  "`AND` আর `OR` একসাথে মানেই বন্ধনী।",
  "লেখার ক্রম SELECT-FROM-WHERE-GROUP BY-HAVING-ORDER BY-LIMIT, চালানোর ক্রম FROM-WHERE-GROUP BY-HAVING-SELECT-ORDER BY-LIMIT।",
  "`LEFT JOIN`-এ ডান টেবিলের শর্ত `ON`-এ, `WHERE`-এ না।",
  "নিয়ম অ্যাপে না, Database-এ: Constraint আর Trigger।",
  "১:N-এ Foreign Key N দিকে; M:N মানেই Junction টেবিল।",
  "টাকা, স্টক, বুকিং মানেই Transaction, আর error হলে `ROLLBACK`।",
  "ইউজারের ইনপুট কখনো SQL-এ জোড়া দিও না: Prepared Statement।",
];

interface Tier {
  id: string;
  label: string;
  hint: string;
  zones: ZoneId[];
  color: string;
  check: { q: string; a: string }[];
}

const tiers: Tier[] = [
  {
    id: "basic",
    label: "বেসিক",
    hint: "জোন ১ · একদম শুরু",
    zones: ["zone-1"],
    color: "data-[state=active]:bg-green",
    check: [
      { q: "টাকার Column-এর Type কী হবে, আর কেন?", a: "`DECIMAL(10,2)`; `FLOAT` আনুমানিক মান রাখে, পয়সার গরমিল হয়।" },
      { q: "`WHERE phone = NULL` কেন কিছু ফেরত দেয় না?", a: "`NULL`-এর সাথে যেকোনো তুলনা \"জানা নেই\"; `IS NULL` লাগে।" },
      { q: "`WHERE a OR b AND c` আসলে কী?", a: "`a OR (b AND c)`, কারণ `AND` আগে কাজ করে।" },
    ],
  },
  {
    id: "intermediate",
    label: "ইন্টারমিডিয়েট",
    hint: "জোন ২ · Function, GROUP BY, JOIN",
    zones: ["zone-2"],
    color: "data-[state=active]:bg-blue",
    check: [
      { q: "`WHERE` আর `HAVING`-এর পার্থক্য?", a: "`WHERE` দল বানানোর আগে Row ছাঁকে, `HAVING` পরে দল ছাঁকে আর Aggregate ব্যবহার করতে পারে।" },
      { q: "কোনো নম্বর নেই এমন ছাত্র খুঁজবে কীভাবে?", a: "`LEFT JOIN marks ... WHERE m.student_id IS NULL` (Anti Join), বা `NOT EXISTS`।" },
      { q: "`AVG(gpa)`-তে `NULL` GPA কী হয়?", a: "বাদ পড়ে; ভাগ হয় শুধু যাদের মান আছে তাদের সংখ্যা দিয়ে।" },
    ],
  },
  {
    id: "advanced",
    label: "অ্যাডভান্সড",
    hint: "জোন ৩ · তত্ত্ব, ডিজাইন, গতি, নিরাপত্তা",
    zones: ["zone-3"],
    color: "data-[state=active]:bg-pink",
    check: [
      { q: "Super Key আর Candidate Key-এর পার্থক্য?", a: "Candidate Key হলো ন্যূনতম Super Key: কোনো Attribute সরালেই অনন্যতা হারায়।" },
      { q: "`WHERE YEAR(paid_at) = 2025` কেন ধীর?", a: "Column-এর ওপর Function বসায় Index কাজে লাগে না; পরিসরে লেখো।" },
      { q: "Transaction-এর মাঝে একটা error হলে MySQL কি পুরোটা বাতিল করে?", a: "না, শুধু সেই কমান্ড; পুরোটা বাতিল করতে নিজে `ROLLBACK`।" },
    ],
  },
  {
    id: "expert",
    label: "এক্সপার্ট",
    hint: "জোন ৪, ৫ আর শেষ জোন · পরীক্ষার কঠিন প্রশ্ন",
    zones: ["zone-4", "zone-5", "zone-final"],
    color: "data-[state=active]:bg-orange",
    check: [
      { q: "\"যে ছাত্র X স্যারের সব কোর্সে ভর্তি\" কোন প্যাটার্ন?", a: "Relational Division: দুইবার `NOT EXISTS`, বা `COUNT(DISTINCT)` মিলিয়ে।" },
      { q: "`RANK` আর `DENSE_RANK`-এর পার্থক্য?", a: "সমান মানের পরে `RANK` ফাঁক রাখে (১,১,৩), `DENSE_RANK` রাখে না (১,১,২)।" },
      { q: "যারা কোনো কোর্স নেয়নি তাদেরও গড়ে গুনবে কীভাবে?", a: "মূল টেবিল থেকে `LEFT JOIN` করে `COUNT(ডান.col)`, তারপর গড়।" },
    ],
  },
];

function TierContent({ tier }: { tier: Tier }) {
  const ls = levels.filter((l) => tier.zones.includes(l.zone));
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {ls.map((l, i) => (
          <article key={l.slug} className="brut-sm bg-card p-5" style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`brut-sm px-2.5 py-0.5 font-h3 text-sm ${zoneBg[l.zone]}`}>
                {l.kind === "level" ? `লেভেল ${l.label}` : l.label}
              </span>
            </div>
            <h3 className="mt-2 font-h2 text-2xl">{l.title}</h3>
            <div className="mt-3 text-base">
              <SummaryBody slug={l.slug} />
            </div>
            <Link
              href={`/level/${l.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 font-h3 text-sm underline decoration-blue decoration-[3px] underline-offset-4"
            >
              পুরো লেভেল পড়ো
              <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden />
            </Link>
          </article>
        ))}
      </div>

      <section className="brut bg-yellow-soft p-5 sm:p-6" aria-label="নিজেকে যাচাই করো">
        <h3 className="font-h2 text-2xl">নিজেকে যাচাই করো</h3>
        <p className="font-body text-base text-muted">আগে মনে মনে উত্তর দাও, তারপর খোলো।</p>
        <div className="mt-4 space-y-3">
          {tier.check.map((c, i) => (
            <details key={i} className="group brut-sm bg-card px-4 py-2.5 open:pb-4">
              <summary className="cursor-pointer list-none font-h3 [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                <Inline text={c.q} />
              </summary>
              <p className="mt-2 text-base">
                <Inline text={c.a} />
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function RevisionPage() {
  const tabs: TierTab[] = tiers.map((t) => ({
    id: t.id,
    label: t.label,
    hint: t.hint,
    color: t.color,
    content: <TierContent tier={t} />,
  }));

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-12">
      <PageHeader
        tag="রিভিশন"
        title="পুরো DBMS এক নজরে"
        lead="পরীক্ষার আগে বা অনেকদিন পরে ফিরে এলে এখান থেকে শুরু করো। প্রতিটা লেভেলের সারাংশ, ফাঁদ আর নিজেকে যাচাইয়ের প্রশ্ন, সহজ থেকে কঠিন চার ধাপে সাজানো।"
      />

      <section className="brut mt-10 bg-yellow p-5 sm:p-7" aria-labelledby="golden-h">
        <h2 id="golden-h" className="flex items-center gap-2 font-h2 text-3xl">
          <Sparkles className="size-7" strokeWidth={2.2} aria-hidden />
          হাতে সময় কম? এই ১০টা সোনার নিয়ম
        </h2>
        <ol className="mt-4 grid gap-x-8 gap-y-2 pl-6 text-base sm:grid-cols-2" style={{ listStyle: "decimal" }}>
          {golden.map((g, i) => (
            <li key={i}>
              <Inline text={g} />
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-14">
        <RevisionTabs tabs={tabs} />
      </div>
    </main>
  );
}
