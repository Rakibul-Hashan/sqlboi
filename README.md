# MySQL বই

একজন সম্পূর্ণ নতুন পাঠক ৩১টা লেভেল পেরিয়ে ইউনি-লেভেলের MySQL শিখে ফেলবে, গেম খেলার মতো করে।

Next.js 16 (App Router) + MDX + Tailwind CSS 4, স্কেচবুক (খাতার পাতা) ডিজাইন। সব পাতা Static (SSG), কোনো Database বা সার্ভার-কোড লাগে না। পাঠকের XP, ব্যাজ আর আনলক শুধু তার ব্রাউজারের `localStorage`-এ থাকে।

## UI লাইব্রেরি

| কাজ | লাইব্রেরি |
| --- | --- |
| আইকন | `lucide-react` |
| মোডাল আর off-canvas সূচি | `radix-ui` (Dialog), shadcn/ui-ধাঁচে `components/ui/` |
| অ্যানিমেশন | `motion` (আগের Framer Motion); সিস্টেমে Reduce motion চালু থাকলে বন্ধ |
| কনফেটি | `canvas-confetti` (শুধু লেভেল পার হলে লোড হয়) |
| টোস্ট ("+১০ XP") | `sonner` |
| কোডের ফন্ট | `@fontsource-variable/jetbrains-mono` (self-hosted) |
| টুলটিপ, পপওভার, ট্যাব | `radix-ui` (Tooltip, Popover, Tabs) |
| গ্লোবাল সার্চ | `cmdk` (কমান্ড প্যালেট) + `minisearch` (ব্রাউজারেই খোঁজে, সার্ভার লাগে না) |
| শিরোনামের `#id` | `rehype-slug` (সার্চের লিংকও একই `github-slugger` দিয়ে বানানো) |
| ক্রস-রেফারেন্স | নিজস্ব remark প্লাগইন `lib/mdx/remark-crossref.mjs` (`unist-util-visit`) |

## চালানো

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # প্রোডাকশন বিল্ড
npm start
```

Node.js 20.9 বা নতুন লাগবে।

## Deploy (Vercel)

1. প্রজেক্টটা একটা GitHub রিপোতে push করো।
2. [vercel.com](https://vercel.com) → **Add New Project** → রিপো বাছাই → **Deploy**। কোনো সেটিং বদলাতে হবে না।
3. (ঐচ্ছিক) Environment Variable `NEXT_PUBLIC_SITE_URL` = তোমার ডোমেইন (যেমন `https://mysql.poralekha.com`), যাতে সোশ্যাল শেয়ারের লিংক ঠিক আসে।

অন্য হোস্টে (Netlify, Cloudflare Pages, GitHub Pages) Static হিসেবে দিতে চাইলে `next.config.mjs`-এ `output: "export"` যোগ করে `npm run build` চালাও; `out/` ফোল্ডারটা আপলোড করো। (তখন `headers()` অংশটা সরিয়ে হোস্টের নিজস্ব হেডার সেটিং ব্যবহার করো।)

## পাতা আর ফিচার

