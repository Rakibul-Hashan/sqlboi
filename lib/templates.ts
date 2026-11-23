/**
 * প্রশ্নের নকশা → ফাঁকা-ভরা SQL টেমপ্লেট (/templates পাতা)।
 *
 * প্রতিটা নকশা: কোন সংকেত-শব্দে চিনবে, কোন ঘর ভরতে হবে, অ্যাসাইনমেন্ট থেকে
 * নেওয়া তৈরি উদাহরণ (preset), আর ঘরের মান থেকে SQL বানানোর ফাংশন।
 * খালি ঘর আউটপুটে ‹ঘরের নাম› হয়ে থাকে, যাতে বোঝা যায় কী বাকি।
 * সব preset লেভেল ৫.২–৫.৫-এর Database-এ চালিয়ে যাচাই করা।
 */

import type { DbName } from "./sql-engine";

export type FieldType = "text" | "area" | "select" | "toggle";

export interface Field {
  key: string;
  label: string;
  /** ঘরের নিচে ছোট ব্যাখ্যা */
  hint?: string;
  placeholder?: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  /** খালি থাকলে চলে (আউটপুট থেকে ওই অংশটাই বাদ যায়) */
  optional?: boolean;
  /** একই সারিতে পাশাপাশি বসানোর জন্য ছোট ঘর */
  short?: boolean;
}

export interface Preset {
  label: string;
  db: DbName;
  values: Record<string, string>;
}

export interface Built {
  sql: string;
  /** দ্বিতীয় উপায় (তুলনা বা যাচাইয়ের জন্য) */
  alt?: { title: string; sql: string };
  /** Relational Algebra-য় একই কথা (যেখানে সহজে লেখা যায়) */
  algebra?: string;
  /** এই নকশার ফাঁদ, ঘরের মান অনুযায়ী */
  warnings: string[];
}

export interface Pattern {
  id: string;
  title: string;
  /** এক লাইনে: কখন এটা */
  when: string;
  /** প্রশ্নে যে শব্দ দেখলে এটা (দেখানোর জন্য) */
  triggers: string[];
  /** প্রতি Row-তে সাধারণত কী আসে */
  grain: string;
  fields: Field[];
  presets: Preset[];
  build: (v: Vals) => Built;
}

/** ঘরের মান পড়ার সাহায্যকারী: খালি হলে ‹label›, আর কোনগুলো খালি তার তালিকা রাখে */
export class Vals {
  readonly missing: string[] = [];
  constructor(
    private readonly values: Record<string, string>,
    private readonly fields: Field[]
  ) {}
  raw(key: string): string {
    return (this.values[key] ?? "").trim();
  }
  has(key: string): boolean {
    return this.raw(key) !== "";
  }
  on(key: string): boolean {
    return this.raw(key) === "1";
  }
  get(key: string): string {
    const v = this.raw(key);
    if (v) return v;
    const f = this.fields.find((x) => x.key === key);
    if (f && !f.optional) {
      if (!this.missing.includes(f.label)) this.missing.push(f.label);
      return `‹${f.label}›`;
    }
    return "";
  }
}

/** "s.student_id, s.name" → "student_id, name" (Algebra-র Projection-এর জন্য) */
const stripAlias = (cols: string) =>
  cols
    .split(",")
    .map((c) => c.trim().replace(/^[\w‹›]+\./, ""))
    .filter(Boolean)
    .join(", ");

const indent = (s: string, n: number) =>
  s
    .split("\n")
    .map((l) => " ".repeat(n) + l)
    .join("\n");

/* ------------------------------------------------------------------ */

const OPS = [
  { value: ">", label: "> (বেশি)" },
  { value: ">=", label: ">= (বেশি বা সমান)" },
  { value: "<", label: "< (কম)" },
  { value: "<=", label: "<= (কম বা সমান)" },
  { value: "=", label: "= (সমান)" },
];

