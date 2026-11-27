"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ArrowDown, Eraser, LoaderCircle, Play, Plus, ScanSearch, Sparkles, Trash2, TriangleAlert, Wand2 } from "lucide-react";
import { buildPattern, englishPatterns, englishSignals, englishViewField, patterns, signals, VIEW_FIELD, type Field, type Pattern } from "@/lib/templates";
import { freshDatabase, runOn, type DbName, type RunOutput, type SqlJsDatabase } from "@/lib/sql-engine";
import { toBn } from "@/lib/levels";
import { DB_INFO, englishDatabaseLabels, ResultPanel } from "../SqlRunner";
import { useEnglish } from "../ReadingLanguage";
import { SqlView } from "./SqlView";
import { CopyButton } from "../CopyButton";

/* ================================================================== */
/* ছোট সাহায্যকারী                                                     */
/* ================================================================== */

/** ঘরের সাধারণ চেহারা, ফন্ট ছাড়া: কোডের ঘরে `code`, বাংলা লেখার ঘরে `prose` */
const inputBase =
  "w-full min-w-0 rounded-lg border-[2.5px] border-ink bg-card px-3 py-2 outline-none placeholder:text-ink/35 focus-visible:ring-4 focus-visible:ring-blue/40";
const input = `${inputBase} font-code text-[0.95rem]`;
const prose = `${inputBase} font-body text-base`;

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <>
      <label htmlFor={htmlFor} className="mb-1 block font-h3 text-sm">
        {children}
      </label>
      {hint && <p className="-mt-0.5 mb-1.5 text-xs leading-snug text-muted">{hint}</p>}
    </>
  );
}

function FieldInput({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  const english = useEnglish();
  const id = useId();
  if (f.type === "toggle") {
    return (
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border-[2.5px] border-ink bg-card px-3 py-2 has-[:checked]:bg-green-soft">
        <input type="checkbox" checked={value === "1"} onChange={(e) => onChange(e.target.checked ? "1" : "")} className="size-5 accent-ink" />
        <span className="font-h3 text-sm">{f.label}</span>
      </label>
    );
  }
  return (
    <div>
      <Label htmlFor={id} hint={f.hint}>
        {f.label}
        {f.optional && <span className="ml-1.5 font-body text-xs text-muted">{english ? "(optional)" : "(ঐচ্ছিক)"}</span>}
      </Label>
      {f.type === "area" ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} rows={3} spellCheck={false} className={`${input} resize-y leading-relaxed`} />
      ) : f.type === "select" ? (
        <select id={id} value={value || f.options?.[0]?.value} onChange={(e) => onChange(e.target.value)} className={prose}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} spellCheck={false} autoCapitalize="off" autoComplete="off" className={input} />
      )}
    </div>
  );
}

