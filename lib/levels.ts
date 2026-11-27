// পুরো বইয়ের একমাত্র "সূচি"। নতুন লেভেল যোগ করতে হলে এখানে একটা এন্ট্রি
// আর content/ ফোল্ডারে একই slug-এর একটা .mdx ফাইল যোগ করলেই হবে।

export type ZoneId = "zone-1" | "zone-2" | "zone-3" | "zone-4" | "zone-5" | "zone-final";

export interface Zone {
  id: ZoneId;
  number: string;
  name: string;
  tagline: string;
  badge: { id: string; name: string; emoji: string };
}

export type LevelKind = "level" | "mini-boss" | "final-boss" | "bonus";

export interface Level {
  slug: string;
  /** দেখানোর জন্য: "০", "১২", "মিনি বস", "বোনাস" */
  label: string;
  kind: LevelKind;
  zone: ZoneId;
  title: string;
  topics: string;
  xp: number;
}

export const zones: Zone[] = [
  {
    id: "zone-1",
    number: "১",
    name: "শুরুর গ্রাম",
    tagline: "টেবিল বানানো, ডেটা ঢোকানো আর খুঁজে বের করা",
    badge: { id: "badge-zone-1", name: "গ্রামের হিরো", emoji: "🌱" },
  },
  {
    id: "zone-2",
    number: "২",
    name: "শহর",
    tagline: "ফাংশন, গ্রুপিং, নিয়ম আর টেবিল জোড়া",
    badge: { id: "badge-zone-2", name: "শহরের নায়ক", emoji: "🏙️" },
  },
  {
    id: "zone-3",
    number: "৩",
    name: "রাজধানী",
    tagline: "ইউনি-লেভেল: ডিজাইন, নরমালাইজেশন, ইনডেক্স, ট্রানজ্যাকশন",
    badge: { id: "badge-zone-3", name: "রাজধানীর রাজা", emoji: "🏛️" },
  },
  {
    id: "zone-4",
    number: "৪",
    name: "মাস্টার ক্লাস",
    tagline: "উন্নত লেখা, Window Function, CTE, জটিল কুয়েরির প্যাটার্ন আর প্র্যাকটিস অ্যারেনা",
    badge: { id: "badge-zone-4", name: "কুয়েরি জাদুকর", emoji: "🪄" },
  },
  {
    id: "zone-5",
    number: "৫",
    name: "প্রশ্ন ভাঙার কারখানা",
    tagline: "বড় প্রশ্নকে টুকরো করে শূন্য থেকে Query লেখা; CSE2238 অ্যাসাইনমেন্টের ৪টা প্রশ্ন, ব্রাউজারেই চালিয়ে দেখো",
    badge: { id: "badge-zone-5", name: "প্রবলেম সলভার", emoji: "🧩" },
  },
  {
    id: "zone-final",
    number: "শেষ",
    name: "শেষ জোন",
    tagline: "নিজের প্রজেক্ট আর পরীক্ষার প্রস্তুতি",
    badge: { id: "badge-zone-final", name: "ডেটাবেস মাস্টার", emoji: "👑" },
  },
];

