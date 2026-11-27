// গ্লোবাল সার্চের ডকুমেন্ট বানানো। শুধু বিল্ডের সময় সার্ভারে চলে
// (app/search-index.json/route.ts থেকে), তাই fs ব্যবহার নিরাপদ।
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { levels, kindLabel } from "./levels";
import { summaries } from "./summaries";
import { cheatsheet, englishCheatsheet, englishTricks, tricks } from "./cheatsheet";
import glossary from "./glossary.json";
import { englishDefinitions, englishTerms } from "./english-glossary";
import { englishLevels, englishLevelLabel } from "./english-levels";
import { englishLessons } from "./english-lessons";

export type DocType = "page" | "level" | "section" | "summary" | "term" | "cheat";

export interface SearchDoc {
  id: string;
  type: DocType;
  title: string;
  /** কোথায় আছে: "লেভেল ৪.২ · Window Function" */
  where: string;
  href: string;
  text: string;
}

/** মার্কডাউনের সাজসজ্জা বাদ দিয়ে সাধারণ লেখা */
function plain(md: string): string {
  return md
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*>#|]/g, "") // _ রাখি: CHAR_LENGTH-এর মতো নামে লাগে
    .replace(/\s+/g, " ")
    .trim();
}

function levelName(slug: string) {
  const l = levels.find((x) => x.slug === slug);
  if (!l) return slug;
  return l.kind === "level" ? `লেভেল ${l.label}` : kindLabel(l.kind);
}

/**
 * একটা MDX ফাইলের ## আর ### শিরোনাম। id বানানো হয় github-slugger দিয়ে,
 * ঠিক যেভাবে rehype-slug বানায় (একই লাইব্রেরি, একই ক্রমে), যাতে #লিংক মেলে।
 */
function headings(slug: string, mdx: string): SearchDoc[] {
  const slugger = new GithubSlugger();
  const lines = mdx.split("\n");
  const out: SearchDoc[] = [];
  let inCode = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = plain(m[2]);
    const id = slugger.slug(text);
    if (m[1].length > 3) continue;
    // শিরোনামের পরের প্রথম অনুচ্ছেদ, প্রিভিউ আর খোঁজার জন্য
    let body = "";
    for (let j = i + 1; j < lines.length && body.length < 220; j++) {
      const l = lines[j];
      if (/^#{1,6}\s/.test(l) || l.trimStart().startsWith("```")) break;
      if (l.trim() === "" || l.startsWith("|") || l.startsWith("<")) {
        if (body) break;
        continue;
      }
      body += " " + l;
    }
    out.push({
      id: `${slug}#${id}`,
      type: "section",
      title: text,
      where: `${levelName(slug)} · ${levels.find((x) => x.slug === slug)?.title ?? ""}`,
      href: `/level/${slug}#${id}`,
      text: plain(body).slice(0, 220),
    });
  }
  return out;
}