/** একটা Database বেছে তাতে SQL চালানো (প্রতিবার নতুন, ভরা Database) */
function RunBox({ sql, db, setDb, blocked }: { sql: string; db: DbName; setDb: (d: DbName) => void; blocked?: string }) {
  const english = useEnglish();
  const [out, setOut] = useState<RunOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  useEffect(() => setOut(null), [sql, db]);

  async function run() {
  const english = useEnglish();
    setBusy(true);
    let d: SqlJsDatabase | null = null;
    try {
      d = await freshDatabase(db);
      setOut(runOn(d, sql));
    } catch (e) {
      setOut({ sets: [], statements: 0, ms: 0, error: `${english ? "Could not start the SQL engine: " : "ইঞ্জিন চালু হয়নি: "}${e instanceof Error ? e.message : String(e)}` });
    } finally {
      d?.close();
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border-[2.5px] border-dashed border-ink bg-paper p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-[1_1_12rem]">
          <label htmlFor={id} className="mb-1 block font-h3 text-xs">
            {english ? "Choose a sample database" : "কোন Database-এ চালাবে"}
          </label>
          <select id={id} value={db} onChange={(e) => setDb(e.target.value as DbName)} className={`${inputBase} py-1.5 font-body text-sm`}>
            {(Object.keys(DB_INFO) as DbName[]).map((k) => (
              <option key={k} value={k}>
                {english ? englishDatabaseLabels[k] : DB_INFO[k].label} ({DB_INFO[k].tables.join(", ")})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={busy || !!blocked}
          className="brut-sm press press-sm inline-flex min-h-10 items-center gap-1.5 bg-green px-3 py-1 font-h3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Play className="size-4 fill-ink" strokeWidth={2.4} aria-hidden />}
          {english ? "Run" : "চালাও"}
        </button>
      </div>
      {blocked && <p className="mt-2 text-xs text-muted">{blocked}</p>}
      {out && <ResultPanel out={out} onClose={() => setOut(null)} english={english} />}
    </div>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** পাতার অন্য অংশ (যেমন ওপরের টেবিল) থেকে টেমপ্লেট খোলার সংকেত */
export const PICK_EVENT = "tpl:pick";

/* ================================================================== */
/* ১. প্রশ্ন স্ক্যানার                                                  */
/* ================================================================== */

const SAMPLE_QUESTIONS = [
  "Find the student ID and name of each student who has registered for every course taught by \"Dr. Rahman\".",
  "Find the average number of courses registered per student. Note that a student who has not registered for any course does not appear in the registered relation, but that student must still be counted in the average.",
  "Create a SQL view that shows the details of each staff member whose salary is greater than the average salary of his or her own branch.",
  "Give an expression in the relational algebra to find the ID and name of each customer who has never placed an order.",
  "Write a SQL query to find the total sales amount (price × quantity) of each product category in the year 2025, showing only the categories whose total exceeds 50,000.",
  "Write a SQL query to display the name of each staff member together with the name of his or her supervisor.",
];

function Highlighted({ text }: { text: string }) {
  // সব সংকেতের মিল একসাথে খুঁজে, পাশাপাশি না-জড়ানো অংশগুলোতে দাগ
  const marks: { s: number; e: number }[] = [];
  for (const sig of signals) {
    sig.re.lastIndex = 0;
    for (const m of text.matchAll(sig.re)) {
      if (m.index !== undefined && m[0].trim()) marks.push({ s: m.index, e: m.index + m[0].length });
    }
  }
  marks.sort((a, b) => a.s - b.s);
  const parts: React.ReactNode[] = [];
  let at = 0;
  marks.forEach((m, i) => {
    if (m.s < at) return;
    parts.push(text.slice(at, m.s));
    parts.push(
      <mark key={i} className="rounded bg-yellow px-0.5 text-ink">
        {text.slice(m.s, m.e)}
      </mark>
    );
    at = m.e;
  });
  parts.push(text.slice(at));
  return <>{parts}</>;
}

function Scanner({ onPick }: { onPick: (id: string) => void }) {
  const english = useEnglish();
  const localizedPatterns = english ? englishPatterns : patterns;
  const localizedSignals = english ? englishSignals : signals;
  const [q, setQ] = useState("");
  const id = useId();

  const found = useMemo(() => {
    const pats = new Map<string, string[]>();
    const tips: string[] = [];
    for (const sig of localizedSignals) {
      sig.re.lastIndex = 0;
      const hits = [...q.matchAll(sig.re)].map((m) => m[0]);
      if (!hits.length) continue;
      if (sig.pattern) pats.set(sig.pattern, [...(pats.get(sig.pattern) ?? []), ...hits]);
      if (sig.tip && !tips.includes(sig.tip)) tips.push(sig.tip);
    }
    return { pats: [...pats.entries()], tips };
  }, [q, localizedSignals]);

  return (
    <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
      <div>
        <Label htmlFor={id} hint={english ? "Paste the assignment question in English or Bangla" : "ইংরেজি বা বাংলা, অ্যাসাইনমেন্ট থেকে হুবহু কপি করে দাও"}>
          {english ? "Paste the question here" : "প্রশ্নটা এখানে পেস্ট করো"}
        </Label>
        <textarea
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rows={6}
          placeholder="Find the name and city of each customer who has ordered the most expensive product in the shop."
          className={`${prose} resize-y leading-relaxed`}
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">{english ? "Examples:" : "নমুনা:"}</span>
          {SAMPLE_QUESTIONS.map((s, i) => (
            <button key={i} type="button" onClick={() => setQ(s)} className="rounded-md border-2 border-ink bg-card px-2 py-0.5 font-h3 text-xs hover:bg-yellow-soft">
              {english ? i + 1 : toBn(i + 1)}
            </button>
          ))}
          {q && (
            <button type="button" onClick={() => setQ("")} className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-h3 text-xs hover:bg-yellow-soft">
              <Eraser className="size-3.5" aria-hidden /> {english ? "Clear" : "মোছো"}
            </button>
          )}
        </div>
      </div>

      <div className="brut-sm bg-card p-4" aria-live="polite">
        {!q.trim() ? (
          <p className="text-muted">{english ? "Paste a question to highlight clues and see matching templates." : "প্রশ্ন দিলে এখানে সংকেত-শব্দগুলো দাগানো হবে, আর কোন টেমপ্লেট লাগবে সেটা দেখাবে।"}</p>
        ) : (
          <>
            <p className="font-h3 text-sm">{english ? "Clues in the question:" : "সংকেত-শব্দ দাগানো:"}</p>
            <p className="mt-1 leading-relaxed">
              <Highlighted text={q} />
            </p>
            <p className="mt-4 font-h3 text-sm">{english ? "Suggested templates:" : "সম্ভাব্য টেমপ্লেট:"}</p>
            {found.pats.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {found.pats.map(([pid, hits]) => {
                  const p = localizedPatterns.find((x) => x.id === pid)!;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => onPick(pid)}
                      className="brut-sm press press-sm inline-flex items-center gap-1.5 bg-yellow px-3 py-1.5 text-left font-h3 text-sm"
                    >
                      <Wand2 className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                      <span>
                        {p.title}
                        <span className="block font-body text-xs opacity-75">&ldquo;{[...new Set(hits.map((h) => h.toLowerCase()))].join("”, “")}&rdquo;</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-1 text-sm">
                {english ? "No familiar clues. For a straightforward filter or join, start with the" : "চেনা কোনো সংকেত পাইনি। সম্ভবত সাধারণ ছাঁকা-আর-জোড়া প্রশ্ন: নিচের"} <b>{english ? "query worksheet" : "প্রশ্ন ভাঙার ছক"}</b> {english ? "below." : "দিয়ে শুরু করো।"}
              </p>
            )}
            {found.tips.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {found.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <Sparkles className="mt-1 size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 border-t-2 border-dashed border-grid pt-2 text-xs text-muted">
              {english ? "These suggestions match keywords. For example, “for every category” often means GROUP BY." : "এটা শব্দ মিলিয়ে অনুমান, শেষ সিদ্ধান্ত তোমার। যেমন “for every category”-তে every থাকলেও সেটা দল, Division না।"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* ২. টেমপ্লেট                                                         */
/* ================================================================== */

type ValuesByPattern = Record<string, Record<string, string>>;

function initialValues(): ValuesByPattern {
  return Object.fromEntries(patterns.map((p) => [p.id, { ...p.presets[0].values }]));
}

function emptyValues(p: Pattern): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of p.fields) {
    if (f.type === "select") v[f.key] = f.options?.[0]?.value ?? "";
    else v[f.key] = "";
  }
  v.view = "";
  return v;
}

function Templates({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  const english = useEnglish();
  const localizedPatterns = english ? englishPatterns : patterns;
  const [values, setValues] = useState<ValuesByPattern>(initialValues);
  const [dbs, setDbs] = useState<Record<string, DbName>>(() => Object.fromEntries(patterns.map((p) => [p.id, p.presets[0].db])));
  const [preset, setPreset] = useState<Record<string, number | null>>(() => Object.fromEntries(patterns.map((p) => [p.id, 0])));

  const p = localizedPatterns.find((x) => x.id === active) ?? localizedPatterns[0];
  const vals = values[p.id];
  const built = useMemo(() => buildPattern(p, vals, english), [p, vals, english]);

  const set = (key: string, v: string) => {
    setValues((all) => ({ ...all, [p.id]: { ...all[p.id], [key]: v } }));
    setPreset((all) => ({ ...all, [p.id]: null }));
  };

  const fields = [...p.fields, english ? englishViewField : VIEW_FIELD];
  const shortFields = fields.filter((f) => f.short);
  const longFields = fields.filter((f) => !f.short);

  return (
    <div>
      {/* নকশা বাছাই */}
      <div role="tablist" aria-label={english ? "Query patterns" : "টেমপ্লেট"} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {localizedPatterns.map((x, i) => {
          const on = x.id === p.id;
          return (
            <button
              key={x.id}
              role="tab"
              aria-selected={on}
              type="button"
              onClick={() => setActive(x.id)}
              className={`brut-sm press press-sm px-3.5 py-2.5 text-left ${on ? "bg-yellow" : "bg-card"}`}
            >
              <span className="flex items-baseline gap-2 font-h3">
                <span className="text-sm opacity-60">{english ? i + 1 : toBn(i + 1)}</span>
                {x.title}
              </span>
              <span className="mt-0.5 block font-code text-xs leading-snug opacity-70">{x.triggers.slice(0, 4).join(" · ")}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] [&>*]:min-w-0">
        {/* ঘর */}
        <div role="tabpanel" aria-label={p.title}>
          <div className="brut-sm bg-card p-4">
            <h3 className="font-h2 text-2xl">{p.title}</h3>
            <p className="mt-1">{p.when}</p>
            <p className="mt-2 text-sm">
              <span className="font-h3">{english ? "One result row represents:" : "প্রতি Row-তে:"}</span> {p.grain}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-h3 text-sm">{english ? "Load an example:" : "উদাহরণ দিয়ে ভরো:"}</span>
            {p.presets.map((pr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setValues((all) => ({ ...all, [p.id]: { ...emptyValues(p), ...pr.values } }));
                  setDbs((all) => ({ ...all, [p.id]: pr.db }));
                  setPreset((all) => ({ ...all, [p.id]: i }));
                }}
                aria-pressed={preset[p.id] === i}
                className="rounded-md border-2 border-ink bg-card px-2.5 py-1 font-h3 text-xs hover:bg-yellow-soft aria-pressed:bg-blue-soft"
              >
                {pr.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setValues((all) => ({ ...all, [p.id]: emptyValues(p) }));
                setPreset((all) => ({ ...all, [p.id]: null }));
              }}
              className="inline-flex items-center gap-1 rounded-md border-2 border-dashed border-ink px-2.5 py-1 font-h3 text-xs hover:bg-pink-soft"
            >
              <Eraser className="size-3.5" aria-hidden /> {english ? "Clear the fields" : "খালি করো, নিজের নাম বসাব"}
            </button>
          </div>

          <div className="mt-4 grid gap-x-3 gap-y-3.5 sm:grid-cols-2 2xl:grid-cols-3 [&>*]:min-w-0">
            {shortFields.map((f) => (
              <FieldInput key={f.key} f={f} value={vals[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
          <div className="mt-3.5 space-y-3.5">
            {longFields.map((f) => (
              <FieldInput key={f.key} f={f} value={vals[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
        </div>

        {/* আউটপুট */}
        <div className="sql-workbench-preview space-y-4">
          {built.missing.length > 0 && (
            <p className="rounded-lg border-[2.5px] border-ink bg-pink-soft px-3 py-2 text-sm">
              <span className="font-h3">{english ? "Required fields still blank:" : "বাকি ঘর:"}</span> {built.missing.join(", ")}
            </p>
          )}
          <SqlView code={built.sql} label={english ? "Your query" : "তোমার Query"} />
          <RunBox
            sql={built.sql}
            db={dbs[p.id]}
            setDb={(d) => setDbs((all) => ({ ...all, [p.id]: d }))}
            blocked={built.missing.length ? (english ? "Fill in the required fields to run the query." : "সব ঘর ভরলে চালানো যাবে।") : undefined}
          />
          {built.algebra && <SqlView code={built.algebra} label="Relational Algebra" bg="bg-purple-soft" highlight={false} />}
          {built.warnings.length > 0 && (
            <div className="brut-sm bg-orange-soft p-4">
              <p className="flex items-center gap-2 font-h3">
                <TriangleAlert className="size-5" strokeWidth={2.4} aria-hidden /> {english ? "Common pitfalls" : "এই নকশার ফাঁদ"}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem] leading-relaxed">
                {built.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {built.alt && (
            <details className="brut-sm bg-card">
              <summary className="cursor-pointer px-4 py-2.5 font-h3">{english ? "Alternative approach:" : "দ্বিতীয় উপায়:"} {built.alt.title}</summary>
              <div className="space-y-3 border-t-[2.5px] border-ink p-3">
                <p className="text-sm">{english ? "Compare the results of both queries. See step 6 in Level 5.1." : "একই প্রশ্ন অন্যভাবে। দুটো একই উত্তর দিলে নিশ্চিন্ত থাকো (লেভেল ৫.১-এর ধাপ ৬)।"}</p>
                <SqlView code={built.alt.sql} label={english ? "Alternative query" : "বিকল্প"} bg="bg-green-soft" />
                <RunBox sql={built.alt.sql} db={dbs[p.id]} setDb={(d) => setDbs((all) => ({ ...all, [p.id]: d }))} blocked={built.missing.length ? (english ? "Fill in the required fields to run the query." : "সব ঘর ভরলে চালানো যাবে।") : undefined} />
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* ৩. প্রশ্ন ভাঙার ছক                                                   */
/* ================================================================== */

interface JoinRow {
  type: "JOIN" | "LEFT JOIN";
  table: string;
  on: string;
}
interface Sheet {
  question: string;
  grain: string;
  pattern: string;
  select: string;
  from: string;
  joins: JoinRow[];
  where: string;
  group: string;
  having: string;
  order: string;
  hand: string;
  assume: string;
  checks: string[];
  db: DbName;
}

const trapsFor = (english: boolean) => [
  { id: "dup", label: (english ? "Duplicates: can the join return the same item more than once? Check DISTINCT or EXISTS." : "ডুপ্লিকেট: JOIN-এর পর একজন কয়েকবার আসবে না তো? (DISTINCT / EXISTS)") },
  { id: "empty", label: (english ? "Empty groups: do rows with zero matches remain? Check LEFT JOIN and COUNT(column)." : "খালি দল: যার কিছুই নেই, সে হারাচ্ছে না তো? (LEFT JOIN, COUNT(col))") },
  { id: "null", label: (english ? "Missing values: how do =, NOT IN, and COUNT(*) handle NULL?" : "NULL: =, NOT IN, COUNT(*) NULL-এ কী করবে?") },
  { id: "tie", label: (english ? "Ties: does the query return all rows tied for first?" : "টাই: সর্বোচ্চে দুজন সমান হলে দুজনই আসবে? (LIMIT 1 না)") },
  { id: "edge", label: (english ? "Boundaries: is the comparison strict? Does the date range include the last day?" : "সীমানা: > নাকি >=? বছরের শেষ দিন আছে?") },
  { id: "where", label: (english ? "Are row filters in WHERE and aggregate filters in HAVING?" : "Row-এর শর্ত WHERE-এ, হিসাবের শর্ত HAVING-এ?") },
  { id: "andor", label: (english ? "Do mixed AND and OR conditions use parentheses?" : "AND আর OR একসাথে থাকলে বন্ধনী আছে?") },
  { id: "alias", label: (english ? "Do columns with the same name have table aliases?" : "দুই টেবিলে একই নামের Column-এর সামনে alias?") },
];

const EMPTY_SHEET: Sheet = {
  question: "",
  grain: "",
  pattern: "",
  select: "",
  from: "",
  joins: [],
  where: "",
  group: "",
  having: "",
  order: "",
  hand: "",
  assume: "",
  checks: [],
  db: "q3-shop",
};

const exampleSheet = (english: boolean): Sheet => ({
  question:
    (english ? "List Dhaka customers who spent more than 40,000 in 2025. Show each customer’s name, order count, and total, highest spending first." : "২০২৫ সালে ঢাকার যে ক্রেতারা মোট ৪০,০০০ টাকার বেশি কেনাকাটা করেছেন, তাঁদের নাম, ২০২৫-এ কয়টা অর্ডার আর মোট খরচ; বেশি খরচ আগে।"),
  grain: (english ? "One customer" : "একজন ক্রেতা"),
  pattern: "group-having",
  select: "c.cname, COUNT(*) AS orders_2025, SUM(p.price * o.quantity) AS total",
  from: "customer c",
  joins: [
    { type: "JOIN", table: "orders o", on: "o.cust_id = c.cust_id" },
    { type: "JOIN", table: "product p", on: "p.prod_id = o.prod_id" },
  ],
  where: "c.city = 'Dhaka'\nAND o.order_date >= '2025-01-01'\nAND o.order_date < '2026-01-01'",
  group: "c.cust_id, c.cname",
  having: "SUM(p.price * o.quantity) > 40000",
  order: "total DESC",
  hand: (english ? "Ayesha: #1, #4, #14 → 200000 (3 orders)\nChandni: #3, #8 → 31000 (excluded)\nGias: no orders\nAnswer: Ayesha, 3, 200000" : "Ayesha: #1, #4, #14 → 200000 (৩টা)\nChandni: #3, #8 → 31000 (বাদ)\nGias: অর্ডার নেই\nউত্তর: Ayesha, 3, 200000"),
  assume: (english ? "The date range excludes 2026. Group by customer ID so people with the same name stay separate." : "২০২৬-এর অর্ডার ধরিনি। একই নামের দুজন আলাদা হতে পারেন, তাই আইডি ধরে দল।"),
  checks: ["dup", "empty", "where", "edge"],
  db: "q3-shop",
});

const SHEET_KEY = "boi-breakdown-v1";

function buildSheetSql(s: Sheet, english: boolean): string {
  const lines: string[] = [];
  lines.push(`SELECT ${s.select.trim() || "*"}`);
  lines.push(`FROM ${s.from.trim() || (english ? "‹starting table›" : "‹শুরুর টেবিল›")}`);
  for (const j of s.joins) {
    if (!j.table.trim() && !j.on.trim()) continue;
    lines.push(`${j.type} ${j.table.trim() || (english ? "‹table and alias›" : "‹টেবিল alias›")} ON ${j.on.trim() || (english ? "‹join condition›" : "‹জোড়ার শর্ত›")}`);
  }
  const where = s.where.trim();
  if (where) lines.push(`WHERE ${where.replace(/\n\s*/g, "\n  ")}`);
  if (s.group.trim()) lines.push(`GROUP BY ${s.group.trim()}`);
  if (s.having.trim()) lines.push(`HAVING ${s.having.trim()}`);
  if (s.order.trim()) lines.push(`ORDER BY ${s.order.trim()}`);
  return lines.join("\n") + ";";
}

function sheetAsText(s: Sheet, sql: string, english: boolean): string {
  const p = (english ? englishPatterns : patterns).find((x) => x.id === s.pattern);
  const trapLabels = trapsFor(english).filter((t) => s.checks.includes(t.id)).map((t) => `  [x] ${t.label}`);
  const joinedTables = [s.from, ...s.joins.map((j) => `${j.type} ${j.table} ON ${j.on}`)].filter(Boolean).join(" | ");
  if (english) {
    return [
      `Question: ${s.question || "-"}`,
      `1. One row represents: ${s.grain || "-"}`,
      `2. Pattern: ${p?.title ?? "-"}`,
      `   Columns to return: ${s.select || "-"}`,
      `   Tables: ${joinedTables || "-"}`,
      `   Row filter: ${s.where.replace(/\n/g, " ") || "-"}`,
      `   Groups: ${s.group || "-"}   Group filter: ${s.having || "-"}   Sort order: ${s.order || "-"}`,
      `3. Expected answer:\n${s.hand || "-"}`,
      `Assumptions: ${s.assume || "-"}`,
      `6. Pitfalls checked:\n${trapLabels.join("\n") || "  -"}`,
      "",
      sql,
    ].join("\n");
  }
  return [
    `প্রশ্ন: ${s.question || "-"}`,
    `১. প্রতি Row-তে: ${s.grain || "-"}`,
    `২. নকশা: ${p?.title ?? "-"}`,
    `   দেখাবে: ${s.select || "-"}`,
    `   টেবিল: ${joinedTables || "-"}`,
    `   Row-এর শর্ত: ${s.where.replace(/\n/g, " ") || "-"}`,
    `   দল: ${s.group || "-"}   দলের শর্ত: ${s.having || "-"}   সাজানো: ${s.order || "-"}`,
    `৩. হাতে উত্তর:\n${s.hand || "-"}`,
    `ধরে নিয়েছি: ${s.assume || "-"}`,
    `৬. ফাঁদ যাচাই:\n${trapLabels.join("\n") || "  -"}`,
    "",
    sql,
  ].join("\n");
}

function Step({ n, title, hint, children, done }: { n: number; title: string; hint: string; children: React.ReactNode; done: boolean }) {
  const english = useEnglish();
  return (
    <section className="brut-sm bg-card p-4">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-full border-[2.5px] border-ink font-h3 ${done ? "bg-green" : "bg-paper"}`} aria-hidden>
          {english ? n : toBn(n)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-h3 text-lg leading-snug">{title}</h3>
          <p className="text-sm leading-snug text-muted">{hint}</p>
          <div className="mt-3 space-y-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SmallField({
  label,
  value,
  onChange,
  placeholder,
  area,
  hint,
  text,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  area?: boolean;
  hint?: string;
  /** বাংলা লেখার ঘর (কোড না) */
  text?: boolean;
}) {
  const id = useId();
  const cls = text ? prose : input;
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      {area ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} spellCheck={false} className={`${cls} resize-y leading-relaxed`} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} spellCheck={false} autoCapitalize="off" autoComplete="off" className={cls} />
      )}
    </div>
  );
}

function BreakdownSheet({ onOpenPattern }: { onOpenPattern: (id: string) => void }) {
  const english = useEnglish();
  const localizedPatterns = english ? englishPatterns : patterns;
  const traps = trapsFor(english);
  const [s, setS] = useState<Sheet>(EMPTY_SHEET);
  const [loaded, setLoaded] = useState(false);

  // খাতা ব্রাউজারে থাকে (একই কম্পিউটারে পরে ফিরলে আগের লেখা থাকবে)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHEET_KEY);
      if (raw) setS({ ...EMPTY_SHEET, ...JSON.parse(raw) });
    } catch {
      /* নষ্ট ডেটা হলে খালি দিয়ে শুরু */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(SHEET_KEY, JSON.stringify(s));
    } catch {
      /* প্রাইভেট মোড */
    }
  }, [s, loaded]);

  const up = useCallback(<K extends keyof Sheet>(k: K, v: Sheet[K]) => setS((x) => ({ ...x, [k]: v })), []);
  const sql = useMemo(() => buildSheetSql(s, english), [s, english]);
  const pattern = localizedPatterns.find((x) => x.id === s.pattern);
  const patternId = useId();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] [&>*]:min-w-0">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setS(exampleSheet(english))} className="rounded-md border-2 border-ink bg-card px-2.5 py-1 font-h3 text-xs hover:bg-yellow-soft">
            {english ? "Load the Level 5.1 example" : "উদাহরণ দেখো (লেভেল ৫.১-এর বড় প্রশ্ন)"}
          </button>
          <button
            type="button"
            onClick={() => setS(EMPTY_SHEET)}
            className="inline-flex items-center gap-1 rounded-md border-2 border-dashed border-ink px-2.5 py-1 font-h3 text-xs hover:bg-pink-soft"
          >
            <Eraser className="size-3.5" aria-hidden /> {english ? "Clear worksheet" : "নতুন খাতা"}
          </button>
          <span className="self-center text-xs text-muted">{english ? "Your worksheet is saved in this browser." : "লেখা এই ব্রাউজারে নিজে থেকেই জমা থাকে।"}</span>
        </div>

        <Step n={1} title={english ? "State the goal in your own words" : "নিজের ভাষায় বলো"} hint={english ? "Paste the question and decide what one result row should represent." : "প্রশ্নটা দাও, আর ঠিক করো উত্তরের প্রতিটা Row আসলে কী।"} done={!!s.grain.trim()}>
          <SmallField label={english ? "Question" : "প্রশ্ন"} area text value={s.question} onChange={(v) => up("question", v)} placeholder={english ? "The assignment question" : "অ্যাসাইনমেন্টের প্রশ্নটা"} />
          <SmallField
            label={english ? "What does one row represent?" : "প্রতি Row-তে কী?"} text
            hint={english ? "One student, one category, or a single total?" : "একজন ছাত্র? একটা ক্যাটাগরি? নাকি পুরো উত্তর একটা সংখ্যা?"}
            value={s.grain}
            onChange={(v) => up("grain", v)}
            placeholder={english ? "One row per customer" : "একজন ক্রেতা, একবার"}
          />
        </Step>

        <Step n={2} title={english ? "Map the clues to SQL clauses" : "শব্দ দাগাও → SQL-এর অংশ"} hint={english ? "Match each part of the question to a table, a column, and a row or group condition." : "প্রতিটা টুকরো কোন টেবিলের কোন Column, আর Row-এর শর্ত নাকি দলের।"} done={!!(s.from.trim() && s.select.trim())}>
          <div>
            <Label htmlFor={patternId} hint={english ? "Which phrases in the question point to a pattern? Use the scanner above to check." : "প্রশ্নে কোন সংকেত-শব্দ আছে? (ওপরের স্ক্যানার সাহায্য করবে)"}>
              {english ? "Pattern" : "নকশা"}
            </Label>
            <div className="flex flex-wrap gap-2">
              <select id={patternId} value={s.pattern} onChange={(e) => up("pattern", e.target.value)} className={`${prose} max-w-md flex-1`}>
                <option value="">{english ? "General (filter, join, or group)" : "সাধারণ (ছাঁকা, জোড়া, দল)"}</option>
                {localizedPatterns.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              {pattern && (
                <button type="button" onClick={() => onOpenPattern(pattern.id)} className="brut-sm press press-sm inline-flex items-center gap-1.5 bg-yellow px-3 font-h3 text-sm">
                  <Wand2 className="size-4" strokeWidth={2.4} aria-hidden /> {english ? "Open this template" : "এর টেমপ্লেট খোলো"}
                </button>
              )}
            </div>
          </div>
          <SmallField label={english ? "Columns to return (SELECT)" : "দেখাবে (SELECT)"} hint={english ? "Leave blank to select all columns" : "শেষে বসালেও চলে; ফাঁকা থাকলে *"} value={s.select} onChange={(v) => up("select", v)} placeholder="c.cname, SUM(p.price * o.quantity) AS total" />
          <SmallField label={english ? "Starting table (FROM)" : "শুরুর টেবিল (FROM)"} hint={english ? "Choose the table at the desired result grain and include an alias" : "যার একজন = উত্তরের এক Row; alias সহ"} value={s.from} onChange={(v) => up("from", v)} placeholder="customer c" />

          <div>
            <p className="mb-1 font-h3 text-sm">{english ? "Join (JOIN)" : "জোড়া (JOIN)"}</p>
            <div className="space-y-2">
              {s.joins.map((j, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border-2 border-dashed border-ink p-2 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                  <select
                    aria-label={english ? "Join type" : "JOIN-এর ধরন"}
                    value={j.type}
                    onChange={(e) => up("joins", s.joins.map((x, k) => (k === i ? { ...x, type: e.target.value as JoinRow["type"] } : x)))}
                    className={`${input} py-1.5 text-sm`}
                  >
                    <option value="JOIN">JOIN</option>
                    <option value="LEFT JOIN">LEFT JOIN</option>
                  </select>
                  <input
                    aria-label={english ? "Table and alias" : "টেবিল আর alias"}
                    value={j.table}
                    onChange={(e) => up("joins", s.joins.map((x, k) => (k === i ? { ...x, table: e.target.value } : x)))}
                    placeholder="orders o"
                    spellCheck={false}
                    className={`${input} py-1.5 text-sm`}
                  />
                  <input
                    aria-label={english ? "Join condition" : "জোড়ার শর্ত"}
                    value={j.on}
                    onChange={(e) => up("joins", s.joins.map((x, k) => (k === i ? { ...x, on: e.target.value } : x)))}
                    placeholder="o.cust_id = c.cust_id"
                    spellCheck={false}
                    className={`${input} py-1.5 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => up("joins", s.joins.filter((_, k) => k !== i))}
                    aria-label={english ? "Remove this join" : "এই জোড়া মোছো"}
                    className="grid min-h-9 place-items-center rounded-md border-2 border-ink px-2 hover:bg-pink-soft"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => up("joins", [...s.joins, { type: "JOIN", table: "", on: "" }])}
                className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-card px-2.5 py-1 font-h3 text-xs hover:bg-yellow-soft"
              >
                <Plus className="size-3.5" aria-hidden /> {english ? "Add a join" : "টেবিল জোড়ো"}
              </button>
              <p className="text-xs text-muted">{english ? "Use LEFT JOIN to keep rows with no match." : "যার কিছু নেই তাকেও রাখতে হলে LEFT JOIN।"}</p>
            </div>
          </div>

          <SmallField label={english ? "Row filter (WHERE)" : "প্রতি Row-এর শর্ত (WHERE)"} area hint={english ? "Filter by city, date, or department before grouping." : "যোগ/গোনার আগে ছাঁকা: শহর, তারিখ, বিভাগ…"} value={s.where} onChange={(v) => up("where", v)} placeholder="c.city = 'Dhaka'" />
          <div className="grid gap-3 lg:grid-cols-3">
            <SmallField label={english ? "Grouping columns (GROUP BY)" : "দল (GROUP BY)"} hint={english ? "Think “one row per ___”" : "“প্রতি ___”"} value={s.group} onChange={(v) => up("group", v)} placeholder="c.cust_id, c.cname" />
            <SmallField label={english ? "Group filter (HAVING)" : "দলের শর্ত (HAVING)"} hint={english ? "Condition on an aggregate" : "হিসাবের ওপর শর্ত"} value={s.having} onChange={(v) => up("having", v)} placeholder="SUM(...) > 40000" />
            <SmallField label={english ? "Sort order (ORDER BY)" : "সাজানো (ORDER BY)"} hint="&ldquo;sorted by&rdquo;" value={s.order} onChange={(v) => up("order", v)} placeholder="total DESC" />
          </div>
        </Step>

        <Step n={3} title={english ? "Work out the expected answer" : "হাতে উত্তর বানাও"} hint={english ? "Read the sample data and write down the expected result before running SQL." : "Query লেখার আগে ডেটা দেখে নিজে উত্তর লেখো। পরে এর সাথেই মেলাবে।"} done={!!s.hand.trim()}>
          <SmallField label={english ? "Expected answer" : "হাতের উত্তর"} area text value={s.hand} onChange={(v) => up("hand", v)} placeholder={english ? "Which rows and values should appear?" : "কে কে আসবে, কত"} />
          <SmallField label={english ? "Assumptions" : "যা ধরে নিয়েছি"} area text hint={english ? "Record decisions, such as whether the boundary is inclusive or retakes count twice." : "অস্পষ্ট জায়গা: > নাকি >=? রিটেক গুনব কি না? খাতায় এটাও লেখো।"} value={s.assume} onChange={(v) => up("assume", v)} placeholder={english ? "“After” means the date itself is excluded" : "\"after\" মানে ঐ দিন বাদ"} />
        </Step>

        <Step n={6} title={english ? "Check common pitfalls" : "ফাঁদ যাচাই"} hint={english ? "Run the query, then check off each case you’ve verified." : "চালানোর পর প্রতিটা নিজেকে জিজ্ঞেস করে টিক দাও।"} done={s.checks.length === traps.length}>
          <ul className="space-y-1.5">
            {traps.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-start gap-2.5 text-[0.95rem] leading-snug">
                  <input
                    type="checkbox"
                    checked={s.checks.includes(t.id)}
                    onChange={(e) => up("checks", e.target.checked ? [...s.checks, t.id] : s.checks.filter((x) => x !== t.id))}
                    className="mt-1 size-4.5 shrink-0 accent-ink"
                  />
                  {t.label}
                </label>
              </li>
            ))}
          </ul>
        </Step>
      </div>

      <div className="space-y-4 xl:self-start">
        <div className="brut-sm bg-yellow-soft p-4 text-sm leading-relaxed">
          <p className="font-h3 text-base">{english ? "Steps 4 and 5: Run the query in stages" : "ধাপ ৪ আর ৫: ছোট ধাপে চালাও, মেলাও"}</p>
          <p className="mt-1">
            {english ? "Start with FROM and JOIN and count the rows. Add WHERE, then grouping. Check each result against your expected answer." : "ঘর ভরার সাথে সাথে নিচে Query তৈরি হয়। প্রথমে শুধু FROM আর JOIN ভরে চালাও, Row গোনো; তারপর WHERE, তারপর দল। প্রতিবার হাতের উত্তরের সাথে মেলাও।"}
          </p>
        </div>
        <SqlView code={sql} label={english ? "Query from your worksheet" : "ছক থেকে তৈরি Query"} />
        <RunBox sql={sql} db={s.db} setDb={(d) => up("db", d)} blocked={!s.from.trim() ? (english ? "Enter a starting table in FROM." : "অন্তত শুরুর টেবিল (FROM) দাও।") : undefined} />
        <div className="brut-sm bg-card p-4">
          <p className="font-h3">{english ? "Copy the worksheet" : "খাতায় তোলার জন্য"}</p>
          <p className="mt-1 text-sm text-muted">{english ? "Copy the whole worksheet and query as plain text." : "পুরো ছক আর Query সাধারণ লেখা হিসেবে কপি হবে।"}</p>
          <div className="mt-2">
            <CopyButton text={sheetAsText(s, sql, english)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* পুরো কর্মশালা                                                        */
/* ================================================================== */

export function TemplatesWorkbench() {
  const english = useEnglish();
  const [active, setActive] = useState(patterns[0].id);

  // ?p=division দিয়ে সরাসরি একটা টেমপ্লেট খোলা যায় (লেভেলের পাতা থেকে লিংক)।
  // অন্য পাতা থেকে এলে Next.js নিজেও পাতার ওপরে স্ক্রল করে, তাই একটু পরে আমরা স্ক্রল করি,
  // যাতে আমাদেরটাই শেষে খাটে।
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("p");
    if (!p || !patterns.some((x) => x.id === p)) return;
    setActive(p);
    const t = window.setTimeout(() => scrollTo("templates"), 120);
    return () => window.clearTimeout(t);
  }, []);

  const choose = useCallback((id: string, scroll: boolean) => {
    setActive(id);
    const url = new URL(window.location.href);
    url.searchParams.set("p", id);
    window.history.replaceState(null, "", url);
    if (scroll) requestAnimationFrame(() => scrollTo("templates"));
  }, []);
  const pick = useCallback((id: string) => choose(id, true), [choose]);
  const tab = useCallback((id: string) => choose(id, false), [choose]);

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (patterns.some((x) => x.id === id)) pick(id);
    };
    window.addEventListener(PICK_EVENT, on);
    return () => window.removeEventListener(PICK_EVENT, on);
  }, [pick]);

  return (
    <>
      <section aria-labelledby="scan" className="mt-14">
        <h2 id="scan" className="flex items-center gap-2 font-h2 text-3xl">
          <ScanSearch className="size-7" strokeWidth={2.4} aria-hidden />
          {english ? "1. Find clues in the question" : "১. প্রশ্নের সংকেত খোঁজো"}
        </h2>
        <p className="mt-2 max-w-4xl text-lg">{english ? "Paste a question to highlight phrases that suggest a SQL pattern." : "প্রশ্নটা পেস্ট করো। সংকেত-শব্দগুলো দাগানো হবে, আর কোন টেমপ্লেট লাগবে বলে দেবে।"}</p>
        <div className="mt-5">
          <Scanner onPick={pick} />
        </div>
      </section>

      <section id="templates" aria-labelledby="tpl" className="mt-16">
        <h2 id="tpl" className="flex items-center gap-2 font-h2 text-3xl">
          <Wand2 className="size-7" strokeWidth={2.4} aria-hidden />
          {english ? "2. Fill in a query template" : "২. টেমপ্লেটে নাম বসাও"}
        </h2>
        <p className="mt-2 max-w-4xl text-lg">
          {english ? "Choose a pattern and enter your table and column names. Load an example to see what belongs in each field." : "৯টা নকশায় অ্যাসাইনমেন্টের প্রায় সব প্রশ্ন পড়ে। নকশা বাছো, ঘরে নিজের টেবিল আর Column-এর নাম বসাও, Query তৈরি। আগে একবার “উদাহরণ দিয়ে ভরো” চেপে দেখো কোন ঘরে কী যায়।"}
        </p>
        <div className="mt-5">
          <Templates active={active} setActive={tab} />
        </div>
      </section>

      <section aria-labelledby="sheet" className="mt-16">
        <h2 id="sheet" className="flex items-center gap-2 font-h2 text-3xl">
          <ArrowDown className="size-7" strokeWidth={2.4} aria-hidden />
          {english ? "3. Use the query worksheet" : "৩. প্রশ্ন ভাঙার ছক"}
        </h2>
        <p className="mt-2 max-w-4xl text-lg">
          {english ? "For longer questions, use the six-step worksheet from Level 5.1. The query updates as you fill in the fields." : "কোনো টেমপ্লেটে না মিললে, বা বড় প্রশ্ন হলে: লেভেল ৫.১-এর ছয় ধাপ একটা ফর্মে। প্রতিটা ঘর একটা প্রশ্নের উত্তর; ভরতে ভরতে Query নিজেই তৈরি হয়।"}
        </p>
        <div className="mt-5">
          <BreakdownSheet onOpenPattern={pick} />
        </div>
      </section>
    </>
  );
}