| পাতা | কী আছে |
| --- | --- |
| `/` | ম্যাপ, অগ্রগতি, ব্যাজ |
| `/level/<slug>` | ৩১টা লেভেল; প্রতিটার শেষে "এক নজরে" সারাংশ আর Checkpoint |
| `/templates` | প্রশ্ন ভাঙার টেমপ্লেট: প্রশ্ন পেস্ট করলে সংকেত-শব্দ দাগিয়ে নকশা বলে দেয়; ৯টা ফাঁকা-ভরা টেমপ্লেট (অ্যাসাইনমেন্টের উদাহরণসহ, Relational Algebra-ও), আর ছয় ধাপের ছক যা ভরতে ভরতে Query বানায়; সব ব্রাউজারেই চলে। `?p=<id>` দিয়ে সরাসরি একটা টেমপ্লেট |
| `/level/level-5-1` … `level-5-5` | জোন ৫, প্রশ্ন ভাঙার কারখানা: শূন্য থেকে Query লেখার পদ্ধতি, তারপর CSE2238 অ্যাসাইনমেন্টের ৪টা প্রশ্ন আলাদা পাতায়, প্রতিটা Query ব্রাউজারেই চালানো যায় |
| `/level/level-4-5` | প্র্যাকটিস অ্যারেনা: ৪টা Database, ১৬টা প্রশ্ন, সহজ থেকে বস, ধাপে ধাপে ইঙ্গিত |
| `/cheatsheet` | পুরো SQL এক পাতায়: খোঁজা, বিভাগ ফিল্টার, কপি বোতাম, কৌশল আর কিবোর্ড শর্টকাট |
| `/revision` | পুরো DBMS চার ধাপে (বেসিক → এক্সপার্ট), সারাংশ, ফাঁদ, নিজেকে যাচাই |
| `/glossary` | সব জার্গনের সংজ্ঞা |
| `/search-index.json` | গ্লোবাল সার্চের সূচি; বিল্ডের সময় বানানো স্থির JSON |

- **গ্লোবাল সার্চ:** যেকোনো পাতায় `Ctrl K` / `⌘ K` বা `/`। লেভেল, প্রতিটা শিরোনাম, সারাংশ, শব্দকোষ আর চিট শিট সবই খোঁজে। সূচিটা প্রথমবার সার্চ খুললে তবেই নামে।
- **লেভেলে চলাচল:** `[` আগের লেভেল, `]` পরের লেভেল।
- **ক্রস-রেফারেন্স:** লেখায় শব্দকোষের শব্দ (পাতায় প্রথমবার) আপনা-আপনি নীল ডট-দাগ পায়, hover বা ট্যাপে সংজ্ঞা; "লেভেল ১২", "লেভেল ৪.৩", "মিনি বস ২" লেখা আপনা-আপনি লিংক হয়।

## গঠন

