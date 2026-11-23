"use client";

import { patterns } from "@/lib/templates";
import { PICK_EVENT } from "./Workbench";

/**
 * সংকেত-শব্দ → টেমপ্লেটের টেবিল। একই পাতায় ?p= বদলালে Next.js পাতা নতুন করে আঁকে না,
 * আর নিজে থেকে ওপরে স্ক্রল করে; তাই ক্লিকে সরাসরি Workbench-কে জানাই।
 * href রাখা আছে, যাতে নতুন ট্যাবে খোলা বা JS ছাড়াও লিংক কাজ করে।
 */
export function TriggerTable() {
  return (
    <div className="mt-6 overflow-x-auto rounded-[14px] border-[3px] border-ink bg-card shadow-[var(--shadow-brut-sm)]">
      <table className="w-full border-collapse text-[1.02rem] leading-relaxed">
        <thead className="bg-yellow-soft">
          <tr>
            <th className="border-b-[2.5px] border-ink px-4 py-2 text-left font-h3">প্রশ্নে এই শব্দ</th>
            <th className="border-b-[2.5px] border-ink px-4 py-2 text-left font-h3">টেমপ্লেট</th>
            <th className="border-b-[2.5px] border-ink px-4 py-2 text-left font-h3">প্রতি Row-তে</th>
          </tr>
        </thead>
        <tbody>
          {patterns.map((p) => (
            <tr key={p.id} className="border-b-2 border-grid last:border-0">
              <td className="px-4 py-2 font-code text-[0.92rem]">{p.triggers.join(" · ")}</td>
              <td className="px-4 py-2">
                <a
                  href={`/templates?p=${p.id}#templates`}
                  onClick={(e) => {
                    // নতুন ট্যাব/উইন্ডোতে খোলার চেষ্টা হলে ব্রাউজারের নিজের কাজই চলুক
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: p.id }));
                  }}
                  className="font-h3 underline decoration-2 underline-offset-4 hover:bg-blue-soft"
                >
                  {p.title}
                </a>
              </td>
              <td className="px-4 py-2 text-[0.95rem]">{p.grain}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
