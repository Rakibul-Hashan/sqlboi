import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { levels, zoneBg, type ZoneId } from "@/lib/levels";
import { PageHeader } from "@/components/PageHeader";
import { Inline, SummaryBody } from "@/components/Summary";
import { RevisionTabs, type TierTab } from "@/components/RevisionTabs";
import { ReadingText } from "@/components/ReadingLanguage";
import { englishLevels, englishLevelLabel } from "@/lib/english-levels";
import { englishLessons } from "@/lib/english-lessons";

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
const englishRules = [
  "Preview an `UPDATE` or `DELETE` with a `SELECT` using the same `WHERE` clause.",
  "Use `IS NULL` to find missing values. Use `NOT EXISTS` to test for missing matches.",
  "Use `DECIMAL` for exact amounts, `utf8mb4` for Unicode, and `CHAR_LENGTH` to count characters.",
  "Use parentheses to make a mix of `AND` and `OR` explicit.",
  "Reason in this order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.",
  "Put right-table matching conditions in `ON` if a `LEFT JOIN` should keep unmatched rows.",
  "Use database constraints to enforce rules across all clients.",
  "In a one-to-many relationship, put the foreign key on the many side. Use a junction table for many-to-many.",
  "Wrap changes that must succeed together in a transaction, and roll back if the operation fails.",
  "Pass user-supplied values as bound parameters to a prepared statement.",
];

const englishTiers: Record<string, { label: string; hint: string; check: { q: string; a: string }[] }> = {
  basic: { label: "Basics", hint: "Zone 1 · Start here", check: [
    { q: "Which column type should store money?", a: "`DECIMAL` stores exact decimal amounts, while `FLOAT` stores approximate values." },
    { q: "Why does `WHERE phone = NULL` return no matches?", a: "The comparison evaluates to UNKNOWN. Test with `IS NULL`." },
    { q: "How is `a OR b AND c` grouped?", a: "`a OR (b AND c)`. AND has higher precedence." },
  ] },
  intermediate: { label: "Intermediate", hint: "Zone 2 · Functions, grouping, and joins", check: [
    { q: "When do you use `WHERE` and `HAVING`?", a: "`WHERE` filters input rows. `HAVING` filters groups after aggregation." },
    { q: "How do you find students with no marks?", a: "Use `NOT EXISTS` or LEFT JOIN the marks and retain rows with no matching student ID." },
    { q: "How does `AVG(gpa)` handle NULL?", a: "It divides the sum by the number of non-NULL GPAs." },
  ] },
  advanced: { label: "Advanced", hint: "Zone 3 · Design, performance, and operations", check: [
    { q: "How does a candidate key differ from a superkey?", a: "A candidate key is minimal. Remove any attribute and it no longer guarantees uniqueness." },
    { q: "How can you make a year filter index-friendly?", a: "Use a range on the date column directly, from the first day of the year to the first day of the next year, exclusive." },
    { q: "Does a statement error always roll back the whole transaction?", a: "It depends on the error. Roll back explicitly on a failed operation and be ready to retry a whole transaction after a deadlock." },
  ] },
  expert: { label: "Expert", hint: "Zones 4–6 · Advanced problems", check: [
    { q: "Which pattern finds students who took every required course?", a: "Relational division, commonly expressed with nested `NOT EXISTS`." },
    { q: "How do `RANK` and `DENSE_RANK` handle ties?", a: "`RANK` leaves gaps (1, 1, 3). `DENSE_RANK` keeps positions consecutive (1, 1, 2)." },
    { q: "How do students with zero courses count toward the average?", a: "Start from students, LEFT JOIN registrations, count a non-NULL registration column per student, and average those counts." },
  ] },
};

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
          <article key={l.slug} className="brut-sm min-w-0 bg-card p-5" style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`brut-sm px-2.5 py-0.5 font-h3 text-sm ${zoneBg[l.zone]}`}>
                <ReadingText bn={l.kind === "level" ? `লেভেল ${l.label}` : l.label} en={l.kind === "level" ? `Level ${englishLevelLabel(l)}` : englishLevelLabel(l)} />
              </span>
            </div>
            <h3 className="mt-2 font-h2 text-2xl"><ReadingText bn={l.title} en={englishLevels[l.slug].title} /></h3>
            <div className="mt-3 text-base">
              <ReadingText bn={<SummaryBody slug={l.slug} />} en={<ul className="list-disc space-y-2 pl-5">
                {englishLessons[l.slug].sections.map((section) => (
                  <li key={section.heading}><strong>{section.heading}.</strong> {section.text}</li>
                ))}
              </ul>} />
            </div>
            <Link
              href={`/level/${l.slug}`}
              className="mt-4 inline-flex items-center gap-1.5 font-h3 text-sm underline decoration-blue decoration-[3px] underline-offset-4"
            >
              <ReadingText bn="পুরো লেভেল পড়ো" en="Read the chapter" />
              <ArrowRight className="size-4" strokeWidth={2.4} aria-hidden />
            </Link>
          </article>
        ))}
      </div>

      <section className="brut bg-yellow-soft p-5 sm:p-6" aria-labelledby={`check-${tier.id}`}>
        <h3 id={`check-${tier.id}`} className="font-h2 text-2xl"><ReadingText bn="নিজেকে যাচাই করো" en="Check your understanding" /></h3>
        <p className="font-body text-base text-muted"><ReadingText bn="আগে মনে মনে উত্তর দাও, তারপর খোলো।" en="Try answering each question before revealing the answer." /></p>
        <div className="mt-4 space-y-3">
          {tier.check.map((c, i) => (
            <details key={i} className="group brut-sm bg-card px-4 py-2.5 open:pb-4">
              <summary className="cursor-pointer list-none font-h3 [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90">▸</span>
                <ReadingText bn={<Inline text={c.q} />} en={<Inline text={englishTiers[tier.id].check[i].q} />} />
              </summary>
              <p className="mt-2 text-base">
                <ReadingText bn={<Inline text={c.a} />} en={<Inline text={englishTiers[tier.id].check[i].a} />} />
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
    englishLabel: englishTiers[t.id].label,
    englishHint: englishTiers[t.id].hint,
    color: t.color,
    content: <TierContent tier={t} />,
  }));

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-12">
      <PageHeader
        tag={<ReadingText bn="রিভিশন" en="Revision" />}
        title={<ReadingText bn="পুরো DBMS এক নজরে" en="Review MySQL by level" />}
        lead={<ReadingText bn="পরীক্ষার আগে বা অনেকদিন পরে ফিরে এলে এখান থেকে শুরু করো। প্রতিটা লেভেলের সারাংশ, ফাঁদ আর নিজেকে যাচাইয়ের প্রশ্ন, সহজ থেকে কঠিন চার ধাপে সাজানো।" en="Review chapter summaries and test your understanding, from SQL basics to advanced query patterns." />}
      />

      <section className="brut mt-10 bg-yellow p-5 sm:p-7" aria-labelledby="golden-h">
        <h2 id="golden-h" className="flex items-center gap-2 font-h2 text-3xl">
          <Sparkles className="size-7" strokeWidth={2.2} aria-hidden />
          <ReadingText bn="হাতে সময় কম? এই ১০টা সোনার নিয়ম" en="Ten rules worth remembering" />
        </h2>
        <ol className="mt-4 grid gap-x-8 gap-y-2 pl-6 text-base sm:grid-cols-2" style={{ listStyle: "decimal" }}>
          {golden.map((g, i) => (
            <li key={i}>
              <ReadingText bn={<Inline text={g} />} en={<Inline text={englishRules[i]} />} />
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
