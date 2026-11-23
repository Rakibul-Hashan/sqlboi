"use client";

import { useState } from "react";
import { motion } from "motion/react";

const pairs = [
  { term: "Server", meaning: "ডেস্ক", bg: "bg-yellow" },
  { term: "Database", meaning: "খাতা", bg: "bg-blue" },
  { term: "Table", meaning: "ছক", bg: "bg-green" },
  { term: "Row", meaning: "লাইন", bg: "bg-pink" },
  { term: "Column", meaning: "ঘর", bg: "bg-orange" },
];
const tilts = [-3, 2, -1, 3, -2];

/** উপমা কার্ড: ক্লিক করলে উল্টে যায় (Motion-এর 3D flip) */
export function FlipCards() {
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
            aria-label={on ? `${p.term} মানে ${p.meaning}` : `${p.term} মানে কী? উল্টে দেখো`}
            onClick={() => setFlipped((f) => ({ ...f, [i]: !on }))}
            initial={false}
            animate={{ rotateY: on ? 180 : 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{ rotate: tilts[i], transformStyle: "preserve-3d" }}
            className="relative h-36 cursor-pointer"
          >
            <span
              className="brut absolute inset-0 grid place-items-center bg-card font-code text-xl font-bold"
              style={{ backfaceVisibility: "hidden" }}
            >
              {p.term}
            </span>
            <span
              className={`brut absolute inset-0 grid place-items-center font-story text-3xl ${p.bg}`}
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {p.meaning}
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
      <div className="brut rotate-[1.5deg] bg-card p-6 shadow-brut-lg sm:p-7">
        <p className="font-h3 text-sm text-muted">রফিক স্যারের খাতা</p>
        <div className="relative mt-3 min-h-40">
          <motion.p
            className="absolute inset-0 font-story text-xl leading-loose"
            animate={{ clipPath: ["inset(0 0% 0 0)", "inset(0 0% 0 0)", "inset(0 100% 0 0)", "inset(0 100% 0 0)"] }}
            transition={{ duration: 6, times: [0, 0.3, 0.55, 1], repeat: Infinity, repeatType: "reverse" }}
          >
            ১. রাফি, রোল ১, ঢাকা
            <br />
            ২. নুসরাত, রোল ২, চট্টগ্রাম
            <br />
            ৩. তানভীর, রোল ৩... (খুঁজছি)
          </motion.p>
          <motion.pre
            className="absolute inset-0 whitespace-pre-wrap font-code text-base leading-loose"
            animate={{ clipPath: ["inset(0 100% 0 0)", "inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 0)"] }}
            transition={{ duration: 6, times: [0, 0.45, 0.75, 1], repeat: Infinity, repeatType: "reverse" }}
          >
            <span className="bg-yellow px-1">SELECT</span> name, roll{"\n"}
            <span className="bg-yellow px-1">FROM</span> students{"\n"}
            <span className="bg-yellow px-1">WHERE</span> city = &apos;ঢাকা&apos;;
          </motion.pre>
        </div>
      </div>
      <motion.span
        className="brut-sm absolute -bottom-7 -right-2 rounded-full bg-green px-4 py-2 font-h3"
        animate={{ rotate: [8, -6, 8] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        এক লাইনে!
      </motion.span>
    </div>
  );
}
