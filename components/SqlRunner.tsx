"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Database, Download, LoaderCircle, Pencil, Play, RotateCcw, Table2, X } from "lucide-react";
import { DB_PATH, formatCell, freshDatabase, runOn, type DbName, type RunOutput, type SqlJsDatabase } from "@/lib/sql-engine";
import { toBn } from "@/lib/levels";

export const DB_INFO: Record<DbName, { label: string; tables: string[] }> = {
  "join-shop": { label: "জোড়ার দোকান", tables: ["customers", "orders", "products", "employees", "sizes"] },
  "q1-course": { label: "কোর্স রেজিস্ট্রেশন", tables: ["student", "course", "registered"] },
  "q2-staff": { label: "স্টাফ আর ব্রাঞ্চ", tables: ["Staff", "Branch"] },
  "q3-shop": { label: "অনলাইন শপ", tables: ["customer", "product", "orders"] },
  "q4-emp": { label: "Emp আর Dept", tables: ["Emp", "Dept"] },
};

/* ---------- ফলাফল দেখানো ---------- */

function ResultTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  // যে Column-এর সব মান সংখ্যা (বা NULL), তার শিরোনামও ডানে, যাতে সংখ্যার ঠিক ওপরে বসে
  const numeric = columns.map((_, j) => rows.some((r) => typeof r[j] === "number") && rows.every((r) => r[j] === null || typeof r[j] === "number"));
  return (
    <div className="max-h-[26rem] overflow-auto rounded-lg border-[2.5px] border-ink bg-card">
      <table className="w-full border-collapse font-code text-[0.9rem] leading-relaxed xl:text-[0.98rem]">
        <thead className="sticky top-0 bg-yellow-soft">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={`border-b-[2.5px] border-ink px-3 py-1.5 font-h3 text-sm whitespace-nowrap ${numeric[i] ? "text-right" : "text-left"}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-dashed border-grid last:border-0 even:bg-paper">
              {r.map((v, j) => {
                const f = formatCell(v);
                return (
                  <td key={j} className={`px-3 py-1 whitespace-nowrap ${f.isNum ? "text-right tabular-nums" : ""} ${f.isNull ? "italic text-muted" : ""}`}>
                    {f.text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResultPanel({ out, onClose }: { out: RunOutput; onClose?: () => void }) {
  const ms = out.ms < 1 ? "<১" : toBn(Math.round(out.ms));
  return (
    <div className="mt-3 space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-h3">
          {out.error ? "Error" : out.sets.length ? "ফলাফল" : "চলেছে"}
          <span className="ml-2 font-body text-muted">
            {toBn(out.statements)}টা স্টেটমেন্ট · {ms} ms
          </span>
        </span>
        {onClose && (
          <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-h3 text-xs hover:bg-yellow-soft">
            <X className="size-3.5" strokeWidth={2.6} aria-hidden /> বন্ধ
          </button>
        )}
      </div>

      {out.sets.map((s, i) => (
        <div key={i} className="space-y-1.5">
          {out.sets.length > 1 && <p className="font-h3 text-xs text-muted">ফলাফল {toBn(i + 1)}</p>}
          {s.rows.length ? (
            <ResultTable columns={s.columns} rows={s.rows} />
          ) : (
            <div className="rounded-lg border-[2.5px] border-dashed border-ink bg-paper px-3 py-2 text-sm">
              <span className="font-code text-xs text-muted">{s.columns.join(" | ")}</span>
              <p className="mt-1">কোনো Row আসেনি (০টা Row)। প্রশ্নের শর্ত মানে এমন কেউ নেই, নয়তো শর্তে ভুল আছে।</p>
            </div>
          )}
          {s.rows.length > 0 && <p className="text-right text-xs text-muted">{toBn(s.rows.length)}টা Row</p>}
        </div>
      ))}

      {!out.error && out.sets.length === 0 && (
        <p className="rounded-lg border-[2.5px] border-ink bg-green-soft px-3 py-2 text-sm">
          ঠিকঠাক চলেছে, তবে কোনো টেবিল ফেরত আসেনি (যেমন <code>CREATE VIEW</code>)। দেখতে হলে নিচে একটা <code>SELECT</code> যোগ করো।
        </p>
      )}

      {out.error && (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border-[2.5px] border-ink bg-err-soft px-3 py-2 font-code text-[0.85rem] text-err">
          {out.error}
        </pre>
      )}
    </div>
  );
}

/* ---------- ছোট বোতাম ---------- */

function Btn({
  onClick,
  children,
  primary,
  disabled,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`brut-sm press press-sm inline-flex min-h-9 items-center gap-1.5 px-3 py-1 font-h3 text-sm disabled:cursor-wait disabled:opacity-70 ${
        primary ? "bg-green" : "bg-card"
      }`}
    >
      {children}
    </button>
  );
}

function Editor({
  value,
  onChange,
  onRun,
  id,
  minRows = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  id: string;
  minRows?: number;
}) {
  const rows = Math.max(minRows, Math.min(24, value.split("\n").length + 1));
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          onRun();
        }
        // Tab চাপলে ফোকাস না সরে দুই স্পেস বসুক
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          const t = e.currentTarget;
          const { selectionStart: a, selectionEnd: b } = t;
          const next = value.slice(0, a) + "  " + value.slice(b);
          onChange(next);
          requestAnimationFrame(() => t.setSelectionRange(a + 2, a + 2));
        }
      }}
      rows={rows}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      className="block w-full resize-y rounded-lg border-[2.5px] border-ink bg-card px-3 py-2.5 font-code text-[0.95rem] leading-relaxed outline-none xl:text-[1.02rem] focus-visible:ring-4 focus-visible:ring-blue/40"
    />
  );
}

/* ---------- কোড ব্লকের নিচের "চালাও" ---------- */

/** প্রতিটা চালানো নতুন Database-এ, যাতে উত্তর সবসময় বইয়ের সাথে মেলে */
export function SqlRunner({ db, code }: { db: DbName; code: string }) {
  const [out, setOut] = useState<RunOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(code);
  const editorId = useId();

  const run = useCallback(
    async (sql: string) => {
      setBusy(true);
      let database: SqlJsDatabase | null = null;
      try {
        database = await freshDatabase(db);
        setOut(runOn(database, sql));
      } catch (e) {
        setOut({ sets: [], statements: 0, ms: 0, error: `ইঞ্জিন চালু হয়নি: ${e instanceof Error ? e.message : String(e)}\n→ ইন্টারনেট সংযোগ দেখে পাতা রিলোড করো।` });
      } finally {
        database?.close();
        setBusy(false);
      }
    },
    [db]
  );

  return (
    <div className="-mt-2 rounded-b-xl border-[2.5px] border-t-0 border-dashed border-ink bg-paper px-3 pb-3 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Btn primary onClick={() => run(editing ? draft : code)} disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Play className="size-4 fill-ink" strokeWidth={2.4} aria-hidden />}
          {editing ? "বদলানোটা চালাও" : "চালাও"}
        </Btn>
        {editing ? (
          <>
            <Btn onClick={() => setDraft(code)} label="আসল কোডে ফেরত যাও">
              <RotateCcw className="size-4" strokeWidth={2.4} aria-hidden /> আসল কোড
            </Btn>
            <Btn onClick={() => setEditing(false)}>
              <X className="size-4" strokeWidth={2.4} aria-hidden /> এডিটর বন্ধ
            </Btn>
          </>
        ) : (
          <Btn onClick={() => setEditing(true)}>
            <Pencil className="size-4" strokeWidth={2.4} aria-hidden /> বদলে দেখো
          </Btn>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">
          <Database className="size-3.5" strokeWidth={2.4} aria-hidden />
          {DB_INFO[db].label}
        </span>
      </div>

      {editing && (
        <div className="mt-3">
          <label htmlFor={editorId} className="sr-only">
            SQL এডিটর
          </label>
          <Editor id={editorId} value={draft} onChange={setDraft} onRun={() => run(draft)} />
          <p className="mt-1 text-xs text-muted">Ctrl + Enter চাপলেও চলে। প্রতিবার নতুন, ভরা Database-এ চলে; কিছু মুছলেও আসল ডেটা নষ্ট হবে না।</p>
        </div>
      )}

      {out && <ResultPanel out={out} onClose={() => setOut(null)} />}
    </div>
  );
}

/* ---------- খোলা প্লেগ্রাউন্ড ---------- */

/** একটা Database স্থায়ীভাবে খোলা থাকে (View বানিয়ে পরে SELECT করা যায়), "রিসেট" চাপলে নতুন */
export function Playground({ db, initial }: { db: DbName; initial?: string }) {
  const info = DB_INFO[db];
  const [sql, setSql] = useState(initial ?? `SELECT * FROM ${info.tables[0]};`);
  const [out, setOut] = useState<RunOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const dbRef = useRef<SqlJsDatabase | null>(null);
  const editorId = useId();

  useEffect(
    () => () => {
      dbRef.current?.close();
      dbRef.current = null;
    },
    []
  );

  const run = useCallback(
    async (code: string) => {
      setBusy(true);
      try {
        if (!dbRef.current) dbRef.current = await freshDatabase(db);
        setOut(runOn(dbRef.current, code));
      } catch (e) {
        setOut({ sets: [], statements: 0, ms: 0, error: `ইঞ্জিন চালু হয়নি: ${e instanceof Error ? e.message : String(e)}\n→ ইন্টারনেট সংযোগ দেখে পাতা রিলোড করো।` });
      } finally {
        setBusy(false);
      }
    },
    [db]
  );

  function reset() {
    dbRef.current?.close();
    dbRef.current = null;
    setOut(null);
  }

  return (
    <section className="brut bg-blue-soft p-4 sm:p-5" aria-label={`SQL প্লেগ্রাউন্ড: ${info.label}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-h3 text-lg">
          <Database className="size-5" strokeWidth={2.4} aria-hidden />
          প্লেগ্রাউন্ড: {info.label}
        </p>
        <a
          href={DB_PATH[db]}
          download
          className="brut-sm press press-sm inline-flex min-h-9 items-center gap-1.5 bg-card px-3 py-1 font-h3 text-sm !no-underline"
        >
          <Download className="size-4" strokeWidth={2.4} aria-hidden /> {db}.sql
        </a>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">টেবিল দেখো:</span>
        {info.tables.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              const q = `SELECT * FROM ${t};`;
              setSql(q);
              run(q);
            }}
            className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-card px-2 py-0.5 font-code text-xs hover:bg-yellow-soft"
          >
            <Table2 className="size-3.5" strokeWidth={2.4} aria-hidden />
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <label htmlFor={editorId} className="sr-only">
          SQL এডিটর
        </label>
        <Editor id={editorId} value={sql} onChange={setSql} onRun={() => run(sql)} minRows={5} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Btn primary onClick={() => run(sql)} disabled={busy}>
          {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Play className="size-4 fill-ink" strokeWidth={2.4} aria-hidden />}
          চালাও
        </Btn>
        <Btn onClick={reset} label="Database আগের অবস্থায় ফেরত নাও">
          <RotateCcw className="size-4" strokeWidth={2.4} aria-hidden /> রিসেট
        </Btn>
        <span className="text-xs text-muted">Ctrl + Enter · বানানো View রিসেট পর্যন্ত থাকে</span>
      </div>

      {out && <ResultPanel out={out} />}

      <p className="mt-3 text-xs leading-relaxed text-muted">
        ব্রাউজারের ভেতরেই চলে (SQLite ইঞ্জিন, কোনো সার্ভার নেই)। এই অধ্যায়ের সব Query MySQL আর এখানে একই উত্তর দেয়; শুধু দশমিকের ঘর একটু অন্যভাবে
        দেখাতে পারে (MySQL: <code>2.5000</code>, এখানে: <code>2.5</code>)।
      </p>
    </section>
  );
}
