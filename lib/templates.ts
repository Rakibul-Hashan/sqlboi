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

const makeOperators = (english: boolean) => [
  { value: ">", label: (english ? "> (greater than)" : "> (বেশি)") },
  { value: ">=", label: (english ? ">= (greater than or equal to)" : ">= (বেশি বা সমান)") },
  { value: "<", label: (english ? "< (less than)" : "< (কম)") },
  { value: "<=", label: (english ? "<= (less than or equal to)" : "<= (কম বা সমান)") },
  { value: "=", label: (english ? "= (equal to)" : "= (সমান)") },
];

const banglaOperators = makeOperators(false);
const englishOperators = makeOperators(true);

const makePatterns = (english: boolean): Pattern[] => [
  /* ---------------- অন্তত একটা ---------------- */
  {
    id: "exists",
    title: (english ? "At least one match" : "অন্তত একটা আছে"),
    when: (english ? "Find rows that match at least one row in another table" : "যাদের সাথে মিলে-যাওয়া অন্তত একটা Row অন্য টেবিলে আছে"),
    triggers: ["at least one", "any", "who has ordered", "who has registered", (english ? "at least one" : "অন্তত একটা")],
    grain: (english ? "One row per person or item in the main table" : "মূল টেবিলের একজন (যেমন একজন ছাত্র), একবার"),
    fields: [
      { key: "main", label: (english ? "Main table" : "মূল টেবিল"), hint: (english ? "The table that supplies one row per result, such as student or customer" : "উত্তরের প্রতি Row যা: student, customer…"), placeholder: "student", short: true },
      { key: "ma", label: (english ? "Main table alias" : "মূলের alias"), placeholder: "s", short: true },
      { key: "mainKey", label: (english ? "Main table key" : "মূলের চাবি"), hint: "Primary Key", placeholder: "student_id", short: true },
      { key: "show", label: (english ? "Columns to return" : "দেখাবে"), hint: (english ? "Comma-separated, with aliases" : "alias সহ, কমা দিয়ে"), placeholder: "s.student_id, s.name" },
      { key: "bridge", label: (english ? "Activity table" : "কাজের টেবিল"), hint: (english ? "The table that records the activity, such as registered or orders" : "যেখানে কাজটা লেখা: registered, orders…"), placeholder: "registered", short: true },
      { key: "ba", label: (english ? "Activity table alias" : "কাজের alias"), placeholder: "r", short: true },
      { key: "bridgeFk", label: (english ? "Activity column that references the main table" : "কাজের যে Column মূলকে চেনে"), placeholder: "student_id", short: true },
      { key: "target", label: (english ? "Filter table" : "শর্তের টেবিল"), hint: (english ? "Leave blank if the condition only uses the activity table" : "শর্তটা কাজের টেবিলেই থাকলে খালি রাখো"), placeholder: "course", optional: true, short: true },
      { key: "ta", label: (english ? "Filter table alias" : "শর্তের alias"), placeholder: "c", optional: true, short: true },
      { key: "targetOn", label: (english ? "Join condition" : "জোড়ার শর্ত"), placeholder: "c.course_code = r.course_code", optional: true },
      { key: "cond", label: (english ? "Filter condition" : "শর্ত"), hint: (english ? "A SQL condition. It may contain a subquery." : "যেকোনো SQL শর্ত, Subquery-ও চলে"), placeholder: "c.offered_by = 'CSE'", optional: true },
    ],
    presets: [
      {
        label: (english ? "Question 1(i): At least one CSE course" : "প্রশ্ন ১(i): অন্তত একটা CSE কোর্স"),
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", show: "s.student_id, s.name", bridge: "registered", ba: "r", bridgeFk: "student_id", target: "course", ta: "c", targetOn: "c.course_code = r.course_code", cond: "c.offered_by = 'CSE'" },
      },
      {
        label: (english ? "Question 3(iii): Buyers of the most expensive product" : "প্রশ্ন ৩(iii): সবচেয়ে দামি পণ্যের ক্রেতা"),
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", show: "c.cname, c.city", bridge: "orders", ba: "o", bridgeFk: "cust_id", target: "product", ta: "p", targetOn: "p.prod_id = o.prod_id", cond: "p.price = (SELECT MAX(price) FROM product)" },
      },
    ],
    build(v) {
      const ma = v.get("ma"), ba = v.get("ba");
      const hasT = v.has("target");
      const join = hasT ? `\n  JOIN ${v.get("target")} ${v.raw("ta")} ON ${v.has("targetOn") ? v.raw("targetOn") : (english ? "‹join condition›" : "‹জোড়ার শর্ত›")}` : "";
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
JOIN ${v.get("bridge")} ${ba} ON ${ba}.${v.get("bridgeFk")} = ${ma}.${v.get("mainKey")}${hasT ? `\nJOIN ${v.get("target")} ${v.raw("ta")} ON ${v.raw("targetOn") || (english ? "‹join condition›" : "‹জোড়ার শর্ত›")}` : ""}${v.has("cond") ? `\nWHERE ${v.raw("cond")}` : ""};`;
      const warnings = [
        (english ? "Check which table contains the filter column. A student’s department and a course’s department can differ." : "শর্তটা কোন টেবিলের Column-এর ওপর, আবার দেখো (ছাত্রের বিভাগ বনাম কোর্সের বিভাগ)।"),
        (english ? "A join can repeat matched rows. EXISTS checks whether a match exists." : "JOIN দিয়ে লিখলে DISTINCT লাগবে; EXISTS-এ লাগে না।"),
      ];
      if (/MAX|MIN/i.test(v.raw("cond"))) warnings.push((english ? "Compare with MAX or MIN to retain all ties. LIMIT 1 returns only one row." : "সর্বোচ্চ/সর্বনিম্ন: `= (SELECT MAX(...))` সমান মানের সবাইকে রাখে। ORDER BY … LIMIT 1 দিয়ো না।"));
      return { sql, alt: { title: (english ? "With JOIN and DISTINCT" : "JOIN + DISTINCT দিয়ে"), sql: alt }, warnings };
    },
  },

  /* ---------------- কখনো না ---------------- */
  {
    id: "not-exists",
    title: (english ? "No matches" : "কখনো না / একটাও নেই"),
    when: (english ? "Find rows that do not match any row in another table" : "যাদের সাথে মিলে-যাওয়া কোনো Row অন্য টেবিলে নেই"),
    triggers: ["never", "has not", "did not", "no order", "not registered", (english ? "never" : "কখনো না")],
    grain: (english ? "One row per person or item in the main table" : "মূল টেবিলের একজন"),
    fields: [
      { key: "main", label: (english ? "Main table" : "মূল টেবিল"), placeholder: "customer", short: true },
      { key: "ma", label: (english ? "Main table alias" : "মূলের alias"), placeholder: "c", short: true },
      { key: "mainKey", label: (english ? "Main table key" : "মূলের চাবি"), placeholder: "cust_id", short: true },
      { key: "show", label: (english ? "Columns to return" : "দেখাবে"), placeholder: "c.cust_id, c.cname" },
      { key: "bridge", label: (english ? "Activity table" : "কাজের টেবিল"), placeholder: "orders", short: true },
      { key: "ba", label: (english ? "Activity table alias" : "কাজের alias"), placeholder: "o", short: true },
      { key: "bridgeFk", label: (english ? "Activity column that references the main table" : "কাজের যে Column মূলকে চেনে"), placeholder: "cust_id", short: true },
      { key: "cond", label: (english ? "Extra condition on the activity" : "কাজের ওপর বাড়তি শর্ত"), hint: (english ? "For example, no orders in 2025" : "যেমন \"২০২৫-এ কখনো না\""), placeholder: "o.order_date >= '2025-01-01'", optional: true },
    ],
    presets: [
      {
        label: (english ? "Question 3(i): Customers who never ordered" : "প্রশ্ন ৩(i): কখনো অর্ডার দেননি"),
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", show: "c.cust_id, c.cname", bridge: "orders", ba: "o", bridgeFk: "cust_id", cond: "" },
      },
      {
        label: (english ? "Products no one bought" : "কেউ কেনেনি এমন পণ্য"),
        db: "q3-shop",
        values: { main: "product", ma: "p", mainKey: "prod_id", show: "p.prod_id, p.pname", bridge: "orders", ba: "o", bridgeFk: "prod_id", cond: "" },
      },
      {
        label: (english ? "Students who never took a course" : "যে ছাত্র কোনো কোর্স নেয়নি"),
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
        (english ? "If the subquery can return NULL, use NOT EXISTS to test for missing matches." : "NOT IN (SELECT …) দিয়ো না যদি ভেতরের Column-এ NULL থাকতে পারে: তখন কেউ আসে না।"),
        (english ? "Set difference needs compatible columns. Subtract keys first, then join to retrieve names." : "Algebra-য় বিয়োগের দুই পাশে একই Column লাগে (Union Compatibility): আগে শুধু চাবিতে বিয়োগ, তারপর ⋈ করে নাম।"),
      ];
      if (v.has("cond")) warnings.push((english ? "To retain unmatched rows, put extra right-side conditions in ON." : "LEFT JOIN রূপে বাড়তি শর্ত ON-এ থাকবে, WHERE-এ না; নাহলে LEFT JOIN আবার INNER হয়ে যায়।"));
      return { sql, alt: { title: (english ? "With LEFT JOIN and IS NULL" : "LEFT JOIN … IS NULL দিয়ে"), sql: alt }, algebra, warnings };
    },
  },

  /* ---------------- প্রতিটা (Division) ---------------- */
  {
    id: "division",
    title: (english ? "Every required item (relational division)" : "প্রতিটা / সবগুলো (Division)"),
    when: (english ? "Find rows that match every member of a required set" : "একটা পুরো সেটের সবগুলোর সাথেই যার মিল আছে"),
    triggers: ["every", "all the courses", "each of the", (english ? "every" : "প্রতিটা"), (english ? "all required" : "সবগুলো")],
    grain: (english ? "One row per person or item in the main table" : "মূল টেবিলের একজন"),
    fields: [
      { key: "main", label: (english ? "Main table" : "মূল টেবিল"), placeholder: "student", short: true },
      { key: "ma", label: (english ? "Main table alias" : "মূলের alias"), placeholder: "s", short: true },
      { key: "mainKey", label: (english ? "Main table key" : "মূলের চাবি"), placeholder: "student_id", short: true },
      { key: "show", label: (english ? "Columns to return" : "দেখাবে"), placeholder: "s.student_id, s.name" },
      { key: "set", label: (english ? "Required-set table" : "সেটের টেবিল"), hint: (english ? "The items after “every”, such as courses or products" : "\"প্রতিটা ___\": course, product…"), placeholder: "course", short: true },
      { key: "sa", label: (english ? "Required-set alias" : "সেটের alias"), placeholder: "c", short: true },
      { key: "setKey", label: (english ? "Required-set key" : "সেটের চাবি"), placeholder: "course_code", short: true },
      { key: "setCond", label: (english ? "Filter the required set" : "কোন সেট"), hint: (english ? "Condition that selects the required items" : "সেটটা ছাঁকার শর্ত"), placeholder: "c.instructor = 'Dr. Rahman'", optional: true },
      { key: "bridge", label: (english ? "Activity table" : "কাজের টেবিল"), placeholder: "registered", short: true },
      { key: "ba", label: (english ? "Activity table alias" : "কাজের alias"), placeholder: "r", short: true },
      { key: "bMain", label: (english ? "Activity column that references the main table" : "কাজের যে Column মূলকে চেনে"), placeholder: "student_id", short: true },
      { key: "bSet", label: (english ? "Activity column that references the required set" : "কাজের যে Column সেটকে চেনে"), placeholder: "course_code", short: true },
    ],
    presets: [
      {
        label: (english ? "Question 1(ii): Every course taught by Dr. Rahman" : "প্রশ্ন ১(ii): Dr. Rahman-এর প্রতিটা কোর্স"),
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", show: "s.student_id, s.name", set: "course", sa: "c", setKey: "course_code", setCond: "c.instructor = 'Dr. Rahman'", bridge: "registered", ba: "r", bMain: "student_id", bSet: "course_code" },
      },
      {
        label: (english ? "Customers who bought every top-priced product" : "সবচেয়ে দামি সবগুলো পণ্যই কিনেছেন"),
        db: "q3-shop",
        values: { main: "customer", ma: "c", mainKey: "cust_id", show: "c.cust_id, c.cname", set: "product", sa: "p", setKey: "prod_id", setCond: "p.price = (SELECT MAX(price) FROM product)", bridge: "orders", ba: "o", bMain: "cust_id", bSet: "prod_id" },
      },
    ],
    build(v) {
      const ma = v.get("ma"), sa = v.get("sa"), ba = v.get("ba");
      const setWhere = v.has("setCond") ? `${v.raw("setCond")}\n    AND ` : "";
      const sql = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${ma}
WHERE NOT EXISTS (                -- ${english ? "No required item is missing" : `এমন কোনো ${v.raw("set") || "সদস্য"} নেই…`}
  SELECT 1
  FROM ${v.get("set")} ${sa}
  WHERE ${setWhere}NOT EXISTS (     -- ${english ? "Test whether this item is missing" : "…যেটা এর সাথে নেই"}
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
        alt: { title: (english ? "Match counts with COUNT DISTINCT" : "গুনে মেলানো (COUNT DISTINCT)"), sql: alt },
        warnings: [
          (english ? "Use COUNT(DISTINCT …) when repeated memberships, such as retakes, should count once." : "গুনে মেলালে COUNT(DISTINCT …) লাগবে; একই জিনিস দুবার থাকলে (রিটেক) COUNT(*) ভুল উত্তর দেয়।"),
          (english ? "Match the required value precisely when similar names are possible." : "সেটের শর্তে = লেখো, LIKE '%…%' না: অন্য একই-রকম নামও মিলে যায়।"),
          (english ? "Nested NOT EXISTS treats an empty required set as satisfied. A count-based rewrite must explicitly account for candidates with zero matches." : "সেট খালি হলে দুইবার-NOT EXISTS সবাইকে দেয়, গোনার উপায় কাউকে না। দরকার হলে খাতায় লিখে দাও।"),
        ],
      };
    },
  },

  /* ---------------- দলের মোট + শর্ত ---------------- */
  {
    id: "group-having",
    title: (english ? "Totals or counts by group" : "প্রতি দলের মোট/গোনা + দলের শর্ত"),
    when: (english ? "Calculate one value per group and filter by that value" : "প্রতিটা ক্যাটাগরি/বিভাগ/ব্রাঞ্চের জন্য একটা হিসাব, আর হিসাবের ওপর শর্ত"),
    triggers: ["total", "of each category", "per", "how many", "exceeds", (english ? "total" : "মোট"), (english ? "per group" : "প্রতি")],
    grain: (english ? "One row per group, such as a category" : "একটা দল (যেমন একটা ক্যাটাগরি)"),
    fields: [
      { key: "from", label: (english ? "FROM and JOIN" : "FROM আর JOIN"), type: "area", hint: (english ? "The source tables and their join conditions" : "যে টেবিলগুলো লাগবে, জোড়াসহ"), placeholder: "orders o\nJOIN product p ON p.prod_id = o.prod_id" },
      { key: "group", label: (english ? "Grouping columns" : "কী ধরে দল"), hint: (english ? "Columns to put in GROUP BY" : "GROUP BY-এর Column"), placeholder: "p.category", short: true },
      { key: "agg", label: (english ? "Aggregate expression" : "হিসাব"), hint: "SUM/COUNT/AVG/MAX/MIN", placeholder: "SUM(p.price * o.quantity)", short: true },
      { key: "aggAs", label: (english ? "Alias for the aggregate" : "হিসাবের নাম"), placeholder: "total_sales", short: true },
      { key: "where", label: (english ? "Row filter (WHERE)" : "প্রতি Row-এর শর্ত (WHERE)"), hint: (english ? "Filter dates, cities, or other row values before grouping" : "যোগের আগে ছাঁকা: তারিখ, শহর…"), placeholder: "o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'", optional: true },
      { key: "op", label: english ? "Group comparison operator" : "দলের শর্তের চিহ্ন", type: "select", options: english ? englishOperators : banglaOperators, short: true },
      { key: "val", label: (english ? "Group threshold (HAVING)" : "দলের শর্তের মান (HAVING)"), hint: (english ? "Leave blank to skip HAVING" : "খালি রাখলে HAVING নেই"), placeholder: "50000", optional: true, short: true },
      {
        key: "order",
        label: (english ? "Sort order" : "সাজানো"),
        type: "select",
        short: true,
        options: [
          { value: "desc", label: (english ? "Aggregate, highest first" : "হিসাব, বড় আগে") },
          { value: "asc", label: (english ? "Aggregate, lowest first" : "হিসাব, ছোট আগে") },
          { value: "group", label: (english ? "Group name" : "দলের নাম ধরে") },
          { value: "none", label: (english ? "Unsorted" : "সাজানো নেই") },
        ],
      },
    ],
    presets: [
      {
        label: (english ? "Question 3(ii): 2025 sales above 50,000 per category" : "প্রশ্ন ৩(ii): ২০২৫-এ ক্যাটাগরির বিক্রি > ৫০,০০০"),
        db: "q3-shop",
        values: { from: "orders o\nJOIN product p ON p.prod_id = o.prod_id", group: "p.category", agg: "SUM(p.price * o.quantity)", aggAs: "total_sales", where: "o.order_date >= '2025-01-01' AND o.order_date < '2026-01-01'", op: ">", val: "50000", order: "desc" },
      },
      {
        label: (english ? "Branches with more than three staff members" : "প্রতি ব্রাঞ্চে কতজন (৩ জনের বেশি)"),
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
        (english ? "Put row conditions in WHERE and aggregate conditions in HAVING." : "প্রতি Row-এর শর্ত (তারিখ, শহর) WHERE-এ; হিসাবের শর্ত (মোট > …) HAVING-এ। SUM/COUNT WHERE-এ বসে না।"),
        (english ? "“Exceeds” and “more than” mean strictly greater than." : "\"exceeds\"/\"more than\" মানে >, সমান না।"),
        (english ? "Use SUM(a * b) to total each row’s product." : "গুণফলের যোগ: SUM(a * b); SUM(a) * SUM(b) আলাদা জিনিস।"),
      ];
      if (/YEAR\s*\(/i.test(v.raw("where"))) warnings.push((english ? "Use a date range on the indexed column directly." : "YEAR(col) = … ঠিক উত্তর দেয়, কিন্তু Index কাজ করে না; তারিখের পরিসর (>= আর <) ভালো।"));
      if (/BETWEEN/i.test(v.raw("where"))) warnings.push((english ? "Use an exclusive upper bound at the start of the next year to include all times on December 31." : "BETWEEN … 'YYYY-12-31' DATETIME Column-এ শেষ দিনের সময়গুলো বাদ দেয়; >= আর < নিরাপদ।"));
      return { sql, warnings };
    },
  },

  /* ---------------- নিজের দলের সাথে তুলনা ---------------- */
  {
    id: "own-group",
    title: (english ? "Compare with a row’s own group" : "নিজের দলের গড়/সর্বোচ্চের সাথে তুলনা"),
    when: (english ? "Compare each row with an aggregate from its branch or department" : "প্রত্যেককে তার নিজের ব্রাঞ্চ/বিভাগের হিসাবের সাথে মেলানো"),
    triggers: ["his or her own", "own branch", "of the same department", (english ? "own group" : "নিজের")],
    grain: (english ? "One row per person or item" : "একজন (যেমন একজন স্টাফ)"),
    fields: [
      { key: "table", label: (english ? "Table" : "টেবিল"), placeholder: "Staff", short: true },
      { key: "a", label: "alias", placeholder: "s", short: true },
      { key: "show", label: (english ? "Columns to return" : "দেখাবে"), placeholder: "s.*" },
      { key: "groupCol", label: (english ? "Group column" : "দলের Column"), hint: (english ? "The group implied by “their own”" : "\"নিজের ___\""), placeholder: "branch_id", short: true },
      { key: "valCol", label: (english ? "Value to compare" : "যে মান তুলনা"), placeholder: "salary", short: true },
      { key: "op", label: english ? "Comparison operator" : "চিহ্ন", type: "select", options: english ? englishOperators : banglaOperators, short: true },
      {
        key: "agg",
        label: (english ? "Group aggregate" : "দলের কী"),
        type: "select",
        short: true,
        options: [
          { value: "AVG", label: (english ? "Average (AVG)" : "গড় (AVG)") },
          { value: "MAX", label: (english ? "Maximum (MAX)" : "সর্বোচ্চ (MAX)") },
          { value: "MIN", label: (english ? "Minimum (MIN)" : "সর্বনিম্ন (MIN)") },
        ],
      },
    ],
    presets: [
      {
        label: (english ? "Question 2(i): Above their own branch average" : "প্রশ্ন ২(i): নিজের ব্রাঞ্চের গড়ের চেয়ে বেশি"),
        db: "q2-staff",
        values: { table: "Staff", a: "s", show: "s.*", groupCol: "branch_id", valCol: "salary", op: ">", agg: "AVG", view: "above_branch_avg" },
      },
      {
        label: (english ? "Highest-paid staff in each department" : "প্রতি বিভাগে সর্বোচ্চ বেতন যাঁর"),
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
  WHERE ${inner}.${g} = ${a}.${g}     -- ${english ? "Match the group of the outer row" : '"নিজের" দল: বাইরের Row-এর সাথে মিল'}
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
        alt: { title: (english ? "JOIN to grouped results" : "দলের হিসাবের টেবিলের সাথে JOIN"), sql: alt },
        warnings: [
          (english ? "Correlate the inner query with the outer row’s group. Otherwise the aggregate is calculated over the whole table." : "ভেতরের WHERE (নিজের দল মেলানো) বাদ দিলে পুরো টেবিলের হিসাব আসে: ভুল উত্তর, কোনো error ছাড়া।"),
          (english ? "A strict greater-than comparison excludes rows that equal the average." : "\"greater than\" মানে >; গড়ের ঠিক সমান যিনি, তিনি আসবেন না।"),
        ],
      };
    },
  },

  /* ---------------- সর্বোচ্চ/সর্বনিম্ন/গড়ের সমান ---------------- */
  {
    id: "extreme",
    title: (english ? "Equal to the maximum, minimum, or average" : "সর্বোচ্চ / সর্বনিম্ন / গড়ের সমান"),
    when: (english ? "Find all rows matching a chosen aggregate across the whole table" : "পুরো টেবিলের MAX, MIN বা AVG-এর সমান মান যার (সমান হলে সবাই)"),
    triggers: ["most expensive", "highest", "maximum", "minimum", "lowest", "equal to the average", (english ? "highest" : "সবচেয়ে")],
    grain: (english ? "One row per matching item, including ties" : "একজন/একটা, সমান মানের সবাই"),
    fields: [
      { key: "table", label: (english ? "Table" : "টেবিল"), placeholder: "Emp", short: true },
      { key: "a", label: "alias", placeholder: "e", short: true },
      { key: "col", label: (english ? "Column to compare" : "যে Column"), placeholder: "sal", short: true },
      { key: "show", label: (english ? "Columns to return" : "দেখাবে"), placeholder: "e.*" },
      { key: "max", label: (english ? "Maximum (MAX)" : "সর্বোচ্চ (MAX)"), type: "toggle", short: true },
      { key: "min", label: (english ? "Minimum (MIN)" : "সর্বনিম্ন (MIN)"), type: "toggle", short: true },
      { key: "avg", label: (english ? "Average (AVG)" : "গড় (AVG)"), type: "toggle", short: true },
    ],
    presets: [
      {
        label: (english ? "Question 4(i): Employees matching MAX, MIN, or AVG" : "প্রশ্ন ৪(i): MAX, MIN বা AVG-এর সমান"),
        db: "q4-emp",
        values: { table: "Emp", a: "e", col: "sal", show: "e.*", max: "1", min: "1", avg: "1", view: "emp_sal_extremes" },
      },
      {
        label: (english ? "Most expensive products, including ties" : "সবচেয়ে দামি পণ্য (টাইসহ)"),
        db: "q3-shop",
        values: { table: "product", a: "p", col: "price", show: "p.prod_id, p.pname, p.price", max: "1", min: "", avg: "", view: "" },
      },
    ],
    build(v) {
      const t = v.get("table"), a = v.get("a"), c = v.get("col");
      const picks = (["max", "min", "avg"] as const).filter((k) => v.on(k));
      const conds = picks.length
        ? picks.map((k) => `${a}.${c} = (SELECT ${k.toUpperCase()}(${c}) FROM ${t})`)
        : [`${a}.${c} = (SELECT ${english ? "‹choose MAX/MIN/AVG›" : "‹MAX/MIN/AVG বাছো›"}(${c}) FROM ${t})`];
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
        (english ? "Compute MAX in a scalar subquery before comparing each row with it." : "WHERE col = MAX(col) চলে না (ERROR 1111); আলাদা Subquery লাগে।"),
        (english ? "LIMIT 1 returns one row even if other rows tie for first." : "ORDER BY … LIMIT 1 সমান মানের একজনকে চুপচাপ বাদ দেয়।"),
      ];
      if (picks.length > 1) warnings.push((english ? "Join alternative comparisons with OR if any match qualifies." : "কয়েকটা শর্ত OR দিয়ে জুড়বে; AND দিলে উত্তর খালি।"));
      if (v.on("avg")) warnings.push((english ? "An average can fall between actual values, so equality may produce no matches." : "গড় প্রায়ই দশমিক (যেমন 4183.33), কারো মানের সমান না হতেই পারে; তখন গড় থেকে কেউ না আসাই সঠিক।"));
      return { sql, alt: alt ? { title: (english ? "With IN" : "IN দিয়ে ছোট করে"), sql: alt } : undefined, warnings };
    },
  },

  /* ---------------- শূন্যসহ গোনা/গড় ---------------- */
  {
    id: "avg-zero",
    title: (english ? "Count or average including zeros" : "শূন্যসহ গোনা / গড়"),
    when: (english ? "Count activities per person, including people with zero, or average those counts" : "প্রত্যেকে কয়টা করেছে (যারা কিছুই করেনি তারাও ০), বা তার গড়"),
    triggers: ["average number of", "must still be counted", "including those", "per student", (english ? "including zero" : "শূন্যসহ")],
    grain: (english ? "One row per person or one overall result" : "প্রতি জন, বা পুরো উত্তর একটা সংখ্যা"),
    fields: [
      { key: "main", label: (english ? "Table of people or items to count" : "যাদের গুনবে"), hint: (english ? "This table should include rows with no activity" : "শূন্যরাও এই টেবিলে আছে"), placeholder: "student", short: true },
      { key: "ma", label: "alias", placeholder: "s", short: true },
      { key: "mainKey", label: (english ? "Key" : "চাবি"), placeholder: "student_id", short: true },
      { key: "extra", label: (english ? "Extra columns to return" : "সাথে দেখাবে"), hint: (english ? "For per-person counts only, for example a name column" : "শুধু \"প্রতি জনের সংখ্যা\"-তে; যেমন নাম"), placeholder: "s.name", optional: true, short: true },
      { key: "bridge", label: (english ? "Activity table" : "কাজের টেবিল"), placeholder: "registered", short: true },
      { key: "ba", label: (english ? "Activity table alias" : "কাজের alias"), placeholder: "r", short: true },
      { key: "bridgeFk", label: (english ? "Activity column that references the main table" : "কাজের যে Column মূলকে চেনে"), placeholder: "student_id", short: true },
      { key: "countCol", label: (english ? "Column to count" : "কী গুনবে"), hint: (english ? "Use a non-NULL column from the activity table" : "কাজের টেবিলের একটা NOT NULL Column"), placeholder: "course_code", short: true },
      { key: "distinct", label: (english ? "Count distinct values" : "আলাদা আলাদা গুনবে (DISTINCT)"), type: "toggle", short: true },
      {
        key: "mode",
        label: (english ? "Output" : "উত্তর"),
        type: "select",
        short: true,
        options: [
          { value: "avg", label: (english ? "One overall average" : "সবার গড় (একটা সংখ্যা)") },
          { value: "each", label: (english ? "Count per person" : "প্রতি জনের সংখ্যা") },
        ],
      },
    ],
    presets: [
      {
        label: (english ? "Question 1(iii): Average courses per student" : "প্রশ্ন ১(iii): ছাত্রপ্রতি গড় কোর্স"),
        db: "q1-course",
        values: { main: "student", ma: "s", mainKey: "student_id", extra: "", bridge: "registered", ba: "r", bridgeFk: "student_id", countCol: "course_code", distinct: "", mode: "avg" },
      },
      {
        label: (english ? "Orders per customer, including zero" : "প্রতি ক্রেতার অর্ডার সংখ্যা (০ সহ)"),
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
          (english ? "Start from the people or items being counted and use LEFT JOIN to preserve rows with zero activity." : "শুরু করো যাদের গুনবে সেই টেবিল থেকে, আর LEFT JOIN: নাহলে শূন্যরা হারিয়ে যায়।"),
          (english ? "Count a non-NULL right-table column. COUNT(*) also counts the placeholder row after an unmatched LEFT JOIN." : "COUNT(*) না, COUNT(ডান টেবিলের Column): LEFT JOIN-এর NULL-Row COUNT(*)-এ ১ গোনা হয়।"),
          (english ? "Decide whether repeated activity should count. Use DISTINCT when each item should count once." : "একই জিনিস দুবার থাকতে পারলে (রিটেক) DISTINCT চাই কি না ঠিক করো, খাতায় লিখে দাও।"),
        ],
      };
    },
  },

  /* ---------------- Self Join ---------------- */
  {
    id: "self-join",
    title: (english ? "Look up a manager in the same table" : "একই টেবিলে বস/ম্যানেজারের নাম"),
    when: (english ? "Use a column such as supervisor_id or mgr to reference another row in the same table" : "একটা Column একই টেবিলের আরেকজনকে চেনায় (supervisor_id, mgr)"),
    triggers: ["supervisor", "manager", "together with the name of", (english ? "manager" : "বস")],
    grain: (english ? "One row per person" : "প্রতি জন একবার"),
    fields: [
      { key: "table", label: (english ? "Table" : "টেবিল"), placeholder: "Staff", short: true },
      { key: "pk", label: (english ? "Key" : "চাবি"), placeholder: "staff_id", short: true },
      { key: "fk", label: (english ? "Manager reference column" : "বসকে চেনানোর Column"), placeholder: "supervisor_id", short: true },
      { key: "name", label: (english ? "Name column" : "নামের Column"), placeholder: "sname", short: true },
      { key: "ca", label: (english ? "Employee alias" : "কর্মীর alias"), placeholder: "s", short: true },
      { key: "pa", label: (english ? "Manager alias" : "বসের alias"), placeholder: "sup", short: true },
      { key: "keep", label: (english ? "Keep employees without a manager (LEFT JOIN)" : "যার বস নেই তাকেও রাখো (LEFT JOIN)"), type: "toggle", short: true },
      { key: "none", label: (english ? "Label for a missing manager" : "বস না থাকলে লেখা"), placeholder: "(No supervisor)", optional: true, short: true },
    ],
    presets: [
      {
        label: (english ? "Question 2(iii): Each staff member’s supervisor" : "প্রশ্ন ২(iii): প্রত্যেকের supervisor"),
        db: "q2-staff",
        values: { table: "Staff", pk: "staff_id", fk: "supervisor_id", name: "sname", ca: "s", pa: "sup", keep: "1", none: "" },
      },
      {
        label: (english ? "Emp: Each employee’s manager" : "Emp: প্রত্যেকের ম্যানেজার"),
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
        english
          ? `Match the manager’s key to the employee’s ${v.raw("fk") || "fk"} column. Reversing the aliases finds direct reports instead.`
          : `ON-এর দিক: বসের চাবি = কর্মীর ${v.raw("fk") || "fk"}। উল্টো লিখলে বসের জায়গায় অধীনস্থের নাম আসে।`,
        (english ? "Use aliases that describe roles, such as employee and manager." : "alias-এর নাম ভূমিকা অনুযায়ী দাও (s/sup, e/m); s1/s2 দিলে দিক গুলিয়ে যায়।"),
      ];
      if (!v.on("keep")) warnings.push((english ? "Use LEFT JOIN if every employee should appear, including the person without a manager." : "\"each\" চাইলে LEFT JOIN: সাধারণ JOIN-এ শীর্ষ জন (বস নেই) হারিয়ে যান।"));
      return { sql, warnings };
    },
  },

  /* ---------------- ছাঁকা + JOIN + সাজানো ---------------- */
  {
    id: "filter-join",
    title: (english ? "Join, filter, and sort" : "দুই টেবিল জোড়া, ছাঁকা, সাজানো"),
    when: (english ? "Filter by a list or date, add information from a joined table, and sort the results" : "\"X বা Y-এ আছে, অমুক তারিখের পরে, নাম আর বিভাগের নাম দাও, বেশি বেতন আগে\""),
    triggers: ["101 or 104", "10 or 40", "after", "before", "sorted by", "descending", "return name … and … name"],
    grain: (english ? "One row per match" : "একজন/একটা Row, সরাসরি"),
    fields: [
      { key: "main", label: (english ? "Main table" : "মূল টেবিল"), placeholder: "Staff", short: true },
      { key: "ma", label: "alias", placeholder: "s", short: true },
      { key: "other", label: (english ? "Table that supplies additional columns" : "যে টেবিল থেকে নাম আনবে"), placeholder: "Branch", short: true },
      { key: "oa", label: "alias", placeholder: "b", short: true },
      { key: "on", label: (english ? "Join condition" : "জোড়ার শর্ত"), placeholder: "b.branch_id = s.branch_id" },
      { key: "show", label: (english ? "Columns to return" : "দেখাবে"), hint: (english ? "Qualify shared column names with table aliases" : "দুই টেবিলে একই নাম থাকলে alias বাধ্যতামূলক"), placeholder: "s.sname, s.branch_id, b.bname" },
      { key: "inCol", label: (english ? "Column to match against a list" : "\"এটা বা ওটা\" Column"), placeholder: "s.branch_id", optional: true, short: true },
      { key: "inVals", label: (english ? "Values" : "মানগুলো"), hint: (english ? "Separate values with commas" : "কমা দিয়ে"), placeholder: "101, 104", optional: true, short: true },
      { key: "dateCol", label: (english ? "Date column" : "তারিখের Column"), placeholder: "s.join_date", optional: true, short: true },
      {
        key: "dateOp",
        label: (english ? "Date comparison" : "তারিখের শর্ত"),
        type: "select",
        short: true,
        options: [
          { value: ">", label: (english ? "After (exclusive)" : "after (পরে, ঐ দিন বাদ)") },
          { value: ">=", label: (english ? "On or after (inclusive)" : "on or after (ঐ দিন সহ)") },
          { value: "<", label: (english ? "Before" : "before (আগে)") },
        ],
      },
      { key: "date", label: (english ? "Date" : "তারিখ"), placeholder: "2020-01-01", optional: true, short: true },
      { key: "order", label: (english ? "Sort order (ORDER BY)" : "সাজানো (ORDER BY)"), placeholder: "s.salary DESC", optional: true },
    ],
    presets: [
      {
        label: (english ? "Question 2(ii): Branches 101 or 104, after 2020" : "প্রশ্ন ২(ii): ব্রাঞ্চ 101/104, ২০২০-এর পরে"),
        db: "q2-staff",
        values: { main: "Staff", ma: "s", other: "Branch", oa: "b", on: "b.branch_id = s.branch_id", show: "s.sname, s.branch_id, b.bname", inCol: "s.branch_id", inVals: "101, 104", dateCol: "s.join_date", dateOp: ">", date: "2020-01-01", order: "s.salary DESC, s.sname" },
      },
      {
        label: (english ? "Question 4(ii): Departments 10 or 40" : "প্রশ্ন ৪(ii): বিভাগ 10 বা 40"),
        db: "q4-emp",
        values: { main: "Emp", ma: "e", other: "Dept", oa: "d", on: "d.deptno = e.deptno", show: "e.ename, e.deptno, d.dname", inCol: "e.deptno", inVals: "10, 40", dateCol: "", dateOp: ">", date: "", order: "e.deptno, e.ename" },
      },
    ],
    build(v) {
      const conds: string[] = [];
      if (v.has("inCol") || v.has("inVals")) conds.push(`${v.raw("inCol") || "‹Column›"} IN (${v.raw("inVals") || (english ? "‹values›" : "‹মানগুলো›")})`);
      if (v.has("dateCol") || v.has("date")) conds.push(`${v.raw("dateCol") || (english ? "‹date column›" : "‹তারিখের Column›")} ${v.raw("dateOp") || ">"} '${v.raw("date") || "YYYY-MM-DD"}'`);
      const sql = `SELECT ${v.get("show")}
FROM ${v.get("main")} ${v.get("ma")}
JOIN ${v.get("other")} ${v.get("oa")} ON ${v.get("on")}${conds.length ? `\nWHERE ${conds.join("\n  AND ")}` : ""}${v.has("order") ? `\nORDER BY ${v.raw("order")}` : ""};`;
      const warnings = [
        (english ? "Use IN (A, B) when either of the values qualifies. Group OR conditions if you also have an AND condition." : "\"A বা B\" এক Column-এ: IN (A, B)। OR লিখলে বন্ধনী দাও, নাহলে AND আগে খাটে।"),
        (english ? "“After January 1” excludes January 1. State your interpretation when the prompt is ambiguous." : "\"after 1 January\" মানে > (ঐ দিন বাদ)। কোনটা ধরেছ, খাতায় লিখে দাও।"),
        (english ? "Add a second sort column to make ties deterministic." : "সমান মানে সাজানোর ক্রম ঠিক রাখতে দ্বিতীয় Column দাও (যেমন নাম)।"),
      ];
      return { sql, warnings };
    },
  },
];

export const patterns = makePatterns(false);
export const englishPatterns = makePatterns(true);

/** সব নকশায় একটা সাধারণ ঘর: View-এর নাম দিলে পুরোটা View-এ মোড়ানো হয় */
const makeViewField = (english: boolean): Field => ({
  key: "view",
  label: (english ? "View name" : "View-এর নাম"),
  hint: (english ? "Fill this in if the prompt asks for a view. Leave blank for a SELECT query." : "প্রশ্নে \"Create a view\" থাকলে দাও; খালি মানে সাধারণ Query"),
  placeholder: "above_branch_avg",
  optional: true,
});

export const VIEW_FIELD = makeViewField(false);
export const englishViewField = makeViewField(true);

export function wrapView(sql: string, name: string, english = false): string {
  if (!name.trim()) return sql;
  const body = sql.replace(/;\s*$/, "");
  return `CREATE OR REPLACE VIEW ${name.trim()} AS\n${body};\n\n-- ${english ? "Check the view" : "যাচাই (খাতায় শুধু ওপরের অংশ)"}\nSELECT * FROM ${name.trim()};`;
}

export function buildPattern(p: Pattern, values: Record<string, string>, english = false) {
  const v = new Vals(values, [...p.fields, english ? englishViewField : VIEW_FIELD]);
  const out = p.build(v);
  const view = (values.view ?? "").trim();
  return {
    ...out,
    sql: wrapView(out.sql, view, english),
    alt: out.alt && { ...out.alt, sql: wrapView(out.alt.sql, view ? `${view}_v2` : "", english) },
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
const makeSignals = (english: boolean): Signal[] => [
  { re: /\bat least one\b|\bany\b(?= course| product| order)|অন্তত/gi, pattern: "exists", label: (english ? "At least one" : "অন্তত একটা") },
  { re: /\bnever\b|\bhas not\b|\bhave not\b|\bdid not\b|\bnot (?:placed|ordered|registered|taken|bought)\b|কখনো/gi, pattern: "not-exists", label: (english ? "No matches" : "কখনো না") },
  { re: /\bevery\b(?! student| staff| employee| customer| category| department| branch)|\ball (?:the )?(?:courses|products|items|subjects)\b|সবগুলো|প্রতিটা কোর্স/gi, pattern: "division", label: (english ? "Every required item" : "প্রতিটা / সবগুলো") },
  { re: /\btotal\b|\bsum\b|\bexceeds?\b|\bhow many\b|\bnumber of\b|of each (?:product )?(?:category|department|branch)|মোট/gi, pattern: "group-having", label: (english ? "Group totals" : "দলের হিসাব") },
  { re: /\bhis or her own\b|\bits own\b|\btheir own\b|\bown (?:branch|department|category)\b|নিজের/gi, pattern: "own-group", label: (english ? "Own group" : "নিজের দল") },
  { re: /\bmost expensive\b|\bcheapest\b|\bhighest\b|\blowest\b|\bmaximum\b|\bminimum\b|equal to the (?:maximum|minimum|average)|সবচেয়ে|সর্বোচ্চ|সর্বনিম্ন/gi, pattern: "extreme", label: (english ? "Maximum or minimum" : "সর্বোচ্চ/সর্বনিম্ন") },
  { re: /\baverage number\b|\bmust still be counted\b|\bdoes not appear\b|\bincluding (?:those|students|customers)\b|শূন্য/gi, pattern: "avg-zero", label: (english ? "Include zero" : "শূন্যসহ") },
  { re: /\bsupervisor\b|\bmanager\b|\bboss\b|ম্যানেজার|বস/gi, pattern: "self-join", label: (english ? "Manager or supervisor" : "বস/ম্যানেজার") },
  { re: /\b\d+ or \d+\b|\bafter\b|\bbefore\b|\bsorted by\b|\bdescending\b|\bascending\b/gi, pattern: "filter-join", label: (english ? "Filter and sort" : "ছাঁকা ও সাজানো") },
  { re: /\bview\b/gi, tip: (english ? "If the question asks for a view, fill in the View name field." : "\"Create a view\": যেকোনো টেমপ্লেটে \"View-এর নাম\" ঘরটা ভরো।"), label: "View" },
  { re: /relational algebra/gi, tip: (english ? "Use the no-match template for relational algebra. π projects columns, σ filters rows, ⋈ joins, and − subtracts compatible sets." : "Relational Algebra চাইছে: \"কখনো না\" টেমপ্লেট Algebra-ও লিখে দেয়। π = SELECT, σ = WHERE, ⋈ = JOIN, − = বিয়োগ।"), label: "Relational Algebra" },
  { re: /\baverage\b|গড়/gi, tip: (english ? "Decide whether the average is overall or per group, and whether to count people with zero activity." : "\"average\": সবার গড় নাকি প্রতি দলের? কারো শূন্য থাকলে তাকেও গুনতে হবে কি না দেখো।"), label: (english ? "Average" : "গড়") },
  { re: /\bin the year \d{4}\b|\bin \d{4}\b/gi, tip: (english ? "Use WHERE with an inclusive start of the year and an exclusive start of the next year." : "বছরের শর্ত: col >= 'YYYY-01-01' AND col < 'পরের বছর-01-01'; এটা WHERE-এ যাবে।"), label: (english ? "Year" : "বছর") },
];

export const signals = makeSignals(false);
export const englishSignals = makeSignals(true);