export const levels: Level[] = [
  // জোন ১
  { slug: "level-0", label: "০", kind: "level", zone: "zone-1", title: "ডেস্কে বসা (প্রোলগ)", topics: "ডেটাবেস কেন লাগে, কোথায় ব্যবহার হয়, কীভাবে কাজ করে; ১০ লাইনের ডেমো", xp: 100 },
  { slug: "level-1", label: "১", kind: "level", zone: "zone-1", title: "টেবিলের জগৎ", topics: "Table, Row, Column, Data Type, CREATE", xp: 100 },
  { slug: "level-2", label: "২", kind: "level", zone: "zone-1", title: "ডেটা ঢোকানো আর বদলানো", topics: "INSERT, UPDATE, DELETE, সাথে ALTER, DROP", xp: 100 },
  { slug: "level-3", label: "৩", kind: "level", zone: "zone-1", title: "ডেটা খুঁজে বের করা", topics: "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, Alias", xp: 100 },
  { slug: "level-4", label: "৪", kind: "level", zone: "zone-1", title: "শর্টকাট", topics: "LIKE, IN, BETWEEN, NULL", xp: 100 },
  { slug: "level-5", label: "৫", kind: "level", zone: "zone-1", title: "অগ্রাধিকার মিশন", topics: "AND/OR/NOT আর Operator Precedence", xp: 100 },
  { slug: "boss-1", label: "মিনি বস", kind: "mini-boss", zone: "zone-1", title: "ছোট্ট দোকানের Database", topics: "জোন ১-এর সব একসাথে", xp: 200 },
  // জোন ২
  { slug: "level-6", label: "৬", kind: "level", zone: "zone-2", title: "ফাংশনের জাদু", topics: "String, Number, Date Function, CASE", xp: 120 },
  { slug: "level-7", label: "৭", kind: "level", zone: "zone-2", title: "হিসাব-নিকাশ", topics: "COUNT, SUM, AVG, MIN, MAX", xp: 120 },
  { slug: "level-8", label: "৮", kind: "level", zone: "zone-2", title: "দল বাঁধা", topics: "GROUP BY, HAVING, Query-র Execution Order", xp: 120 },
  { slug: "level-9", label: "৯", kind: "level", zone: "zone-2", title: "নিয়মের পাহারা", topics: "PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, CHECK", xp: 120 },
  { slug: "level-10", label: "১০", kind: "level", zone: "zone-2", title: "টেবিল জোড়া (১)", topics: "কেন অনেক টেবিল, বেশি Column নাকি বেশি Row (JOIN বনাম UNION), INNER JOIN, Alias", xp: 120 },
  { slug: "level-11", label: "১১", kind: "level", zone: "zone-2", title: "টেবিল জোড়া (২)", topics: "LEFT, RIGHT, FULL JOIN, Anti Join, CROSS JOIN, অনেক টেবিল, Self Join", xp: 120 },
  { slug: "level-12", label: "১২", kind: "level", zone: "zone-2", title: "কুয়েরির ভেতরে কুয়েরি", topics: "Subquery, EXISTS, UNION", xp: 120 },
  { slug: "boss-2", label: "মিনি বস", kind: "mini-boss", zone: "zone-2", title: "লাইব্রেরি ম্যানেজমেন্ট", topics: "জোন ২-এর Query-যুদ্ধ", xp: 250 },
  // জোন ৩
  { slug: "level-13", label: "১৩", kind: "level", zone: "zone-3", title: "রিলেশনাল মডেল", topics: "Super, Candidate ও Primary Key, Relational Algebra-র বেসিক", xp: 150 },
  { slug: "level-14", label: "১৪", kind: "level", zone: "zone-3", title: "ডেটাবেস ডিজাইন", topics: "ER Diagram, ১:১, ১:N, M:N", xp: 150 },
  { slug: "level-15", label: "১৫", kind: "level", zone: "zone-3", title: "নরমালাইজেশন", topics: "1NF, 2NF, 3NF, BCNF", xp: 150 },
  { slug: "level-16", label: "১৬", kind: "level", zone: "zone-3", title: "গতির খেলা", topics: "Index, EXPLAIN, Query দ্রুত করা", xp: 150 },
  { slug: "level-17", label: "১৭", kind: "level", zone: "zone-3", title: "জাদুর হাতিয়ার", topics: "View, Stored Procedure, Function, Trigger", xp: 150 },
  { slug: "level-18", label: "১৮", kind: "level", zone: "zone-3", title: "ট্রানজ্যাকশনের দরবার", topics: "COMMIT, ROLLBACK, ACID, Isolation Level, Deadlock-এর বেসিক", xp: 150 },
  { slug: "level-19", label: "১৯", kind: "level", zone: "zone-3", title: "নিরাপত্তা ও ব্যাকআপ", topics: "User, Privilege, Backup/Restore, লেভেল ০-এর ডেমোর SQL Injection ফাঁক বন্ধ করা", xp: 150 },
  // জোন ৪
  { slug: "level-4-1", label: "৪.১", kind: "level", zone: "zone-4", title: "লেখার উন্নত কৌশল", topics: "INSERT ... SELECT, Upsert, INSERT IGNORE, REPLACE, JOIN দিয়ে UPDATE আর DELETE, CREATE TABLE ... AS", xp: 180 },
  { slug: "level-4-2", label: "৪.২", kind: "level", zone: "zone-4", title: "Window Function", topics: "ROW_NUMBER, RANK, DENSE_RANK, PARTITION BY, চলমান যোগফল, LAG/LEAD, NTILE", xp: 180 },
  { slug: "level-4-3", label: "৪.৩", kind: "level", zone: "zone-4", title: "CTE আর Recursive Query", topics: "WITH, একাধিক CTE, Recursive: সংখ্যার সারি, তারিখের ফাঁক, পদের গাছ", xp: 180 },
  { slug: "level-4-4", label: "৪.৪", kind: "level", zone: "zone-4", title: "জটিল কুয়েরির প্যাটার্ন", topics: "Relational Division, শূন্যসহ গড়, নিজের দলের গড়, সর্বোচ্চের খোঁজ, Pivot, WITH ROLLUP", xp: 200 },
  { slug: "level-4-5", label: "৪.৫", kind: "level", zone: "zone-4", title: "প্র্যাকটিস অ্যারেনা", topics: "৪টা নতুন Database, সহজ থেকে বস পর্যন্ত ধাপে ধাপে প্রশ্ন, ইঙ্গিতসহ", xp: 300 },
  // জোন ৫: প্রতিটা প্রবলেমের Database public/sql/assignment/-এ, পাতায় ব্রাউজারেই চলে (components/SqlRunner)
  { slug: "level-5-1", label: "৫.১", kind: "level", zone: "zone-5", title: "প্রশ্ন ভাঙার কৌশল", topics: "শূন্য থেকে Query: প্রতি Row-তে কী, শব্দ থেকে SQL-এর অংশ, হাতে উত্তর, ছোট ধাপে বানানো, ফাঁদের চেকলিস্ট", xp: 200 },
  { slug: "level-5-2", label: "৫.২", kind: "level", zone: "zone-5", title: "প্রবলেম ১: কোর্স রেজিস্ট্রেশন", topics: "অন্তত একটা CSE কোর্স, Dr. Rahman-এর প্রতিটা কোর্স (Division), শূন্যসহ গড়", xp: 200 },
  { slug: "level-5-3", label: "৫.৩", kind: "level", zone: "zone-5", title: "প্রবলেম ২: স্টাফ আর ব্রাঞ্চ", topics: "নিজের ব্রাঞ্চের গড়ের চেয়ে বেশি (View), ব্রাঞ্চ আর তারিখের শর্ত, Self Join-এ supervisor", xp: 200 },
  { slug: "level-5-4", label: "৫.৪", kind: "level", zone: "zone-5", title: "প্রবলেম ৩: অনলাইন শপ", topics: "Relational Algebra-য় কখনো অর্ডার না, ২০২৫-এর ক্যাটাগরি বিক্রি আর HAVING, সবচেয়ে দামি পণ্যের ক্রেতা", xp: 200 },
  { slug: "level-5-5", label: "৫.৫", kind: "level", zone: "zone-5", title: "প্রবলেম ৪: Emp আর Dept", topics: "MAX, MIN বা AVG-এর সমান বেতন (View), বিভাগ ১০ বা ৪০-এর কর্মী", xp: 200 },
  // শেষ জোন
  { slug: "level-20", label: "২০", kind: "final-boss", zone: "zone-final", title: "ফাইনাল বস", topics: "নিজের একটা পুরো প্রজেক্ট, ডিজাইন থেকে Query পর্যন্ত", xp: 400 },
  { slug: "bonus", label: "বোনাস", kind: "bonus", zone: "zone-final", title: "পরীক্ষা ও ইন্টারভিউ", topics: "ইউনির কমন প্রশ্ন, ভাইভা, ইন্টারভিউ টিপস, Cheat Sheet", xp: 150 },
];

export const totalXP = levels.reduce((sum, l) => sum + l.xp, 0);

export function getLevel(slug: string): Level | undefined {
  return levels.find((l) => l.slug === slug);
}

export function getZone(id: ZoneId): Zone {
  const z = zones.find((z) => z.id === id);
  if (!z) throw new Error(`Unknown zone: ${id}`);
  return z;
}

export function getNeighbours(slug: string) {
  const i = levels.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? levels[i - 1] : undefined,
    next: i >= 0 && i < levels.length - 1 ? levels[i + 1] : undefined,
  };
}

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function toBn(n: number | string): string {
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

export function kindLabel(kind: LevelKind): string {
  switch (kind) {
    case "mini-boss":
      return "মিনি বস";
    case "final-boss":
      return "ফাইনাল বস";
    case "bonus":
      return "বোনাস";
    default:
      return "লেভেল";
  }
}

/** জোনের স্টিকার-রঙ (Tailwind ক্লাস) */
export const zoneBg: Record<ZoneId, string> = {
  "zone-1": "bg-green",
  "zone-2": "bg-blue",
  "zone-3": "bg-pink",
  "zone-4": "bg-orange",
  "zone-5": "bg-yellow",
  "zone-final": "bg-purple",
};
