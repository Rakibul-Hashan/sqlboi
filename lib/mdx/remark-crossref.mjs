// বিল্ডের সময় চলে: লেখার ভেতরের শব্দকোষের শব্দ আর "লেভেল ১৯" ধরনের উল্লেখকে
// টুলটিপ আর লিংকে বদলে দেয়। তাই ২৪টা MDX ফাইলে হাতে হাতে ট্যাগ বসাতে হয় না।
import fs from "node:fs";
import path from "node:path";
import { visit, SKIP } from "unist-util-visit";

const bnToEn = (s) => s.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));

let cache;
function loadData() {
  if (cache) return cache;
  const root = process.cwd();
  const glossary = JSON.parse(fs.readFileSync(path.join(root, "lib/glossary.json"), "utf8"));
  const slugs = fs.readdirSync(path.join(root, "content")).map((f) => f.replace(/\.mdx$/, ""));
  // বইয়ের ক্রম (lib/levels.ts-এ যে ক্রমে লেখা): "upto" বোঝার জন্য
  const order = [...fs.readFileSync(path.join(root, "lib/levels.ts"), "utf8").matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
  const rank = new Map(order.map((s, i) => [s, i]));

  const terms = []; // লেখার ভেতরে খোঁজা হবে
  const byCode = new Map(); // `ইনলাইন কোড` হুবহু মিললে
  const meta = new Map();
  for (const g of glossary) {
    meta.set(g.id, { upto: g.upto ? rank.get(g.upto) : undefined });
    for (const t of [g.term, ...(g.aliases ?? [])]) {
      byCode.set(t, g.id);
      if (!g.codeOnly) terms.push({ text: t, id: g.id });
    }
  }
  terms.sort((a, b) => b.text.length - a.text.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const termRe = new RegExp(
    "(?<![A-Za-z0-9_\\u0980-\\u09FF])(" + terms.map((t) => esc(t.text)).join("|") + ")(?![A-Za-z0-9_])",
    "g"
  );
  const byText = new Map(terms.map((t) => [t.text, t.id]));
  cache = { termRe, byText, byCode, meta, rank, slugs: new Set(slugs) };
  return cache;
}

const LEVEL_RE = /(লেভেল\s+([০-৯]+(?:\.[০-৯]+)?)|মিনি বস\s+([১২]))(?![০-৯])/g;

function refSlug(m) {
  if (m[3]) return `boss-${bnToEn(m[3])}`;
  const n = bnToEn(m[2]);
  return n.includes(".") ? `level-${n.replace(".", "-")}` : `level-${n}`;
}

const SKIP_PARENTS = new Set(["heading", "link", "linkReference", "code", "tableCell"]);
const SKIP_JSX = new Set(["Term", "LevelRef", "Checkpoint", "Flow", "ErrorBox"]);

export default function remarkCrossref() {
  return (tree, file) => {
    const { termRe, byText, byCode, meta, rank, slugs } = loadData();
    const current = path.basename(String(file.path ?? file.history?.[0] ?? ""), ".mdx");
    const here = rank.get(current);
    const seen = new Set();
    // শুরুর দিকের শব্দ ("Database", `WHERE`) উন্নত লেভেলে আর ব্যাখ্যা করি না
    const allowed = (id) => {
      const u = meta.get(id)?.upto;
      return u === undefined || here === undefined || here <= u;
    };

    visit(tree, (node, index, parent) => {
      if (SKIP_PARENTS.has(node.type)) return SKIP;
      if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && SKIP_JSX.has(node.name)) return SKIP;
      if (node.type === "inlineCode") {
        // `GROUP BY`-এর মতো কোড হুবহু শব্দকোষে থাকলে, পাতায় প্রথমবার টুলটিপ
        const id = byCode.get(node.value.trim());
        if (id && !seen.has(id) && allowed(id) && parent && index != null && parent.type !== "mdxJsxTextElement") {
          seen.add(id);
          parent.children.splice(index, 1, {
            type: "mdxJsxTextElement",
            name: "Term",
            attributes: [{ type: "mdxJsxAttribute", name: "id", value: id }],
            children: [node],
          });
        }
        return SKIP;
      }
      if (node.type !== "text" || !parent || index == null) return;

      const value = node.value;
      const hits = [];
      for (const m of value.matchAll(LEVEL_RE)) {
        const slug = refSlug(m);
        if (slug !== current && slugs.has(slug)) hits.push({ start: m.index, end: m.index + m[0].length, kind: "level", slug, text: m[0] });
      }
      for (const m of value.matchAll(termRe)) {
        const id = byText.get(m[1]);
        if (seen.has(id) || !allowed(id)) continue;
        const start = m.index;
        if (hits.some((h) => start < h.end && start + m[1].length > h.start)) continue;
        seen.add(id);
        hits.push({ start, end: start + m[1].length, kind: "term", id, text: m[1] });
      }
      if (!hits.length) return;
      hits.sort((a, b) => a.start - b.start);

      const out = [];
      let pos = 0;
      for (const h of hits) {
        if (h.start < pos) continue;
        if (h.start > pos) out.push({ type: "text", value: value.slice(pos, h.start) });
        out.push({
          type: "mdxJsxTextElement",
          name: h.kind === "term" ? "Term" : "LevelRef",
          attributes: [{ type: "mdxJsxAttribute", name: h.kind === "term" ? "id" : "slug", value: h.kind === "term" ? h.id : h.slug }],
          children: [{ type: "text", value: h.text }],
        });
        pos = h.end;
      }
      if (pos < value.length) out.push({ type: "text", value: value.slice(pos) });
      parent.children.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}
