"use client";

import { Hammer, Swords } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { BOSS_XP, QUEST_XP, useProgress } from "@/lib/progress";
import { toBn } from "@/lib/levels";
import { useLevel } from "./LevelContext";

interface TaskProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function DoneToggle({ taskKey, xp, label }: { taskKey: string; xp: number; label: string }) {
  const { progress, toggleTask } = useProgress();
  const done = Boolean(progress.tasks[taskKey]);

  function onClick() {
    toggleTask(taskKey);
    if (!done) toast(`+${toBn(xp)} XP`, { description: "দারুণ! খাতায় টিক পড়ল।" });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done}
      className={`brut-sm press press-sm mt-5 inline-flex items-center gap-3 py-2 pl-2 pr-4 font-h3 ${done ? "bg-green" : "bg-card"}`}
    >
      <span className="grid size-8 place-items-center rounded-md border-[2.5px] border-ink bg-card">
        {done && (
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
            <motion.path
              d="M20 6 9 17l-5-5"
              fill="none"
              stroke="#111"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </svg>
        )}
      </span>
      {done ? `শেষ! +${toBn(xp)} XP` : `${label} (+${toBn(xp)} XP)`}
    </button>
  );
}

export function Quest({ id, title, children }: TaskProps) {
  const { slug } = useLevel();
  return (
    <section className="brut bg-card p-5 sm:p-6" aria-label={`প্র্যাকটিস কোয়েস্ট: ${title}`}>
      <span className="brut-sm inline-flex -rotate-2 items-center gap-1.5 bg-orange-soft px-2.5 py-0.5 font-h3 text-sm">
        <Hammer className="size-4" strokeWidth={2.4} aria-hidden />
        কোয়েস্ট {toBn(id)}
      </span>
      <h4 className="mt-3 font-h3 text-xl">{title}</h4>
      <div className="box-body mt-3">{children}</div>
      <DoneToggle taskKey={`${slug}:quest-${id}`} xp={QUEST_XP} label="করে ফেলেছি" />
    </section>
  );
}

const TIERS = {
  easy: { label: "সহজ", sticker: "bg-green", card: "bg-card", boss: false },
  medium: { label: "মাঝারি", sticker: "bg-yellow", card: "bg-card", boss: false },
  hard: { label: "কঠিন", sticker: "bg-orange", card: "bg-orange-soft", boss: true },
  boss: { label: "বস", sticker: "bg-purple", card: "bg-purple-soft", boss: true },
} as const;

export type ChallengeTier = keyof typeof TIERS;

/** প্র্যাকটিস অ্যারেনার প্রশ্ন: কঠিন আর বস স্তরে বসের সমান XP */
export function Challenge({ id, tier, title, children }: TaskProps & { tier: ChallengeTier }) {
  const { slug } = useLevel();
  const t = TIERS[tier];
  const key = t.boss ? `${slug}:boss-${id}` : `${slug}:quest-${id}`;
  return (
    <section id={`q-${id}`} className={`brut scroll-mt-24 p-5 sm:p-6 ${t.card}`} aria-label={`প্রশ্ন ${id}: ${title}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`brut-sm inline-flex -rotate-2 items-center gap-1.5 px-2.5 py-0.5 font-h3 text-sm ${t.sticker}`}>
          {t.boss ? <Swords className="size-4" strokeWidth={2.4} aria-hidden /> : <Hammer className="size-4" strokeWidth={2.4} aria-hidden />}
          {t.label}
        </span>
        <span className="font-h3 text-sm text-ink/70">প্রশ্ন {toBn(id)}</span>
      </div>
      <h4 className="mt-3 font-h3 text-xl">{title}</h4>
      <div className="box-body mt-3 space-y-3">{children}</div>
      <DoneToggle taskKey={key} xp={t.boss ? BOSS_XP : QUEST_XP} label="সমাধান করেছি" />
    </section>
  );
}

export function Boss({ id = "1", title, children }: Partial<TaskProps> & { children: React.ReactNode }) {
  const { slug } = useLevel();
  return (
    <section className="brut relative bg-purple-soft p-5 shadow-brut-lg sm:p-7" aria-label="বস চ্যালেঞ্জ">
      <span className="brut-sm inline-flex rotate-2 items-center gap-1.5 bg-purple px-3 py-1 font-h3">
        <Swords className="size-5" strokeWidth={2.4} aria-hidden />
        বস চ্যালেঞ্জ
      </span>
      {title && <h4 className="mt-3 font-h2 text-2xl">{title}</h4>}
      <div className="box-body mt-3">{children}</div>
      <DoneToggle taskKey={`${slug}:boss-${id}`} xp={BOSS_XP} label="বসকে হারিয়েছি" />
    </section>
  );
}
