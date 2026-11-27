"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ReadingText, useEnglish } from "./ReadingLanguage";

const pairs = [
  { term: "Server", meaning: "ডেস্ক", en: "Desk", bg: "bg-yellow" },
  { term: "Database", meaning: "খাতা", en: "Notebook", bg: "bg-blue" },
  { term: "Table", meaning: "ছক", en: "Grid", bg: "bg-green" },
  { term: "Row", meaning: "লাইন", en: "Line", bg: "bg-pink" },
  { term: "Column", meaning: "ঘর", en: "Field", bg: "bg-orange" },
];
const tilts = [-3, 2, -1, 3, -2];

/** উপমা কার্ড: ক্লিক করলে উল্টে যায় (Motion-এর 3D flip) */
export function FlipCards() {
  const english = useEnglish();
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5" style={{ perspective: 1000 }}>
      {pairs.map((p, i) => {
        const on = Boolean(flipped[i]);
        return (
          <motion.button
            key={p.term}
            type="button"
            aria-pressed={on}
            aria-label={english ? (on ? `${p.term}: ${p.en}` : `Flip the ${p.term} card`) : (on ? `${p.term} মানে ${p.meaning}` : `${p.term} মানে কী? উল্টে দেখো`)}
            onClick={() => setFlipped((f) => ({ ...f, [i]: !on }))}
            initial={false}
            animate={{ rotateY: on ? 180 : 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{ rotate: tilts[i], transformStyle: "preserve-3d" }}
            className="relative h-36 cursor-pointer"
          >
            <span
              className="brut absolute inset-0 grid place-items-center bg-card px-1 font-code text-sm font-bold [overflow-wrap:anywhere] sm:text-xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              {p.term}
            </span>
            <span
              className={`brut absolute inset-0 grid place-items-center px-1 font-story text-xl [overflow-wrap:anywhere] sm:text-3xl ${p.bg}`}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {english ? p.en : p.meaning}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** খাতার লেখা মুছে SQL লেখা হয়ে যায় */
export function NotebookToSQL() {
  return (
    <div className="relative">
      <span aria-hidden className="tape -top-3.5 left-[38%] z-10 rotate-3" />
      <div className="brut bg-card p-4 shadow-brut-lg sm:rotate-[1.5deg] sm:p-7">
        <p className="font-h3 text-sm text-muted"><ReadingText bn="রফিক স্যারের খাতা" en="Mr. Rafiq’s notebook" /></p>
        <div className="mt-3 grid min-h-36 grid-cols-[minmax(0,1fr)]">
          <motion.p
            className="col-start-1 row-start-1 font-story text-base leading-relaxed sm:text-xl"
            animate={{ clipPath: ["inset(0 0% 0 0)", "inset(0 0% 0 0)", "inset(0 100% 0 0)", "inset(0 100% 0 0)"] }}
            transition={{ duration: 6, times: [0, 0.3, 0.55, 1], repeat: Infinity, repeatType: "reverse" }}
          >
            <ReadingText bn={<>১. রাফি, রোল ১, ঢাকা<br />২. নুসরাত, রোল ২, চট্টগ্রাম<br />৩. তানভীর, রোল ৩... (খুঁজছি)</>}
              en={<>1. Rafi, roll 1, Dhaka<br />2. Nusrat, roll 2, Chattogram<br />3. Tanvir, roll 3… (still looking)</>} />
          </motion.p>
          <motion.pre
            className="col-start-1 row-start-1 whitespace-pre-wrap font-code text-sm leading-relaxed [overflow-wrap:anywhere] sm:text-base"
            animate={{ clipPath: ["inset(0 100% 0 0)", "inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 0)"] }}
            transition={{ duration: 6, times: [0, 0.45, 0.75, 1], repeat: Infinity, repeatType: "reverse" }}
          >
            <span className="bg-yellow px-1">SELECT</span> name, roll{"\n"}
            <span className="bg-yellow px-1">FROM</span> students{"\n"}
            <span className="bg-yellow px-1">WHERE</span> city = &apos;<ReadingText bn="ঢাকা" en="Dhaka" />&apos;;
          </motion.pre>
        </div>
      </div>
      <motion.span
        className="brut-sm absolute -bottom-7 right-0 rounded-full bg-green px-4 py-2 font-h3 sm:-right-2"
        animate={{ rotate: [8, -6, 8] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ReadingText bn="এক লাইনে!" en="One query!" />
      </motion.span>
    </div>
  );
}