export function buildSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [
    { id: "page:home", type: "page", title: "সূচিপত্র", where: "পাতা", href: "/", text: "সব লেভেল, জোন, অগ্রগতি, ব্যাজ" },
    { id: "page:cheatsheet", type: "page", title: "চিট শিট", where: "পাতা", href: "/cheatsheet", text: "পুরো SQL এক পাতায়, কপি করার বোতাম, শর্টকাট আর কৌশল" },
    { id: "page:revision", type: "page", title: "রিভিশন", where: "পাতা", href: "/revision", text: "পুরো DBMS চার ধাপে: বেসিক, ইন্টারমিডিয়েট, অ্যাডভান্সড, এক্সপার্ট" },
    { id: "page:glossary", type: "page", title: "শব্দকোষ", where: "পাতা", href: "/glossary", text: "সব জার্গনের সংক্ষিপ্ত সংজ্ঞা" },
  ];

  const dir = path.join(process.cwd(), "content");
  for (const l of levels) {
    const name = levelName(l.slug);
    docs.push({ id: `level:${l.slug}`, type: "level", title: l.title, where: name, href: `/level/${l.slug}`, text: l.topics });

    const file = path.join(dir, `${l.slug}.mdx`);
    if (fs.existsSync(file)) docs.push(...headings(l.slug, fs.readFileSync(file, "utf8")));

    const s = summaries[l.slug];
    if (s) {
      docs.push({
        id: `summary:${l.slug}`,
        type: "summary",
        title: `এক নজরে: ${l.title}`,
        where: name,
        href: `/level/${l.slug}#summary-${l.slug}`,
        text: plain([...s.points, ...(s.traps ?? [])].join(" ")).slice(0, 400),
      });
    }
  }

  for (const g of glossary as { id: string; term: string; def: string; level: string; aliases?: string[] }[]) {
    docs.push({
      id: `term:${g.id}`,
      type: "term",
      title: g.aliases?.length ? `${g.term} (${g.aliases.join(", ")})` : g.term,
      where: "শব্দকোষ",
      href: `/glossary#${g.id}`,
      text: plain(g.def),
    });
  }

  for (const c of cheatsheet) {
    for (const i of c.items) {
      docs.push({
        id: `cheat:${i.id}`,
        type: "cheat",
        title: i.title,
        where: `চিট শিট · ${c.label}`,
        href: `/cheatsheet#cs-${i.id}`,
        text: `${i.code.replace(/\s+/g, " ")} ${i.note ?? ""}`.slice(0, 300),
      });
    }
  }
  for (const t of tricks) {
    docs.push({
      id: `trick:${t.title}`,
      type: "cheat",
      title: t.title,
      where: "চিট শিট · কৌশল",
      href: "/cheatsheet#tricks",
      text: plain(`${t.text} ${t.code ?? ""}`),
    });
  }

  return docs;
}

export function buildEnglishSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [
    { id: "page:home", type: "page", title: "Chapter map", where: "Page", href: "/", text: "All chapters, zones, progress, and badges" },
    { id: "page:cheatsheet", type: "page", title: "Cheat Sheet", where: "Page", href: "/cheatsheet", text: "SQL examples and shortcuts" },
    { id: "page:revision", type: "page", title: "Revision", where: "Page", href: "/revision", text: "Chapter summaries and review questions" },
    { id: "page:glossary", type: "page", title: "Glossary", where: "Page", href: "/glossary", text: "SQL and database definitions" },
    { id: "page:templates", type: "page", title: "SQL Query Templates", where: "Page", href: "/templates", text: "Question scanner, query templates, and a worksheet" },
  ];
  for (const level of levels) {
    const { slug, kind } = level;
    const { title, topics } = englishLevels[slug];
    const label = englishLevelLabel(level);
    const where = kind === "level" ? `Level ${label}` : label;
    const href = `/level/${slug}`;
    docs.push({ id: `level:${slug}`, type: "level", title, where, href, text: topics });
    englishLessons[slug].sections.forEach((section, index) => {
      docs.push({ id: `section:${slug}:${index}`, type: "section", title: section.heading, where: `${where} · ${title}`, href: `${href}#en-section-${index + 1}`, text: section.text });
    });
  }
  for (const term of glossary) {
    docs.push({ id: `term:${term.id}`, type: "term", title: englishTerms[term.id] ?? term.term, where: "Glossary", href: `/glossary#${term.id}`, text: englishDefinitions[term.id] });
  }
  for (const category of englishCheatsheet) {
    for (const item of category.items) {
      docs.push({ id: `cheat:${item.id}`, type: "cheat", title: item.title, where: `Cheat Sheet · ${category.label}`, href: `/cheatsheet#cs-${item.id}`, text: `${item.code.replace(/\s+/g, " ")} ${item.note ?? ""}`.slice(0, 300) });
    }
  }
  for (const tip of englishTricks) {
    docs.push({ id: `trick:${tip.title}`, type: "cheat", title: tip.title, where: "Cheat Sheet · Tips", href: "/cheatsheet#tricks", text: plain(`${tip.text} ${tip.code ?? ""}`) });
  }
  return docs;
}