```
app/
  layout.tsx            ফন্ট, হেডার, ফুটার (lipighor ব্যাকলিংক সহ)
  page.tsx              প্রচ্ছদ, উপমা কার্ড, চার খাতার সূচি, স্টিকার
  level/[slug]/page.tsx প্রতিটা লেভেলের পাতা
  fonts/                ৬টা Li ফন্ট (Unicode সংস্করণ, woff2-তে রূপান্তরিত)
  globals.css           রঙের টোকেন (ডকের "রঙের নিয়ম") আর বইয়ের টাইপোগ্রাফি
  cheatsheet/ revision/ glossary/   নতুন পাতাগুলো
  search-index.json/route.ts        সার্চের সূচি (force-static)
content/*.mdx           ২৯টা অধ্যায়ের লেখা
components/             Mission, Quest, BugMonster, Boss, Checkpoint, Tip, Remember, ERDiagram...
components/SiteHeader   হেডার + off-canvas সূচি
components/SearchDialog সার্চ প্যালেট আর Ctrl K / "/" শর্টকাট
components/CrossRef     Term (পপওভার) আর LevelRef (টুলটিপ)
components/ui/          Dialog, Sheet, Hint (Radix)
lib/glossary.json       শব্দকোষ; ক্রস-রেফারেন্স প্লাগইনও এখান থেকে পড়ে
lib/summaries.ts        প্রতিটা লেভেলের "এক নজরে" সারাংশ (লেভেল আর রিভিশন পাতা দুটোতেই)
lib/cheatsheet.ts       চিট শিটের কার্ড (পাতা আর সার্চ দুটোতেই)
lib/search-docs.ts      সার্চের ডকুমেন্ট বানায় (বিল্ডের সময়)
lib/levels.ts           পুরো সূচি: লেভেল, জোন, XP, ব্যাজ
lib/progress.ts         localStorage-এ অগ্রগতি
lib/highlight.ts        নির্ভরতাহীন SQL হাইলাইটার (বিল্ডের সময় চলে)
public/sql/             পাঠকের জন্য সেটআপ স্ক্রিপ্ট (school, shop, library, coaching, arena)
public/sql/assignment/  জোন ৫-এর ৪টা Database (q1-course, q2-staff, q3-shop, q4-emp); নামানো যায়, ব্রাউজারও এগুলোই লোড করে
public/sqljs/           sql.js 1.17.0 (SQLite 3.54, WebAssembly, MIT), self-hosted
lib/sql-engine.ts       ব্রাউজারে SQL চালানো: ইঞ্জিন লোড, MySQL ফাইল থেকে seed, YEAR/MONTH/DAY, CREATE OR REPLACE VIEW
components/SqlRunner    "চালাও" বোতাম (SqlRunner) আর খোলা এডিটর (Playground)
components/Run          MDX-এর ```sql ব্লকের নিচে "চালাও" জোড়ে
lib/templates.ts        টেমপ্লেটের নকশা: সংকেত-শব্দ, ঘর, উদাহরণ (preset), SQL বানানোর ফাংশন
components/templates/   /templates পাতার স্ক্যানার, টেমপ্লেট আর ছক
components/TextSize     হেডারের অ−/অ+ (লেখার আকার; <html data-text>, localStorage-এ মনে রাখে)
```

## নতুন লেভেল যোগ করা

1. `lib/levels.ts`-এ `levels` তালিকায় একটা এন্ট্রি যোগ করো (ক্রম অনুযায়ী; আনলক এই ক্রমেই চলে)।
2. `content/<slug>.mdx` বানাও।
3. `lib/content.ts`-এ একটা লাইন যোগ করো।
4. `lib/summaries.ts`-এ সারাংশ লেখো, আর MDX-এ Checkpoint-এর ঠিক আগে `<Summary slug="<slug>" />`।

**শব্দকোষের এন্ট্রি** (`lib/glossary.json`): `id`, `term`, `aliases`, `def`, `level` (বিস্তারিত কোন লেভেলে), আর দুটো ঐচ্ছিক ঘর:
- `codeOnly: true`: শুধু `ইনলাইন কোড` হুবহু মিললে টুলটিপ (`WHERE`, `GROUP BY`-এর মতো কিওয়ার্ডের জন্য), সাধারণ লেখায় না।
- `upto: "<slug>"`: শুধু এই লেভেল পর্যন্ত টুলটিপ। শুরুর শব্দ ("Database", `WHERE`) উন্নত লেভেলে আবার ব্যাখ্যা হয় না।

> **শব্দকোষ বদলালে:** `lib/glossary.json` বদলানোর পর `rm -rf .next` করে আবার চালাও। Turbopack কম্পাইল করা MDX ক্যাশে রাখে, আর remark প্লাগইন বদলানো JSON দেখতে পায় না।

MDX-এ যে কম্পোনেন্টগুলো সরাসরি ব্যবহার করা যায়: `<Mission>`, `<Story title>`, `<Analogy>`, `<Tip>` (সলিড হলুদ), `<Remember>` (সলিড গোলাপি; এই চার বাক্সের লেবেলেই শুধু Mustafa ফন্ট, ভেতরের লেখা Alinur), `<Note title>`, `<Success>`, `<ErrorBox title>`, `<BugMonster title>`, `<Quest id title>`, `<Boss id title>`, `<Challenge id tier title>` (tier: `easy` · `medium` · `hard` · `boss`; কঠিন আর বসে বসের সমান XP), `<Solution title>`, `<Flow steps={[...]} />`, `<ERDiagram />`, আর শেষে `<Checkpoint questions={[{ q, options, answer, why }]} />`। ডকের নিয়ম মেনে এক পাতায় `Tip` আর `Remember` মিলিয়ে সর্বোচ্চ একটা-দুটো।

## ব্রাউজারে SQL চালানো (জোন ৫)

MDX-এ যেকোনো SQL ব্লক চালানোর মতো করতে:

````mdx
<Run db="q3-shop">
```sql
SELECT * FROM customer;
```
</Run>

<Playground db="q3-shop" />
````

- **কোনো সার্ভার নেই।** sql.js (SQLite-এর WebAssembly রূপ) পাঠকের ব্রাউজারে চলে; ইঞ্জিন (~৭৫০ KB) শুধু প্রথমবার "চালাও" চাপলে নামে। পাঠকের Query তার নিজের মেমরিতেই থাকে, তাই কোনো নিরাপত্তা-ঝুঁকি নেই।
- **একটাই ডেটার উৎস।** `public/sql/assignment/<db>.sql` হলো সাধারণ MySQL ফাইল; ব্রাউজার শুধু `DROP/CREATE DATABASE` আর `USE` লাইন বাদ দিয়ে বাকিটা চালায়।
- `<Run>` প্রতিবার নতুন, ভরা Database-এ চলে (উত্তর সবসময় বইয়ের সাথে মেলে); `<Playground>`-এর Database "রিসেট" পর্যন্ত থাকে, তাই View বানিয়ে পরে `SELECT` করা যায়।
- MySQL-এর যা SQLite বোঝে না, তার মধ্যে এই অধ্যায়ে যা লাগে: `CREATE OR REPLACE VIEW` (বদলে `DROP VIEW IF EXISTS` + `CREATE VIEW`), আর `YEAR()`, `MONTH()`, `DAY()` (নিজস্ব Function হিসেবে যোগ করা)। নতুন MySQL-নির্দিষ্ট কিছু ব্যবহার করলে `lib/sql-engine.ts`-এ যোগ করো, নয়তো সমতুল্য স্ট্যান্ডার্ড লেখা দাও।
- **নতুন Database যোগ করতে:** `public/sql/assignment/`-এ ফাইল, `lib/sql-engine.ts`-এর `DbName`-এ নাম, আর `components/SqlRunner.tsx`-এর `DB_INFO`-তে লেবেল ও টেবিলের তালিকা।
- sql.js হালনাগাদ করতে: `npm i -D sql.js@latest`, তারপর `node_modules/sql.js/dist/sql-wasm.{js,wasm}` দুটো `public/sqljs/`-এ কপি।

## গুণমান যাচাই

জোন ৫-এর প্রতিটা `<Run>` ব্লক দুই জায়গায় চালিয়ে মেলানো হয়েছে: MariaDB 10.11 (XAMPP-এর ইঞ্জিন) আর পাতার নিজের SQLite ইঞ্জিন; দুটোয় একই Row এসেছে (শুধু দশমিক দেখানোয় পার্থক্য, যেমন `2.5000` বনাম `2.5`)। একটাই জায়গায় ইচ্ছাকৃত পার্থক্য দেখানো আছে: সমান দামে `LIMIT 1` কোন Row রাখে, যেটা ইঞ্জিনভেদে বদলায় (লেভেল ৫.৪)। বাকি বইয়ের প্রতিটা SQL ব্লক MySQL 8.0.46-এ চালানো হয়েছে, আর প্রতিটা ফলাফল-টেবিল আসল আউটপুটের সাথে মেলানো হয়েছে। লেভেল ০ আর ১৯-এর PHP কোড PHP 8.3-এ চালিয়ে দেখা হয়েছে (SQL Injection আক্রমণ আর তার সমাধান দুটোই)।

## ফন্ট

ফন্টগুলো [লিপিঘর](https://lipighor.com)-এর। লাইসেন্স অনুযায়ী ওয়েবফন্ট ব্যবহারের অনুমতি নেওয়া হয়েছে, আর ফুটারে "ওয়েবফন্ট- lipighor.com" ব্যাকলিংক আছে; এটা সরাবে না। ফন্ট ফাইলগুলো অন্য কোথাও আলাদাভাবে বিতরণ করা লাইসেন্সে নিষেধ, তাই রিপো public করলে `app/fonts/` ফোল্ডার নিয়ে সাবধান থেকো।
