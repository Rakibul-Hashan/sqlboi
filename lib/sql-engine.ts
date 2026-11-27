"use client";

/**
 * ব্রাউজারের ভেতরে SQL চালানোর ইঞ্জিন (লেভেল ৫.x-এর "চালাও" বোতাম)।
 *
 * ইঞ্জিন: sql.js (SQLite, WebAssembly; MIT লাইসেন্স), public/sqljs/-এ self-hosted।
 * কোনো সার্ভার নেই: পাঠকের Query তার নিজের ব্রাউজারের মেমরিতেই চলে, আর
 * পাতা রিলোড করলে সব মুছে যায়। তাই কোনো নিরাপত্তা-ঝুঁকিও নেই।
 *
 * ডেটার উৎস একটাই: public/sql/assignment/<db>.sql (MySQL ফাইল, পাঠক যেটা নামায়)।
 * ব্রাউজারে লোড করার সময় শুধু MySQL-এর নিজস্ব তিনটা লাইন
 * (DROP/CREATE DATABASE, USE) বাদ দিই; বাকিটা SQLite হুবহু বোঝে।
 */

export type DbName = "join-shop" | "q1-course" | "q2-staff" | "q3-shop" | "q4-emp";

/** Database ফাইল কোথায়: জোন ৫-এরগুলো assignment/-এ, বাকিগুলো sql/-এ */
export const DB_PATH: Record<DbName, string> = {
  "join-shop": "/sql/join-shop.sql",
  "q1-course": "/sql/assignment/q1-course.sql",
  "q2-staff": "/sql/assignment/q2-staff.sql",
  "q3-shop": "/sql/assignment/q3-shop.sql",
  "q4-emp": "/sql/assignment/q4-emp.sql",
};

export interface ResultSet {
  columns: string[];
  rows: unknown[][];
}

export interface RunOutput {
  /** যে স্টেটমেন্টগুলো Row ফেরত দিয়েছে, ক্রমানুসারে */
  sets: ResultSet[];
  /** কয়টা স্টেটমেন্ট চলেছে (CREATE VIEW-এর মতো ফলাফলহীনগুলো সহ) */
  statements: number;
  error?: string;
  ms: number;
}

/* sql.js-এর যতটুকু আমরা ব্যবহার করি, শুধু ততটুকুর টাইপ */
interface SqlJsStatic {
  Database: new () => SqlJsDatabase;
}
interface SqlJsStatement {
  getColumnNames(): string[];
  step(): boolean;
  get(): unknown[];
  free(): boolean;
}
export interface SqlJsDatabase {
  exec(sql: string): { columns: string[]; values: unknown[][] }[];
  iterateStatements(sql: string): Iterable<SqlJsStatement>;
  create_function(name: string, fn: (...args: unknown[]) => unknown): void;
  close(): void;
}
type InitSqlJs = (cfg: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;

const BASE = "/sqljs/";
let enginePromise: Promise<SqlJsStatic> | null = null;
const seedCache = new Map<DbName, Promise<string>>();

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-sqljs]`);
    if (existing) {
      if ((window as unknown as { initSqlJs?: InitSqlJs }).initSqlJs) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("ইঞ্জিন লোড হয়নি")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.sqljs = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("ইঞ্জিন লোড হয়নি"));
    document.head.appendChild(s);
  });
}

/** ইঞ্জিন একবারই নামে (~৭০০ KB), প্রথমবার কেউ "চালাও" চাপলে */
export function loadEngine(): Promise<SqlJsStatic> {
  if (!enginePromise) {
    enginePromise = loadScript(`${BASE}sql-wasm.js`)
      .then(() => {
        const init = (window as unknown as { initSqlJs?: InitSqlJs }).initSqlJs;
        if (!init) throw new Error("ইঞ্জিন লোড হয়নি");
        return init({ locateFile: (f) => BASE + f });
      })
      .catch((e) => {
        enginePromise = null; // পরের বার আবার চেষ্টা করা যাবে
        throw e;
      });
  }
  return enginePromise;
}

/** MySQL ফাইল থেকে SQLite-এ চলার মতো স্ক্রিপ্ট */
export function toSqliteSeed(mysql: string): string {
  return mysql.replace(/^\s*(DROP DATABASE|CREATE DATABASE|USE)\b[^;]*;/gim, "");
}

function loadSeed(db: DbName): Promise<string> {
  let p = seedCache.get(db);
  if (!p) {
    p = fetch(DB_PATH[db])
      .then((r) => {
        if (!r.ok) throw new Error(`ডেটাবেস ফাইল পাওয়া যায়নি (${r.status})`);
        return r.text();
      })
      .then(toSqliteSeed)
      .catch((e) => {
        seedCache.delete(db);
        throw e;
      });
    seedCache.set(db, p);
  }
  return p;
}

/** MySQL-এর কয়েকটা পরিচিত Date Function, যাতে বইয়ের Query হুবহু চলে */
function addMysqlFunctions(db: SqlJsDatabase) {
  const part = (start: number, end: number) => (d: unknown) => {
    if (d === null || d === undefined) return null;
    const n = Number(String(d).slice(start, end));
    return Number.isFinite(n) ? n : null;
  };
  db.create_function("YEAR", part(0, 4));
  db.create_function("MONTH", part(5, 7));
  db.create_function("DAY", part(8, 10));
}

/** সম্পূর্ণ নতুন, ভরা Database (প্রতিটা "চালাও"-এ আলাদা, যাতে আগের কিছু প্রভাব না ফেলে) */
export async function freshDatabase(name: DbName): Promise<SqlJsDatabase> {
  const [SQL, seed] = await Promise.all([loadEngine(), loadSeed(name)]);
  const db = new SQL.Database();
  addMysqlFunctions(db);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(seed);
  return db;
}

/**
 * MySQL-এর যে লেখাগুলো SQLite বোঝে না, সেগুলো সমতুল্য রূপে বদলায়।
 * শুধু সেগুলোই, যেগুলো এই অধ্যায়ের সমাধানে আসে; বাকি সব হুবহু যায়।
 */
export function mysqlToSqlite(sql: string): string {
  return sql.replace(/CREATE\s+OR\s+REPLACE\s+VIEW\s+([`"\w]+)/gi, "DROP VIEW IF EXISTS $1; CREATE VIEW $1");
}

