import { Fragment } from "react";
import { ClipboardList, TriangleAlert } from "lucide-react";
import { summaries } from "@/lib/summaries";
import { CodeBlock } from "./CodeBlock";

/** `ব্যাকটিক` অংশকে কোড হিসেবে দেখায় */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded-md border-2 border-ink bg-card px-1 font-code text-[0.85em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

export function SummaryBody({ slug }: { slug: string }) {
  const s = summaries[slug];
  if (!s) return null;
  return (
    <div className="space-y-4">
      <ul className="list-disc space-y-1.5 pl-5">
        {s.points.map((p, i) => (
          <li key={i}>
            <Inline text={p} />
          </li>
        ))}
      </ul>
      {s.syntax && (
        <CodeBlock>
          <code className="language-sql">{s.syntax}</code>
        </CodeBlock>
      )}
      {s.traps && s.traps.length > 0 && (
        <div className="rounded-xl border-[2.5px] border-dashed border-ink bg-pink-soft p-3.5">
          <p className="flex items-center gap-2 font-h3">
            <TriangleAlert className="size-4" strokeWidth={2.6} aria-hidden />
            ফাঁদ
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5">
            {s.traps.map((t, i) => (
              <li key={i}>
                <Inline text={t} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** লেভেলের শেষে, কুইজের আগে: এক নজরে সারাংশ */
export function Summary({ slug }: { slug: string }) {
  if (!summaries[slug]) return null;
  return (
    <section className="brut relative mt-14 bg-green-soft p-5 sm:p-7" aria-labelledby={`summary-${slug}`}>
      <span aria-hidden className="tape -top-3.5 right-10 -rotate-3" />
      <h2 id={`summary-${slug}`} className="!mt-0 flex items-center gap-2 font-h2 text-2xl sm:text-3xl">
        <ClipboardList className="size-7 shrink-0" strokeWidth={2.2} aria-hidden />
        এক নজরে
      </h2>
      <p className="mt-1 font-body text-base text-muted">কুইজের আগে এক মিনিটে ঝালিয়ে নাও। সব লেভেলের সারাংশ একসাথে পাবে রিভিশন পাতায়।</p>
      <div className="mt-4">
        <SummaryBody slug={slug} />
      </div>
    </section>
  );
}
