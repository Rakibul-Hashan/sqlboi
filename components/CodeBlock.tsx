import { isValidElement } from "react";
import { tokenizeSQL } from "@/lib/highlight";
import { CopyButton } from "./CopyButton";

const LANG: Record<string, { label: string; bg: string }> = {
  sql: { label: "SQL", bg: "bg-blue-soft" },
  php: { label: "PHP", bg: "bg-purple-soft" },
  html: { label: "HTML", bg: "bg-orange-soft" },
  bash: { label: "Terminal", bg: "bg-green-soft" },
  sh: { label: "Terminal", bg: "bg-green-soft" },
  text: { label: "আউটপুট", bg: "bg-yellow-soft" },
};

function extract(children: React.ReactNode): { code: string; lang: string } {
  if (isValidElement<{ children?: unknown; className?: string }>(children)) {
    const raw = children.props.children;
    const code = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.join("") : "";
    const lang = (children.props.className ?? "").replace("language-", "") || "text";
    return { code: code.replace(/\n$/, ""), lang };
  }
  return { code: typeof children === "string" ? children : "", lang: "text" };
}

export function CodeBlock({ children }: { children?: React.ReactNode }) {
  const { code, lang } = extract(children);
  const meta = LANG[lang] ?? { label: lang.toUpperCase(), bg: "bg-card" };
  const isOutput = lang === "text";

  return (
    <div className={`brut-sm overflow-hidden ${isOutput ? "border-dashed bg-paper" : "bg-card"}`}>
      <div className={`flex items-center justify-between border-b-[2.5px] border-ink px-3 py-1.5 ${meta.bg}`}>
        <span className="font-h3 text-sm">{meta.label}</span>
        {!isOutput && <CopyButton text={code} />}
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-code text-[0.92rem] leading-relaxed md:text-[0.98rem] xl:text-[1.05rem]">
        <code>
          {lang === "sql"
            ? tokenizeSQL(code).map((t, i) =>
                t.type === "plain" ? t.value : <span key={i} className={`tok-${t.type}`}>{t.value}</span>
              )
            : code}
        </code>
      </pre>
    </div>
  );
}