/** SQLite-এর ইংরেজি error-গুলো একটু বোধগম্য করা */
function explainError(msg: string): string {
  const m = msg.replace(/^Error:\s*/, "");
  if (/no such table: (\S+)/i.test(m)) return `${m}\n→ টেবিলের নাম ঠিক আছে তো? এই Database-এর টেবিলগুলো ওপরে দেওয়া আছে।`;
  if (/no such column: (\S+)/i.test(m)) return `${m}\n→ Column-এর নাম বা টেবিলের alias (যেমন s.name) মিলিয়ে দেখো।`;
  if (/ambiguous column name/i.test(m)) return `${m}\n→ দুই টেবিলেই এই নামের Column আছে; সামনে টেবিলের নাম বা alias দাও।`;
  if (/misuse of aggregate/i.test(m)) return `${m}\n→ SUM/COUNT/AVG WHERE-এ বসে না; দলের শর্ত HAVING-এ লেখো।`;
  if (/syntax error/i.test(m)) return `${m}\n→ কমা, বন্ধনী বা উদ্ধৃতিচিহ্ন বাদ পড়েছে কি না দেখো।`;
  if (/already exists/i.test(m)) return `${m}\n→ "রিসেট" চাপো, অথবা CREATE OR REPLACE VIEW লেখো।`;
  return m;
}

/**
 * একটা Database-এ এক বা একাধিক স্টেটমেন্ট চালায়।
 * iterateStatements ব্যবহার করি যাতে শূন্য Row-এর SELECT-ও Column-এর নামসহ ফেরত আসে
 * ("কেউ নেই" আর "কিছুই চলেনি" আলাদা করে দেখানো যায়)।
 */
export function runOn(db: SqlJsDatabase, sql: string): RunOutput {
  const t0 = performance.now();
  const sets: ResultSet[] = [];
  let statements = 0;
  try {
    for (const stmt of db.iterateStatements(mysqlToSqlite(sql))) {
      statements++;
      try {
        const columns = stmt.getColumnNames();
        const rows: unknown[][] = [];
        while (stmt.step()) rows.push(stmt.get());
        if (columns.length) sets.push({ columns, rows });
      } finally {
        stmt.free();
      }
    }
    return { sets, statements, ms: performance.now() - t0 };
  } catch (e) {
    return { sets, statements, error: explainError(e instanceof Error ? e.message : String(e)), ms: performance.now() - t0 };
  }
}

/** দেখানোর জন্য মান: NULL আলাদা, দশমিক সর্বোচ্চ ৪ ঘর */
export function formatCell(v: unknown): { text: string; isNull: boolean; isNum: boolean } {
  if (v === null || v === undefined) return { text: "NULL", isNull: true, isNum: false };
  if (typeof v === "number") {
    const text = Number.isInteger(v) ? String(v) : String(Math.round(v * 10000) / 10000);
    return { text, isNull: false, isNum: true };
  }
  if (v instanceof Uint8Array) return { text: `[${v.length} bytes]`, isNull: false, isNum: false };
  return { text: String(v), isNull: false, isNum: false };
}