export const patterns: Pattern[] = [
  /* ---------------- অন্তত একটা ---------------- */
  {
    id: "exists",
    title: "অন্তত একটা আছে",
    when: "যাদের সাথে মিলে-যাওয়া অন্তত একটা Row অন্য টেবিলে আছে",
    triggers: ["at least one", "any", "who has ordered", "who has registered", "অন্তত একটা"],
    grain: "মূল টেবিলের একজন (যেমন একজন ছাত্র), একবার",
    fields: [
      { key: "main", label: "মূল টেবিল", hint: "উত্তরের প্রতি Row যা: student, customer…", placeholder: "student", short: true },
      { key: "ma", label: "মূলের alias", placeholder: "s", short: true },
      { key: "mainKey", label: "মূলের চাবি", hint: "Primary Key", placeholder: "student_id", short: true },
      { key: "show", label: "দেখাবে", hint: "alias সহ, কমা দিয়ে", placeholder: "s.student_id, s.name" },
      { key: "bridge", label: "কাজের টেবিল", hint: "যেখানে কাজটা লেখা: registered, orders…", placeholder: "registered", short: true },
      { key: "ba", label: "কাজের alias", placeholder: "r", short: true },
      { key: "bridgeFk", label: "কাজের যে Column মূলকে চেনে", placeholder: "student_id", short: true },
      { key: "target", label: "শর্তের টেবিল", hint: "শর্তটা কাজের টেবিলেই থাকলে খালি রাখো", placeholder: "course", optional: true, short: true },
      { key: "ta", label: "শর্তের alias", placeholder: "c", optional: true, short: true },
      { key: "targetOn", label: "জোড়ার শর্ত", placeholder: "c.course_code = r.course_code", optional: true },
      { key: "cond", label: "শর্ত", hint: "যেকোনো SQL শর্ত, Subquery-ও চলে", placeholder: "c.offered_by = 'CSE'", optional: true },
    ],
    presets: [
      {
        label: "প্রশ্ন ১(i): অন্তত একটা CSE কোর্স",
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", show: "s.student_id, s.name", bridge: "registered", ba: "r", bridgeFk: "student_id", target: "course", ta: "c", targetOn: "c.course_code = r.course_code", cond: "c.offered_by = 'CSE'" },
      },
      {
        label: "প্রশ্ন ৩(iii): সবচেয়ে দামি পণ্যের ক্রেতা",
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", show: "c.cname, c.city", bridge: "orders", ba: "o", bridgeFk: "cust_id", target: "product", ta: "p", targetOn: "p.prod_id = o.prod_id", cond: "p.price = (SELECT MAX(price) FROM product)" },
      },
    ],
    build(v) {
      const ma = v.get("ma"), ba = v.get("ba");
      const hasT = v.has("target");
      const join = hasT ? `\n  JOIN ${v.get("target")} ${v.raw("ta")} ON ${v.has("targetOn") ? v.raw("targetOn") : "‹জোড়ার শর্ত›"}` : "";
      const cond = v.has("cond") ? `\n    AND ${v.raw("cond")}` : "";
      const sql = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${ma}
WHERE EXISTS (
  SELECT 1
  FROM ${v.get("bridge")} ${ba}${join}
  WHERE ${ba}.${v.get("bridgeFk")} = ${ma}.${v.get("mainKey")}${cond}
);`;
      const alt = `SELECT DISTINCT ${v.get("show")}
FROM ${v.get("main")} ${ma}
JOIN ${v.get("bridge")} ${ba} ON ${ba}.${v.get("bridgeFk")} = ${ma}.${v.get("mainKey")}${hasT ? `\nJOIN ${v.get("target")} ${v.raw("ta")} ON ${v.raw("targetOn") || "‹জোড়ার শর্ত›"}` : ""}${v.has("cond") ? `\nWHERE ${v.raw("cond")}` : ""};`;
      const warnings = [
        "শর্তটা কোন টেবিলের Column-এর ওপর, আবার দেখো (ছাত্রের বিভাগ বনাম কোর্সের বিভাগ)।",
        "JOIN দিয়ে লিখলে DISTINCT লাগবে; EXISTS-এ লাগে না।",
      ];
      if (/MAX|MIN/i.test(v.raw("cond"))) warnings.push("সর্বোচ্চ/সর্বনিম্ন: `= (SELECT MAX(...))` সমান মানের সবাইকে রাখে। ORDER BY … LIMIT 1 দিয়ো না।");
      return { sql, alt: { title: "JOIN + DISTINCT দিয়ে", sql: alt }, warnings };
    },
  },

  /* ---------------- কখনো না ---------------- */
  {
    id: "not-exists",
    title: "কখনো না / একটাও নেই",
    when: "যাদের সাথে মিলে-যাওয়া কোনো Row অন্য টেবিলে নেই",
    triggers: ["never", "has not", "did not", "no order", "not registered", "কখনো না"],
    grain: "মূল টেবিলের একজন",
    fields: [
      { key: "main", label: "মূল টেবিল", placeholder: "customer", short: true },
      { key: "ma", label: "মূলের alias", placeholder: "c", short: true },
      { key: "mainKey", label: "মূলের চাবি", placeholder: "cust_id", short: true },
      { key: "show", label: "দেখাবে", placeholder: "c.cust_id, c.cname" },
      { key: "bridge", label: "কাজের টেবিল", placeholder: "orders", short: true },
      { key: "ba", label: "কাজের alias", placeholder: "o", short: true },
      { key: "bridgeFk", label: "কাজের যে Column মূলকে চেনে", placeholder: "cust_id", short: true },
      { key: "cond", label: "কাজের ওপর বাড়তি শর্ত", hint: "যেমন \"২০২৫-এ কখনো না\"", placeholder: "o.order_date >= '2025-01-01'", optional: true },
    ],
    presets: [
      {
        label: "প্রশ্ন ৩(i): কখনো অর্ডার দেননি",
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", show: "c.cust_id, c.cname", bridge: "orders", ba: "o", bridgeFk: "cust_id", cond: "" },
      },
      {
        label: "কেউ কেনেনি এমন পণ্য",
        db: "q3-shop",
        values: { main: "product", ma: "p", mainKey: "prod_id", show: "p.prod_id, p.pname", bridge: "orders", ba: "o", bridgeFk: "prod_id", cond: "" },
      },
      {
        label: "যে ছাত্র কোনো কোর্স নেয়নি",
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", show: "s.student_id, s.name", bridge: "registered", ba: "r", bridgeFk: "student_id", cond: "" },
      },
    ],
    build(v) {
      const ma = v.get("ma"), ba = v.get("ba");
      const cond = v.has("cond") ? `\n    AND ${v.raw("cond")}` : "";
      const sql = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${ma}
WHERE NOT EXISTS (
  SELECT 1
  FROM ${v.get("bridge")} ${ba}
  WHERE ${ba}.${v.get("bridgeFk")} = ${ma}.${v.get("mainKey")}${cond}
);`;
      const alt = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${ma}
LEFT JOIN ${v.get("bridge")} ${ba}
       ON ${ba}.${v.get("bridgeFk")} = ${ma}.${v.get("mainKey")}${v.has("cond") ? `\n      AND ${v.raw("cond")}` : ""}
WHERE ${ba}.${v.get("bridgeFk")} IS NULL;`;
      const key = v.get("mainKey"), fk = v.get("bridgeFk");
      const right = key === fk ? `π ${fk} (${v.get("bridge")})` : `ρ ${key}/${fk} (π ${fk} (${v.get("bridge")}))`;
      const algebra = `π ${stripAlias(v.get("show"))} ( ${v.get("main")} ⋈ ( π ${key} (${v.get("main")}) − ${right} ) )`;
      const warnings = [
        "NOT IN (SELECT …) দিয়ো না যদি ভেতরের Column-এ NULL থাকতে পারে: তখন কেউ আসে না।",
        "Algebra-য় বিয়োগের দুই পাশে একই Column লাগে (Union Compatibility): আগে শুধু চাবিতে বিয়োগ, তারপর ⋈ করে নাম।",
      ];
      if (v.has("cond")) warnings.push("LEFT JOIN রূপে বাড়তি শর্ত ON-এ থাকবে, WHERE-এ না; নাহলে LEFT JOIN আবার INNER হয়ে যায়।");
      return { sql, alt: { title: "LEFT JOIN … IS NULL দিয়ে", sql: alt }, algebra, warnings };
    },
  },

  /* ---------------- প্রতিটা (Division) ---------------- */
  {
    id: "division",
    title: "প্রতিটা / সবগুলো (Division)",
    when: "একটা পুরো সেটের সবগুলোর সাথেই যার মিল আছে",
    triggers: ["every", "all the courses", "each of the", "প্রতিটা", "সবগুলো"],
    grain: "মূল টেবিলের একজন",
    fields: [
      { key: "main", label: "মূল টেবিল", placeholder: "student", short: true },
      { key: "ma", label: "মূলের alias", placeholder: "s", short: true },
      { key: "mainKey", label: "মূলের চাবি", placeholder: "student_id", short: true },
      { key: "show", label: "দেখাবে", placeholder: "s.student_id, s.name" },
      { key: "set", label: "সেটের টেবিল", hint: "\"প্রতিটা ___\": course, product…", placeholder: "course", short: true },
      { key: "sa", label: "সেটের alias", placeholder: "c", short: true },
      { key: "setKey", label: "সেটের চাবি", placeholder: "course_code", short: true },
      { key: "setCond", label: "কোন সেট", hint: "সেটটা ছাঁকার শর্ত", placeholder: "c.instructor = 'Dr. Rahman'", optional: true },
      { key: "bridge", label: "কাজের টেবিল", placeholder: "registered", short: true },
      { key: "ba", label: "কাজের alias", placeholder: "r", short: true },
      { key: "bMain", label: "কাজের যে Column মূলকে চেনে", placeholder: "student_id", short: true },
      { key: "bSet", label: "কাজের যে Column সেটকে চেনে", placeholder: "course_code", short: true },
    ],
    presets: [
      {
        label: "প্রশ্ন ১(ii): Dr. Rahman-এর প্রতিটা কোর্স",
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", show: "s.student_id, s.name", set: "course", sa: "c", setKey: "course_code", setCond: "c.instructor = 'Dr. Rahman'", bridge: "registered", ba: "r", bMain: "student_id", bSet: "course_code" },
      },
      {
        label: "সবচেয়ে দামি সবগুলো পণ্যই কিনেছেন",
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", show: "c.cust_id, c.cname", set: "product", sa: "p", setKey: "prod_id", setCond: "p.price = (SELECT MAX(price) FROM product)", bridge: "orders", ba: "o", bMain: "cust_id", bSet: "prod_id" },
      },
    ],
    build(v) {
      const ma = v.get("ma"), sa = v.get("sa"), ba = v.get("ba");
      const setWhere = v.has("setCond") ? `${v.raw("setCond")}\n    AND ` : "";
      const sql = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${ma}
WHERE NOT EXISTS (                -- এমন কোনো ${v.raw("set") || "সদস্য"} নেই…
  SELECT 1
  FROM ${v.get("set")} ${sa}
  WHERE ${setWhere}NOT EXISTS (     -- …যেটা এর সাথে নেই
      SELECT 1
      FROM ${v.get("bridge")} ${ba}
      WHERE ${ba}.${v.get("bMain")} = ${ma}.${v.get("mainKey")}
        AND ${ba}.${v.get("bSet")} = ${sa}.${v.get("setKey")}
    )
);`;
      const setCount = `SELECT COUNT(*) FROM ${v.get("set")}${v.has("setCond") ? ` ${sa} WHERE ${v.raw("setCond")}` : ""}`;
      const alt = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${ma}
JOIN ${v.get("bridge")} ${ba} ON ${ba}.${v.get("bMain")} = ${ma}.${v.get("mainKey")}
JOIN ${v.get("set")} ${sa}    ON ${sa}.${v.get("setKey")} = ${ba}.${v.get("bSet")}${v.has("setCond") ? `\nWHERE ${v.raw("setCond")}` : ""}
GROUP BY ${v.get("show")}
HAVING COUNT(DISTINCT ${ba}.${v.get("bSet")}) = (${setCount});`;
      return {
        sql,
        alt: { title: "গুনে মেলানো (COUNT DISTINCT)", sql: alt },
        warnings: [
          "গুনে মেলালে COUNT(DISTINCT …) লাগবে; একই জিনিস দুবার থাকলে (রিটেক) COUNT(*) ভুল উত্তর দেয়।",
          "সেটের শর্তে = লেখো, LIKE '%…%' না: অন্য একই-রকম নামও মিলে যায়।",
          "সেট খালি হলে দুইবার-NOT EXISTS সবাইকে দেয়, গোনার উপায় কাউকে না। দরকার হলে খাতায় লিখে দাও।",
        ],
      };
    },
  },

  /* ---------------- দলের মোট + শর্ত ---------------- */
  {
    id: "group-having",
    title: "প্রতি দলের মোট/গোনা + দলের শর্ত",
    when: "প্রতিটা ক্যাটাগরি/বিভাগ/ব্রাঞ্চের জন্য একটা হিসাব, আর হিসাবের ওপর শর্ত",
    triggers: ["total", "of each category", "per", "how many", "exceeds", "মোট", "প্রতি"],
    grain: "একটা দল (যেমন একটা ক্যাটাগরি)",
    fields: [
      { key: "from", label: "FROM আর JOIN", type: "area", hint: "যে টেবিলগুলো লাগবে, জোড়াসহ", placeholder: "orders o\nJOIN product p ON p.prod_id = o.prod_id" },
      { key: "group", label: "কী ধরে দল", hint: "GROUP BY-এর Column", placeholder: "p.category", short: true },
      { key: "agg", label: "হিসাব", hint: "SUM/COUNT/AVG/MAX/MIN", placeholder: "SUM(p.price * o.quantity)", short: true },
      { key: "aggAs", label: "হিসাবের নাম", placeholder: "total_sales", short: true },
      { key: "where", label: "প্রতি Row-এর শর্ত (WHERE)", hint: "যোগের আগে ছাঁকা: তারিখ, শহর…", placeholder: "o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'", optional: true },
      { key: "op", label: "দলের শর্তের চিহ্ন", type: "select", options: OPS, short: true },
      { key: "val", label: "দলের শর্তের মান (HAVING)", hint: "খালি রাখলে HAVING নেই", placeholder: "50000", optional: true, short: true },
      {
        key: "order",
        label: "সাজানো",
        type: "select",
        short: true,
        options: [
          { value: "desc", label: "হিসাব, বড় আগে" },
          { value: "asc", label: "হিসাব, ছোট আগে" },
          { value: "group", label: "দলের নাম ধরে" },
          { value: "none", label: "সাজানো নেই" },
        ],
      },
    ],
    presets: [
      {
        label: "প্রশ্ন ৩(ii): ২০২৫-এ ক্যাটাগরির বিক্রি > ৫০,০০০",
        db: "q3-shop",
        values: { from: "orders o\nJOIN product p ON p.prod_id = o.prod_id", group: "p.category", agg: "SUM(p.price * o.quantity)", aggAs: "total_sales", where: "o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'", op: ">", val: "50000", order: "desc" },
      },
      {
        label: "প্রতি ব্রাঞ্চে কতজন (৩ জনের বেশি)",
        db: "q2-staff",
        values: { from: "Staff s\nJOIN Branch b ON b.branch_id = s.branch_id", group: "b.bname", agg: "COUNT(*)", aggAs: "staff_count", where: "", op: ">", val: "3", order: "desc" },
      },
    ],
    build(v) {
      const agg = v.get("agg");
      const where = v.has("where") ? `\nWHERE ${v.raw("where").replace(/\s+AND\s+/gi, "\n  AND ")}` : "";
      const having = v.has("val") ? `\nHAVING ${agg} ${v.raw("op") || ">"} ${v.raw("val")}` : "";
      const o = v.raw("order") || "desc";
      const as = v.get("aggAs");
      const order = o === "none" ? "" : o === "group" ? `\nORDER BY ${v.get("group")}` : `\nORDER BY ${as}${o === "desc" ? " DESC" : ""}`;
      const sql = `SELECT ${v.get("group")}, ${agg} AS ${as}
FROM ${v.get("from")}${where}
GROUP BY ${v.get("group")}${having}${order};`;
      const warnings = [
        "প্রতি Row-এর শর্ত (তারিখ, শহর) WHERE-এ; হিসাবের শর্ত (মোট > …) HAVING-এ। SUM/COUNT WHERE-এ বসে না।",
        "\"exceeds\"/\"more than\" মানে >, সমান না।",
        "গুণফলের যোগ: SUM(a * b); SUM(a) * SUM(b) আলাদা জিনিস।",
      ];
      if (/YEAR\s*\(/i.test(v.raw("where"))) warnings.push("YEAR(col) = … ঠিক উত্তর দেয়, কিন্তু Index কাজ করে না; তারিখের পরিসর (>= আর <) ভালো।");
      if (/BETWEEN/i.test(v.raw("where"))) warnings.push("BETWEEN … 'YYYY-12-31' DATETIME Column-এ শেষ দিনের সময়গুলো বাদ দেয়; >= আর < নিরাপদ।");
      return { sql, warnings };
    },
  },

  /* ---------------- নিজের দলের সাথে তুলনা ---------------- */
  {
    id: "own-group",
    title: "নিজের দলের গড়/সর্বোচ্চের সাথে তুলনা",
    when: "প্রত্যেককে তার নিজের ব্রাঞ্চ/বিভাগের হিসাবের সাথে মেলানো",
    triggers: ["his or her own", "own branch", "of the same department", "নিজের"],
    grain: "একজন (যেমন একজন স্টাফ)",
    fields: [
      { key: "table", label: "টেবিল", placeholder: "Staff", short: true },
      { key: "a", label: "alias", placeholder: "s", short: true },
      { key: "show", label: "দেখাবে", placeholder: "s.*" },
      { key: "groupCol", label: "দলের Column", hint: "\"নিজের ___\"", placeholder: "branch_id", short: true },
      { key: "valCol", label: "যে মান তুলনা", placeholder: "salary", short: true },
      { key: "op", label: "চিহ্ন", type: "select", options: OPS, short: true },
      {
        key: "agg",
        label: "দলের কী",
        type: "select",
        short: true,
        options: [
          { value: "AVG", label: "গড় (AVG)" },
          { value: "MAX", label: "সর্বোচ্চ (MAX)" },
          { value: "MIN", label: "সর্বনিম্ন (MIN)" },
        ],
      },
    ],
    presets: [
      {
        label: "প্রশ্ন ২(i): নিজের ব্রাঞ্চের গড়ের চেয়ে বেশি",
        db: "q2-staff",
        values: { table: "Staff", a: "s", show: "s.*", groupCol: "branch_id", valCol: "salary", op: ">", agg: "AVG", view: "above_branch_avg" },
      },
      {
        label: "প্রতি বিভাগে সর্বোচ্চ বেতন যাঁর",
        db: "q4-emp",
        values: { table: "Emp", a: "e", show: "e.ename, e.deptno, e.sal", groupCol: "deptno", valCol: "sal", op: "=", agg: "MAX", view: "" },
      },
    ],
    build(v) {
      const t = v.get("table"), a = v.get("a"), g = v.get("groupCol"), c = v.get("valCol");
      const agg = v.raw("agg") || "AVG", op = v.raw("op") || ">";
      const inner = `${a.replace(/^‹.*›$/, "x")}2`;
      const sql = `SELECT ${v.get("show")}
FROM ${t} ${a}
WHERE ${a}.${c} ${op} (
  SELECT ${agg}(${inner}.${c})
  FROM ${t} ${inner}
  WHERE ${inner}.${g} = ${a}.${g}     -- "নিজের" দল: বাইরের Row-এর সাথে মিল
);`;
      const alt = `SELECT ${v.get("show")}
FROM ${t} ${a}
JOIN (
  SELECT ${g}, ${agg}(${c}) AS grp_val
  FROM ${t}
  GROUP BY ${g}
) g ON g.${g} = ${a}.${g}
WHERE ${a}.${c} ${op} g.grp_val;`;
      return {
        sql,
        alt: { title: "দলের হিসাবের টেবিলের সাথে JOIN", sql: alt },
        warnings: [
          "ভেতরের WHERE (নিজের দল মেলানো) বাদ দিলে পুরো টেবিলের হিসাব আসে: ভুল উত্তর, কোনো error ছাড়া।",
          "\"greater than\" মানে >; গড়ের ঠিক সমান যিনি, তিনি আসবেন না।",
        ],
      };
    },
  },

  /* ---------------- সর্বোচ্চ/সর্বনিম্ন/গড়ের সমান ---------------- */
  {
    id: "extreme",
    title: "সর্বোচ্চ / সর্বনিম্ন / গড়ের সমান",
    when: "পুরো টেবিলের MAX, MIN বা AVG-এর সমান মান যার (সমান হলে সবাই)",
    triggers: ["most expensive", "highest", "maximum", "minimum", "lowest", "equal to the average", "সবচেয়ে"],
    grain: "একজন/একটা, সমান মানের সবাই",
    fields: [
      { key: "table", label: "টেবিল", placeholder: "Emp", short: true },
      { key: "a", label: "alias", placeholder: "e", short: true },
      { key: "col", label: "যে Column", placeholder: "sal", short: true },
      { key: "show", label: "দেখাবে", placeholder: "e.*" },
      { key: "max", label: "সর্বোচ্চ (MAX)", type: "toggle", short: true },
      { key: "min", label: "সর্বনিম্ন (MIN)", type: "toggle", short: true },
      { key: "avg", label: "গড় (AVG)", type: "toggle", short: true },
    ],
    presets: [
      {
        label: "প্রশ্ন ৪(i): MAX, MIN বা AVG-এর সমান",
        db: "q4-emp",
        values: { table: "Emp", a: "e", col: "sal", show: "e.*", max: "1", min: "1", avg: "1", view: "emp_sal_extremes" },
      },
      {
        label: "সবচেয়ে দামি পণ্য (টাইসহ)",
        db: "q3-shop",
        values: { table: "product", a: "p", col: "price", show: "p.prod_id, p.pname, p.price", max: "1", min: "", avg: "", view: "" },
      },
    ],
    build(v) {
      const t = v.get("table"), a = v.get("a"), c = v.get("col");
      const picks = (["max", "min", "avg"] as const).filter((k) => v.on(k));
      const conds = picks.length
        ? picks.map((k) => `${a}.${c} = (SELECT ${k.toUpperCase()}(${c}) FROM ${t})`)
        : [`${a}.${c} = (SELECT ‹MAX/MIN/AVG বাছো›(${c}) FROM ${t})`];
      const sql = `SELECT ${v.get("show")}
FROM ${t} ${a}
WHERE ${conds.join("\n   OR ")};`;
      const alt =
        picks.length > 1
          ? `SELECT ${v.get("show")}
FROM ${t} ${a}
WHERE ${a}.${c} IN (\n${picks.map((k) => `  (SELECT ${k.toUpperCase()}(${c}) FROM ${t})`).join(",\n")}\n);`
          : undefined;
      const warnings = [
        "WHERE col = MAX(col) চলে না (ERROR 1111); আলাদা Subquery লাগে।",
        "ORDER BY … LIMIT 1 সমান মানের একজনকে চুপচাপ বাদ দেয়।",
      ];
      if (picks.length > 1) warnings.push("কয়েকটা শর্ত OR দিয়ে জুড়বে; AND দিলে উত্তর খালি।");
      if (v.on("avg")) warnings.push("গড় প্রায়ই দশমিক (যেমন 4183.33), কারো মানের সমান না হতেই পারে; তখন গড় থেকে কেউ না আসাই সঠিক।");
      return { sql, alt: alt ? { title: "IN দিয়ে ছোট করে", sql: alt } : undefined, warnings };
    },
  },

  /* ---------------- শূন্যসহ গোনা/গড় ---------------- */
  {
    id: "avg-zero",
    title: "শূন্যসহ গোনা / গড়",
    when: "প্রত্যেকে কয়টা করেছে (যারা কিছুই করেনি তারাও ০), বা তার গড়",
    triggers: ["average number of", "must still be counted", "including those", "per student", "শূন্যসহ"],
    grain: "প্রতি জন, বা পুরো উত্তর একটা সংখ্যা",
    fields: [
      { key: "main", label: "যাদের গুনবে", hint: "শূন্যরাও এই টেবিলে আছে", placeholder: "student", short: true },
      { key: "ma", label: "alias", placeholder: "s", short: true },
      { key: "mainKey", label: "চাবি", placeholder: "student_id", short: true },
      { key: "extra", label: "সাথে দেখাবে", hint: "শুধু \"প্রতি জনের সংখ্যা\"-তে; যেমন নাম", placeholder: "s.name", optional: true, short: true },
      { key: "bridge", label: "কাজের টেবিল", placeholder: "registered", short: true },
      { key: "ba", label: "কাজের alias", placeholder: "r", short: true },
      { key: "bridgeFk", label: "কাজের যে Column মূলকে চেনে", placeholder: "student_id", short: true },
      { key: "countCol", label: "কী গুনবে", hint: "কাজের টেবিলের একটা NOT NULL Column", placeholder: "course_code", short: true },
      { key: "distinct", label: "আলাদা আলাদা গুনবে (DISTINCT)", type: "toggle", short: true },
      {
        key: "mode",
        label: "উত্তর",
        type: "select",
        short: true,
        options: [
          { value: "avg", label: "সবার গড় (একটা সংখ্যা)" },
          { value: "each", label: "প্রতি জনের সংখ্যা" },
        ],
      },
    ],
    presets: [
      {
        label: "প্রশ্ন ১(iii): ছাত্রপ্রতি গড় কোর্স",
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", extra: "", bridge: "registered", ba: "r", bridgeFk: "student_id", countCol: "course_code", distinct: "", mode: "avg" },
      },
      {
        label: "প্রতি ক্রেতার অর্ডার সংখ্যা (০ সহ)",
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", extra: "c.cname", bridge: "orders", ba: "o", bridgeFk: "cust_id", countCol: "order_id", distinct: "", mode: "each" },
      },
    ],
    build(v) {
      const ma = v.get("ma"), ba = v.get("ba"), key = v.get("mainKey");
      const cnt = `COUNT(${v.on("distinct") ? "DISTINCT " : ""}${ba}.${v.get("countCol")})`;
      const isAvg = (v.raw("mode") || "avg") === "avg";
      const extra = !isAvg && v.has("extra") ? `, ${v.raw("extra")}` : "";
      const per = `SELECT ${ma}.${key}${extra}, ${cnt} AS cnt
FROM ${v.get("main")} ${ma}
LEFT JOIN ${v.get("bridge")} ${ba} ON ${ba}.${v.get("bridgeFk")} = ${ma}.${key}
GROUP BY ${ma}.${key}${extra}`;
      const sql =
        isAvg
          ? `SELECT AVG(cnt) AS avg_per_${v.raw("main") || "row"}
FROM (
${indent(per, 2)}
) AS per_row;`
          : `${per}\nORDER BY cnt DESC;`;
      return {
        sql,
        warnings: [
          "শুরু করো যাদের গুনবে সেই টেবিল থেকে, আর LEFT JOIN: নাহলে শূন্যরা হারিয়ে যায়।",
          "COUNT(*) না, COUNT(ডান টেবিলের Column): LEFT JOIN-এর NULL-Row COUNT(*)-এ ১ গোনা হয়।",
          "একই জিনিস দুবার থাকতে পারলে (রিটেক) DISTINCT চাই কি না ঠিক করো, খাতায় লিখে দাও।",
        ],
      };
    },
  },

  /* ---------------- Self Join ---------------- */
  {
    id: "self-join",
    title: "একই টেবিলে বস/ম্যানেজারের নাম",
    when: "একটা Column একই টেবিলের আরেকজনকে চেনায় (supervisor_id, mgr)",
    triggers: ["supervisor", "manager", "together with the name of", "বস"],
    grain: "প্রতি জন একবার",
    fields: [
      { key: "table", label: "টেবিল", placeholder: "Staff", short: true },
      { key: "pk", label: "চাবি", placeholder: "staff_id", short: true },
      { key: "fk", label: "বসকে চেনানোর Column", placeholder: "supervisor_id", short: true },
      { key: "name", label: "নামের Column", placeholder: "sname", short: true },
      { key: "ca", label: "কর্মীর alias", placeholder: "s", short: true },
      { key: "pa", label: "বসের alias", placeholder: "sup", short: true },
      { key: "keep", label: "যার বস নেই তাকেও রাখো (LEFT JOIN)", type: "toggle", short: true },
      { key: "none", label: "বস না থাকলে লেখা", placeholder: "(No supervisor)", optional: true, short: true },
    ],
    presets: [
      {
        label: "প্রশ্ন ২(iii): প্রত্যেকের supervisor",
        db: "q2-staff",
        values: { table: "Staff", pk: "staff_id", fk: "supervisor_id", name: "sname", ca: "s", pa: "sup", keep: "1", none: "" },
      },
      {
        label: "Emp: প্রত্যেকের ম্যানেজার",
        db: "q4-emp",
        values: { table: "Emp", pk: "empno", fk: "mgr", name: "ename", ca: "e", pa: "m", keep: "1", none: "-" },
      },
    ],
    build(v) {
      const ca = v.get("ca"), pa = v.get("pa"), name = v.get("name");
      const boss = v.has("none") ? `COALESCE(${pa}.${name}, '${v.raw("none").replace(/'/g, "''")}')` : `${pa}.${name}`;
      const sql = `SELECT ${ca}.${name} AS staff_name, ${boss} AS boss_name
FROM ${v.get("table")} ${ca}
${v.on("keep") ? "LEFT JOIN" : "JOIN"} ${v.get("table")} ${pa} ON ${pa}.${v.get("pk")} = ${ca}.${v.get("fk")}
ORDER BY ${ca}.${v.get("pk")};`;
      const warnings = [
        `ON-এর দিক: বসের চাবি = কর্মীর ${v.raw("fk") || "fk"}। উল্টো লিখলে বসের জায়গায় অধীনস্থের নাম আসে।`,
        "alias-এর নাম ভূমিকা অনুযায়ী দাও (s/sup, e/m); s1/s2 দিলে দিক গুলিয়ে যায়।",
      ];
      if (!v.on("keep")) warnings.push("\"each\" চাইলে LEFT JOIN: সাধারণ JOIN-এ শীর্ষ জন (বস নেই) হারিয়ে যান।");
      return { sql, warnings };
    },
  },

  /* ---------------- ছাঁকা + JOIN + সাজানো ---------------- */
  {
    id: "filter-join",
    title: "দুই টেবিল জোড়া, ছাঁকা, সাজানো",
    when: "\"X বা Y-এ আছে, অমুক তারিখের পরে, নাম আর বিভাগের নাম দাও, বেশি বেতন আগে\"",
    triggers: ["101 or 104", "10 or 40", "after", "before", "sorted by", "descending", "return name … and … name"],
    grain: "একজন/একটা Row, সরাসরি",
    fields: [
      { key: "main", label: "মূল টেবিল", placeholder: "Staff", short: true },
      { key: "ma", label: "alias", placeholder: "s", short: true },
      { key: "other", label: "যে টেবিল থেকে নাম আনবে", placeholder: "Branch", short: true },
      { key: "oa", label: "alias", placeholder: "b", short: true },
      { key: "on", label: "জোড়ার শর্ত", placeholder: "b.branch_id = s.branch_id" },
      { key: "show", label: "দেখাবে", hint: "দুই টেবিলে একই নাম থাকলে alias বাধ্যতামূলক", placeholder: "s.sname, s.branch_id, b.bname" },
      { key: "inCol", label: "\"এটা বা ওটা\" Column", placeholder: "s.branch_id", optional: true, short: true },
      { key: "inVals", label: "মানগুলো", hint: "কমা দিয়ে", placeholder: "101, 104", optional: true, short: true },
      { key: "dateCol", label: "তারিখের Column", placeholder: "s.join_date", optional: true, short: true },
      {
        key: "dateOp",
        label: "তারিখের শর্ত",
        type: "select",
        short: true,
        options: [
          { value: ">", label: "after (পরে, ঐ দিন বাদ)" },
          { value: ">=", label: "on or after (ঐ দিন সহ)" },
          { value: "<", label: "before (আগে)" },
        ],
      },
      { key: "date", label: "তারিখ", placeholder: "2020-01-01", optional: true, short: true },
      { key: "order", label: "সাজানো (ORDER BY)", placeholder: "s.salary DESC", optional: true },
    ],
    presets: [
      {
        label: "প্রশ্ন ২(ii): ব্রাঞ্চ 101/104, ২০২০-এর পরে",
        db: "q2-staff",
        values: { main: "Staff", ma: "s", other: "Branch", oa: "b", on: "b.branch_id = s.branch_id", show: "s.sname, s.branch_id, b.bname", inCol: "s.branch_id", inVals: "101, 104", dateCol: "s.join_date", dateOp: ">", date: "2020-01-01", order: "s.salary DESC, s.sname" },
      },
      {
        label: "প্রশ্ন ৪(ii): বিভাগ 10 বা 40",
        db: "q4-emp",
        values: { main: "Emp", ma: "e", other: "Dept", oa: "d", on: "d.deptno = e.deptno", show: "e.ename, e.deptno, d.dname", inCol: "e.deptno", inVals: "10, 40", dateCol: "", dateOp: ">", date: "", order: "e.deptno, e.ename" },
      },
    ],
    build(v) {
      const conds: string[] = [];
      if (v.has("inCol") || v.has("inVals")) conds.push(`${v.raw("inCol") || "‹Column›"} IN (${v.raw("inVals") || "‹মানগুলো›"})`);
      if (v.has("dateCol") || v.has("date")) conds.push(`${v.raw("dateCol") || "‹তারিখের Column›"} ${v.raw("dateOp") || ">"} '${v.raw("date") || "YYYY-MM-DD"}'`);
      const sql = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${v.get("ma")}
JOIN ${v.get("other")} ${v.get("oa")} ON ${v.get("on")}${conds.length ? `\nWHERE ${conds.join("\n  AND ")}` : ""}${v.has("order") ? `\nORDER BY ${v.raw("order")}` : ""};`;
      const warnings = [
        "\"A বা B\" এক Column-এ: IN (A, B)। OR লিখলে বন্ধনী দাও, নাহলে AND আগে খাটে।",
        "\"after 1 January\" মানে > (ঐ দিন বাদ)। কোনটা ধরেছ, খাতায় লিখে দাও।",
        "সমান মানে সাজানোর ক্রম ঠিক রাখতে দ্বিতীয় Column দাও (যেমন নাম)।",
      ];
      return { sql, warnings };
    },
  },
];

/** সব নকশায় একটা সাধারণ ঘর: View-এর নাম দিলে পুরোটা View-এ মোড়ানো হয় */
export const VIEW_FIELD: Field = {
  key: "view",
  label: "View-এর নাম",
  hint: "প্রশ্নে \"Create a view\" থাকলে দাও; খালি মানে সাধারণ Query",
  placeholder: "above_branch_avg",
  optional: true,
};

export function wrapView(sql: string, name: string): string {
  if (!name.trim()) return sql;
  const body = sql.replace(/;\s*$/, "");
  return `CREATE OR REPLACE VIEW ${name.trim()} AS\n${body};\n\n-- যাচাই (খাতায় শুধু ওপরের অংশ)\nSELECT * FROM ${name.trim()};`;
}

export function buildPattern(p: Pattern, values: Record<string, string>) {
  const v = new Vals(values, [...p.fields, VIEW_FIELD]);
  const out = p.build(v);
  const view = (values.view ?? "").trim();
  return {
    ...out,
    sql: wrapView(out.sql, view),
    alt: out.alt && { ...out.alt, sql: wrapView(out.alt.sql, view ? `${view}_v2` : "") },
    missing: v.missing,
  };
}

/* ------------------------------------------------------------------ */
/* প্রশ্ন থেকে সংকেত খোঁজা                                               */
/* ------------------------------------------------------------------ */

export interface Signal {
  re: RegExp;
  pattern?: string;
  /** নকশা ছাড়া সাধারণ পরামর্শ */
  tip?: string;
  label: string;
}

/** ক্রম জরুরি না; একই প্রশ্নে কয়েকটা মিলতে পারে */
export const signals: Signal[] = [
  { re: /\bat least one\b|\bany\b(?= course| product| order)|অন্তত/gi, pattern: "exists", label: "অন্তত একটা" },
  { re: /\bnever\b|\bhas not\b|\bhave not\b|\bdid not\b|\bnot (?:placed|ordered|registered|taken|bought)\b|কখনো/gi, pattern: "not-exists", label: "কখনো না" },
  { re: /\bevery\b(?! student| staff| employee| customer| category| department| branch)|\ball (?:the )?(?:courses|products|items|subjects)\b|সবগুলো|প্রতিটা কোর্স/gi, pattern: "division", label: "প্রতিটা / সবগুলো" },
  { re: /\btotal\b|\bsum\b|\bexceeds?\b|\bhow many\b|\bnumber of\b|of each (?:product )?(?:category|department|branch)|মোট/gi, pattern: "group-having", label: "দলের হিসাব" },
  { re: /\bhis or her own\b|\bits own\b|\btheir own\b|\bown (?:branch|department|category)\b|নিজের/gi, pattern: "own-group", label: "নিজের দল" },
  { re: /\bmost expensive\b|\bcheapest\b|\bhighest\b|\blowest\b|\bmaximum\b|\bminimum\b|equal to the (?:maximum|minimum|average)|সবচেয়ে|সর্বোচ্চ|সর্বনিম্ন/gi, pattern: "extreme", label: "সর্বোচ্চ/সর্বনিম্ন" },
  { re: /\baverage number\b|\bmust still be counted\b|\bdoes not appear\b|\bincluding (?:those|students|customers)\b|শূন্য/gi, pattern: "avg-zero", label: "শূন্যসহ" },
  { re: /\bsupervisor\b|\bmanager\b|\bboss\b|ম্যানেজার|বস/gi, pattern: "self-join", label: "বস/ম্যানেজার" },
  { re: /\b\d+ or \d+\b|\bafter\b|\bbefore\b|\bsorted by\b|\bdescending\b|\bascending\b/gi, pattern: "filter-join", label: "ছাঁকা ও সাজানো" },
  { re: /\bview\b/gi, tip: "\"Create a view\": যেকোনো টেমপ্লেটে \"View-এর নাম\" ঘরটা ভরো।", label: "View" },
  { re: /relational algebra/gi, tip: "Relational Algebra চাইছে: \"কখনো না\" টেমপ্লেট Algebra-ও লিখে দেয়। π = SELECT, σ = WHERE, ⋈ = JOIN, − = বিয়োগ।", label: "Relational Algebra" },
  { re: /\baverage\b|গড়/gi, tip: "\"average\": সবার গড় নাকি প্রতি দলের? কারো শূন্য থাকলে তাকেও গুনতে হবে কি না দেখো।", label: "গড়" },
  { re: /\bin the year \d{4}\b|\bin \d{4}\b/gi, tip: "বছরের শর্ত: col >= 'YYYY-01-01' AND col < 'পরের বছর-01-01'; এটা WHERE-এ যাবে।", label: "বছর" },
];
