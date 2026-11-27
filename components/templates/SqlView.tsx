"use client";

import { tokenizeSQL } from "@/lib/highlight";
import { CopyButton } from "../CopyButton";

/** খালি ঘর ‹…› গোলাপি বাক্সে, বাকিটা বইয়ের CodeBlock-এর মতো রঙে */
function renderPlain(text: string, key: string) {
  return text.split(/(‹[^›]*›)/).map((part, i) =>
    part.startsWith("‹") ? (
      <span key={`${key}-${i}`} className="tpl-hole">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function SqlView({
  code,
  label = "SQL",
  bg = "bg-blue-soft",
  copy = true,
  highlight = true,
}: {
  code: string;
  label?: string;
  bg?: string;
  copy?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="brut-sm min-w-0 max-w-full overflow-hidden bg-card">
      <div className={`flex items-center justify-between border-b-[2.5px] border-ink px-3 py-1.5 ${bg}`}>
        <span className="font-h3 text-sm">{label}</span>
        {copy && <CopyButton text={code} />}
      </div>
      <pre tabIndex={0} className="overflow-x-auto overscroll-x-contain px-3 py-3 font-code text-[0.92rem] leading-relaxed md:px-4 md:text-[0.98rem] xl:text-[1.02rem]">
        <code>
          {highlight
            ? tokenizeSQL(code).map((t, i) =>
                t.type === "plain" ? (
                  renderPlain(t.value, String(i))
                ) : t.type === "com" || t.type === "str" ? (
                  <span key={i} className={`tok-${t.type}`}>
                    {renderPlain(t.value, String(i))}
                  </span>
                ) : (
                  <span key={i} className={`tok-${t.type}`}>
                    {t.value}
                  </span>
                )
              )
            : renderPlain(code, "p")}
        </code>
      </pre>
    </div>
  );
}
