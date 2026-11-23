"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, Eraser, LoaderCircle, Play, Plus, ScanSearch, Sparkles, Trash2, TriangleAlert, Wand2 } from "lucide-react";
import { buildPattern, patterns, signals, VIEW_FIELD, type Field, type Pattern } from "@/lib/templates";
import { freshDatabase, runOn, type DbName, type RunOutput, type SqlJsDatabase } from "@/lib/sql-engine";
import { toBn } from "@/lib/levels";
import { DB_INFO, ResultPanel } from "../SqlRunner";
import { SqlView } from "./SqlView";
import { CopyButton } from "../CopyButton";

/* ================================================================== */
/* ছোট সাহায্যকারী                                                     */
/* ================================================================== */

/** ঘরের সাধারণ চেহারা, ফন্ট ছাড়া: কোডের ঘরে `code`, বাংলা লেখার ঘরে `prose` */
const inputBase =
  "w-full rounded-lg border-[2.5px] border-ink bg-card px-3 py-2 outline-none placeholder:text-ink/35 focus-visible:ring-4 focus-visible:ring-blue/40";
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
        {f.optional && <span className="ml-1.5 font-body text-xs text-muted">(ঐচ্ছিক)</span>}
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
  const [out, setOut] = useState<RunOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  useEffect(() => setOut(null), [sql, db]);

  async function run() {
    setBusy(true);
    let d: SqlJsDatabase | null = null;
    try {
      d = await freshDatabase(db);
      setOut(runOn(d, sql));
    } catch (e) {
      setOut({ sets: [], statements: 0, ms: 0, error: `ইঞ্জিন চালু হয়নি: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      d?.close();
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border-[2.5px] border-dashed border-ink bg-paper p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-48 flex-1">
          <label htmlFor={id} className="mb-1 block font-h3 text-xs">
            কোন Database-এ চালাবে
          </label>
          <select id={id} value={db} onChange={(e) => setDb(e.target.value as DbName)} className={`${inputBase} py-1.5 font-body text-sm`}>
            {(Object.keys(DB_INFO) as DbName[]).map((k) => (
              <option key={k} value={k}>
                {DB_INFO[k].label} ({DB_INFO[k].tables.join(", ")})
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
          চালাও
        </button>
      </div>
      {blocked && <p className="mt-2 text-xs text-muted">{blocked}</p>}
      {out && <ResultPanel out={out} onClose={() => setOut(null)} />}
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
  const [q, setQ] = useState("");
  const id = useId();

  const found = useMemo(() => {
    const pats = new Map<string, string[]>();
    const tips: string[] = [];
    for (const sig of signals) {
      sig.re.lastIndex = 0;
      const hits = [...q.matchAll(sig.re)].map((m) => m[0]);
      if (!hits.length) continue;
      if (sig.pattern) pats.set(sig.pattern, [...(pats.get(sig.pattern) ?? []), ...hits]);
      if (sig.tip && !tips.includes(sig.tip)) tips.push(sig.tip);
    }
    return { pats: [...pats.entries()], tips };
  }, [q]);

  return (
    <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
      <div>
        <Label htmlFor={id} hint="ইংরেজি বা বাংলা, অ্যাসাইনমেন্ট থেকে হুবহু কপি করে দাও">
          প্রশ্নটা এখানে পেস্ট করো
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
          <span className="text-xs text-muted">নমুনা:</span>
          {SAMPLE_QUESTIONS.map((s, i) => (
            <button key={i} type="button" onClick={() => setQ(s)} className="rounded-md border-2 border-ink bg-card px-2 py-0.5 font-h3 text-xs hover:bg-yellow-soft">
              {toBn(i + 1)}
            </button>
          ))}
          {q && (
            <button type="button" onClick={() => setQ("")} className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-h3 text-xs hover:bg-yellow-soft">
              <Eraser className="size-3.5" aria-hidden /> মোছো
            </button>
          )}
        </div>
      </div>

      <div className="brut-sm bg-card p-4" aria-live="polite">
        {!q.trim() ? (
          <p className="text-muted">প্রশ্ন দিলে এখানে সংকেত-শব্দগুলো দাগানো হবে, আর কোন টেমপ্লেট লাগবে সেটা দেখাবে।</p>
        ) : (
          <>
            <p className="font-h3 text-sm">সংকেত-শব্দ দাগানো:</p>
            <p className="mt-1 leading-relaxed">
              <Highlighted text={q} />
            </p>
            <p className="mt-4 font-h3 text-sm">সম্ভাব্য টেমপ্লেট:</p>
            {found.pats.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {found.pats.map(([pid, hits]) => {
                  const p = patterns.find((x) => x.id === pid)!;
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
                চেনা কোনো সংকেত পাইনি। সম্ভবত সাধারণ ছাঁকা-আর-জোড়া প্রশ্ন: নিচের <b>প্রশ্ন ভাঙার ছক</b> দিয়ে শুরু করো।
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
              এটা শব্দ মিলিয়ে অনুমান, শেষ সিদ্ধান্ত তোমার। যেমন &ldquo;for every category&rdquo;-তে every থাকলেও সেটা দল, Division না।
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
  const [values, setValues] = useState<ValuesByPattern>(initialValues);
  const [dbs, setDbs] = useState<Record<string, DbName>>(() => Object.fromEntries(patterns.map((p) => [p.id, p.presets[0].db])));
  const [preset, setPreset] = useState<Record<string, number | null>>(() => Object.fromEntries(patterns.map((p) => [p.id, 0])));

  const p = patterns.find((x) => x.id === active) ?? patterns[0];
  const vals = values[p.id];
  const built = useMemo(() => buildPattern(p, vals), [p, vals]);

  const set = (key: string, v: string) => {
    setValues((all) => ({ ...all, [p.id]: { ...all[p.id], [key]: v } }));
    setPreset((all) => ({ ...all, [p.id]: null }));
  };

  const fields = [...p.fields, VIEW_FIELD];
  const shortFields = fields.filter((f) => f.short);
  const longFields = fields.filter((f) => !f.short);

  return (
    <div>
      {/* নকশা বাছাই */}
      <div role="tablist" aria-label="টেমপ্লেট" className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {patterns.map((x, i) => {
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
                <span className="text-sm opacity-60">{toBn(i + 1)}</span>
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
              <span className="font-h3">প্রতি Row-তে:</span> {p.grain}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-h3 text-sm">উদাহরণ দিয়ে ভরো:</span>
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
              <Eraser className="size-3.5" aria-hidden /> খালি করো, নিজের নাম বসাব
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
        <div className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:self-start xl:overflow-y-auto xl:pb-2 xl:pr-1">
          {built.missing.length > 0 && (
            <p className="rounded-lg border-[2.5px] border-ink bg-pink-soft px-3 py-2 text-sm">
              <span className="font-h3">বাকি ঘর:</span> {built.missing.join(", ")}
            </p>
          )}
          <SqlView code={built.sql} label="তোমার Query" />
          <RunBox
            sql={built.sql}
            db={dbs[p.id]}
            setDb={(d) => setDbs((all) => ({ ...all, [p.id]: d }))}
            blocked={built.missing.length ? "সব ঘর ভরলে চালানো যাবে।" : undefined}
          />
          {built.algebra && <SqlView code={built.algebra} label="Relational Algebra" bg="bg-purple-soft" highlight={false} />}
          {built.warnings.length > 0 && (
            <div className="brut-sm bg-orange-soft p-4">
              <p className="flex items-center gap-2 font-h3">
                <TriangleAlert className="size-5" strokeWidth={2.4} aria-hidden /> এই নকশার ফাঁদ
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
              <summary className="cursor-pointer px-4 py-2.5 font-h3">দ্বিতীয় উপায়: {built.alt.title}</summary>
              <div className="space-y-3 border-t-[2.5px] border-ink p-3">
                <p className="text-sm">একই প্রশ্ন অন্যভাবে। দুটো একই উত্তর দিলে নিশ্চিন্ত থাকো (লেভেল ৫.১-এর ধাপ ৬)।</p>
                <SqlView code={built.alt.sql} label="বিকল্প" bg="bg-green-soft" />
                <RunBox sql={built.alt.sql} db={dbs[p.id]} setDb={(d) => setDbs((all) => ({ ...all, [p.id]: d }))} blocked={built.missing.length ? "সব ঘর ভরলে চালানো যাবে।" : undefined} />
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

const TRAPS = [
  { id: "dup", label: "ডুপ্লিকেট: JOIN-এর পর একজন কয়েকবার আসবে না তো? (DISTINCT / EXISTS)" },
  { id: "empty", label: "খালি দল: যার কিছুই নেই, সে হারাচ্ছে না তো? (LEFT JOIN, COUNT(col))" },
  { id: "null", label: "NULL: =, NOT IN, COUNT(*) NULL-এ কী করবে?" },
  { id: "tie", label: "টাই: সর্বোচ্চে দুজন সমান হলে দুজনই আসবে? (LIMIT 1 না)" },
  { id: "edge", label: "সীমানা: > নাকি >=? বছরের শেষ দিন আছে?" },
  { id: "where", label: "Row-এর শর্ত WHERE-এ, হিসাবের শর্ত HAVING-এ?" },
  { id: "andor", label: "AND আর OR একসাথে থাকলে বন্ধনী আছে?" },
  { id: "alias", label: "দুই টেবিলে একই নামের Column-এর সামনে alias?" },
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

const EXAMPLE_SHEET: Sheet = {
  question:
    "২০২৫ সালে ঢাকার যে ক্রেতারা মোট ৪০,০০০ টাকার বেশি কেনাকাটা করেছেন, তাঁদের নাম, ২০২৫-এ কয়টা অর্ডার আর মোট খরচ; বেশি খরচ আগে।",
  grain: "একজন ক্রেতা",
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
  hand: "Ayesha: #1, #4, #14 → 200000 (৩টা)\nChandni: #3, #8 → 31000 (বাদ)\nGias: অর্ডার নেই\nউত্তর: Ayesha, 3, 200000",
  assume: "২০২৬-এর অর্ডার ধরিনি। একই নামের দুজন আলাদা হতে পারেন, তাই আইডি ধরে দল।",
  checks: ["dup", "empty", "where", "edge"],
  db: "q3-shop",
};

const SHEET_KEY = "boi-breakdown-v1";

function buildSheetSql(s: Sheet): string {
  const lines: string[] = [];
  lines.push(`SELECT ${s.select.trim() || "*"}`);
  lines.push(`FROM ${s.from.trim() || "‹শুরুর টেবিল›"}`);
  for (const j of s.joins) {
    if (!j.table.trim() && !j.on.trim()) continue;
    lines.push(`${j.type} ${j.table.trim() || "‹টেবিল alias›"} ON ${j.on.trim() || "‹জোড়ার শর্ত›"}`);
  }
  const where = s.where.trim();
  if (where) lines.push(`WHERE ${where.replace(/\n\s*/g, "\n  ")}`);
  if (s.group.trim()) lines.push(`GROUP BY ${s.group.trim()}`);
  if (s.having.trim()) lines.push(`HAVING ${s.having.trim()}`);
  if (s.order.trim()) lines.push(`ORDER BY ${s.order.trim()}`);
  return lines.join("\n") + ";";
}

function sheetAsText(s: Sheet, sql: string): string {
  const p = patterns.find((x) => x.id === s.pattern);
  const trapLabels = TRAPS.filter((t) => s.checks.includes(t.id)).map((t) => `  [x] ${t.label}`);
  return [
    `প্রশ্ন: ${s.question || "-"}`,
    `১. প্রতি Row-তে: ${s.grain || "-"}`,
    `২. নকশা: ${p?.title ?? "-"}`,
    `   দেখাবে: ${s.select || "-"}`,
    `   টেবিল: ${[s.from, ...s.joins.map((j) => `${j.type} ${j.table} ON ${j.on}`)].filter(Boolean).join(" | ") || "-"}`,
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
  return (
    <section className="brut-sm bg-card p-4">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-full border-[2.5px] border-ink font-h3 ${done ? "bg-green" : "bg-paper"}`} aria-hidden>
          {toBn(n)}
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
  const [s, setS] = useState<Sheet>(EMPTY_SHEET);
  const loaded = useRef(false);

  // খাতা ব্রাউজারে থাকে (একই কম্পিউটারে পরে ফিরলে আগের লেখা থাকবে)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHEET_KEY);
      if (raw) setS({ ...EMPTY_SHEET, ...JSON.parse(raw) });
    } catch {
      /* নষ্ট ডেটা হলে খালি দিয়ে শুরু */
    }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(SHEET_KEY, JSON.stringify(s));
    } catch {
      /* প্রাইভেট মোড */
    }
  }, [s]);

  const up = useCallback(<K extends keyof Sheet>(k: K, v: Sheet[K]) => setS((x) => ({ ...x, [k]: v })), []);
  const sql = useMemo(() => buildSheetSql(s), [s]);
  const pattern = patterns.find((x) => x.id === s.pattern);
  const patternId = useId();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] [&>*]:min-w-0">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setS(EXAMPLE_SHEET)} className="rounded-md border-2 border-ink bg-card px-2.5 py-1 font-h3 text-xs hover:bg-yellow-soft">
            উদাহরণ দেখো (লেভেল ৫.১-এর বড় প্রশ্ন)
          </button>
          <button
            type="button"
            onClick={() => setS(EMPTY_SHEET)}
            className="inline-flex items-center gap-1 rounded-md border-2 border-dashed border-ink px-2.5 py-1 font-h3 text-xs hover:bg-pink-soft"
          >
            <Eraser className="size-3.5" aria-hidden /> নতুন খাতা
          </button>
          <span className="self-center text-xs text-muted">লেখা এই ব্রাউজারে নিজে থেকেই জমা থাকে।</span>
        </div>

        <Step n={1} title="নিজের ভাষায় বলো" hint="প্রশ্নটা দাও, আর ঠিক করো উত্তরের প্রতিটা Row আসলে কী।" done={!!s.grain.trim()}>
          <SmallField label="প্রশ্ন" area text value={s.question} onChange={(v) => up("question", v)} placeholder="অ্যাসাইনমেন্টের প্রশ্নটা" />
          <SmallField
            label="প্রতি Row-তে কী?" text
            hint="একজন ছাত্র? একটা ক্যাটাগরি? নাকি পুরো উত্তর একটা সংখ্যা?"
            value={s.grain}
            onChange={(v) => up("grain", v)}
            placeholder="একজন ক্রেতা, একবার"
          />
        </Step>

        <Step n={2} title="শব্দ দাগাও → SQL-এর অংশ" hint="প্রতিটা টুকরো কোন টেবিলের কোন Column, আর Row-এর শর্ত নাকি দলের।" done={!!(s.from.trim() && s.select.trim())}>
          <div>
            <Label htmlFor={patternId} hint="প্রশ্নে কোন সংকেত-শব্দ আছে? (ওপরের স্ক্যানার সাহায্য করবে)">
              নকশা
            </Label>
            <div className="flex flex-wrap gap-2">
              <select id={patternId} value={s.pattern} onChange={(e) => up("pattern", e.target.value)} className={`${prose} max-w-md flex-1`}>
                <option value="">সাধারণ (ছাঁকা, জোড়া, দল)</option>
                {patterns.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              {pattern && (
                <button type="button" onClick={() => onOpenPattern(pattern.id)} className="brut-sm press press-sm inline-flex items-center gap-1.5 bg-yellow px-3 font-h3 text-sm">
                  <Wand2 className="size-4" strokeWidth={2.4} aria-hidden /> এর টেমপ্লেট খোলো
                </button>
              )}
            </div>
          </div>
          <SmallField label="দেখাবে (SELECT)" hint="শেষে বসালেও চলে; ফাঁকা থাকলে *" value={s.select} onChange={(v) => up("select", v)} placeholder="c.cname, SUM(p.price * o.quantity) AS total" />
          <SmallField label="শুরুর টেবিল (FROM)" hint="যার একজন = উত্তরের এক Row; alias সহ" value={s.from} onChange={(v) => up("from", v)} placeholder="customer c" />

          <div>
            <p className="mb-1 font-h3 text-sm">জোড়া (JOIN)</p>
            <div className="space-y-2">
              {s.joins.map((j, i) => (
                <div key={i} className="grid gap-2 rounded-lg border-2 border-dashed border-ink p-2 sm:grid-cols-[8rem_1fr_1.4fr_auto]">
                  <select
                    aria-label="JOIN-এর ধরন"
                    value={j.type}
                    onChange={(e) => up("joins", s.joins.map((x, k) => (k === i ? { ...x, type: e.target.value as JoinRow["type"] } : x)))}
                    className={`${input} py-1.5 text-sm`}
                  >
                    <option value="JOIN">JOIN</option>
                    <option value="LEFT JOIN">LEFT JOIN</option>
                  </select>
                  <input
                    aria-label="টেবিল আর alias"
                    value={j.table}
                    onChange={(e) => up("joins", s.joins.map((x, k) => (k === i ? { ...x, table: e.target.value } : x)))}
                    placeholder="orders o"
                    spellCheck={false}
                    className={`${input} py-1.5 text-sm`}
                  />
                  <input
                    aria-label="জোড়ার শর্ত"
                    value={j.on}
                    onChange={(e) => up("joins", s.joins.map((x, k) => (k === i ? { ...x, on: e.target.value } : x)))}
                    placeholder="o.cust_id = c.cust_id"
                    spellCheck={false}
                    className={`${input} py-1.5 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => up("joins", s.joins.filter((_, k) => k !== i))}
                    aria-label="এই জোড়া মোছো"
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
                <Plus className="size-3.5" aria-hidden /> টেবিল জোড়ো
              </button>
              <p className="text-xs text-muted">যার কিছু নেই তাকেও রাখতে হলে LEFT JOIN।</p>
            </div>
          </div>

          <SmallField label="প্রতি Row-এর শর্ত (WHERE)" area hint="যোগ/গোনার আগে ছাঁকা: শহর, তারিখ, বিভাগ…" value={s.where} onChange={(v) => up("where", v)} placeholder="c.city = 'Dhaka'" />
          <div className="grid gap-3 sm:grid-cols-3">
            <SmallField label="দল (GROUP BY)" hint="&ldquo;প্রতি ___&rdquo;" value={s.group} onChange={(v) => up("group", v)} placeholder="c.cust_id, c.cname" />
            <SmallField label="দলের শর্ত (HAVING)" hint="হিসাবের ওপর শর্ত" value={s.having} onChange={(v) => up("having", v)} placeholder="SUM(...) > 40000" />
            <SmallField label="সাজানো (ORDER BY)" hint="&ldquo;sorted by&rdquo;" value={s.order} onChange={(v) => up("order", v)} placeholder="total DESC" />
          </div>
        </Step>

        <Step n={3} title="হাতে উত্তর বানাও" hint="Query লেখার আগে ডেটা দেখে নিজে উত্তর লেখো। পরে এর সাথেই মেলাবে।" done={!!s.hand.trim()}>
          <SmallField label="হাতের উত্তর" area text value={s.hand} onChange={(v) => up("hand", v)} placeholder="কে কে আসবে, কত" />
          <SmallField label="যা ধরে নিয়েছি" area text hint="অস্পষ্ট জায়গা: > নাকি >=? রিটেক গুনব কি না? খাতায় এটাও লেখো।" value={s.assume} onChange={(v) => up("assume", v)} placeholder="&quot;after&quot; মানে ঐ দিন বাদ" />
        </Step>

        <Step n={6} title="ফাঁদ যাচাই" hint="চালানোর পর প্রতিটা নিজেকে জিজ্ঞেস করে টিক দাও।" done={s.checks.length === TRAPS.length}>
          <ul className="space-y-1.5">
            {TRAPS.map((t) => (
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

      <div className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:self-start xl:overflow-y-auto xl:pb-2 xl:pr-1">
        <div className="brut-sm bg-yellow-soft p-4 text-sm leading-relaxed">
          <p className="font-h3 text-base">ধাপ ৪ আর ৫: ছোট ধাপে চালাও, মেলাও</p>
          <p className="mt-1">
            ঘর ভরার সাথে সাথে নিচে Query তৈরি হয়। প্রথমে শুধু FROM আর JOIN ভরে চালাও, Row গোনো; তারপর WHERE, তারপর দল। প্রতিবার হাতের উত্তরের সাথে মেলাও।
          </p>
        </div>
        <SqlView code={sql} label="ছক থেকে তৈরি Query" />
        <RunBox sql={sql} db={s.db} setDb={(d) => up("db", d)} blocked={!s.from.trim() ? "অন্তত শুরুর টেবিল (FROM) দাও।" : undefined} />
        <div className="brut-sm bg-card p-4">
          <p className="font-h3">খাতায় তোলার জন্য</p>
          <p className="mt-1 text-sm text-muted">পুরো ছক আর Query সাধারণ লেখা হিসেবে কপি হবে।</p>
          <div className="mt-2">
            <CopyButton text={sheetAsText(s, sql)} />
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
          ১. প্রশ্নের সংকেত খোঁজো
        </h2>
        <p className="mt-2 max-w-4xl text-lg">প্রশ্নটা পেস্ট করো। সংকেত-শব্দগুলো দাগানো হবে, আর কোন টেমপ্লেট লাগবে বলে দেবে।</p>
        <div className="mt-5">
          <Scanner onPick={pick} />
        </div>
      </section>

      <section id="templates" aria-labelledby="tpl" className="mt-16">
        <h2 id="tpl" className="flex items-center gap-2 font-h2 text-3xl">
          <Wand2 className="size-7" strokeWidth={2.4} aria-hidden />
          ২. টেমপ্লেটে নাম বসাও
        </h2>
        <p className="mt-2 max-w-4xl text-lg">
          ৯টা নকশায় অ্যাসাইনমেন্টের প্রায় সব প্রশ্ন পড়ে। নকশা বাছো, ঘরে নিজের টেবিল আর Column-এর নাম বসাও, Query তৈরি। আগে একবার &ldquo;উদাহরণ দিয়ে ভরো&rdquo; চেপে দেখো
          কোন ঘরে কী যায়।
        </p>
        <div className="mt-5">
          <Templates active={active} setActive={tab} />
        </div>
      </section>

      <section aria-labelledby="sheet" className="mt-16">
        <h2 id="sheet" className="flex items-center gap-2 font-h2 text-3xl">
          <ArrowDown className="size-7" strokeWidth={2.4} aria-hidden />
          ৩. প্রশ্ন ভাঙার ছক
        </h2>
        <p className="mt-2 max-w-4xl text-lg">
          কোনো টেমপ্লেটে না মিললে, বা বড় প্রশ্ন হলে: লেভেল ৫.১-এর ছয় ধাপ একটা ফর্মে। প্রতিটা ঘর একটা প্রশ্নের উত্তর; ভরতে ভরতে Query নিজেই তৈরি হয়।
        </p>
        <div className="mt-5">
          <BreakdownSheet onOpenPattern={pick} />
        </div>
      </section>
    </>
  );
}
