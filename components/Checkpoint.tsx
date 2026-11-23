"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, Flag, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { toBn } from "@/lib/levels";
import { useProgress } from "@/lib/progress";
import { useLevel } from "./LevelContext";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why?: string;
}

const PASS_RATIO = 0.7;
const CONFETTI_COLORS = ["#FFD23F", "#FF6FB5", "#4D96FF", "#3DDC97", "#FF8A3D", "#B28DFF"];

async function celebrate() {
  // canvas-confetti শুধু দরকার হলেই লোড হয়; Reduce motion চালু থাকলে নিজেই বন্ধ থাকে
  const confetti = (await import("canvas-confetti")).default;
  const base = { colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 60 };
  confetti({ ...base, particleCount: 90, spread: 75, origin: { x: 0.5, y: 0.55 } });
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 180);
  setTimeout(() => confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 300);
}

export function Checkpoint({ questions }: { questions: QuizQuestion[] }) {
  const { slug, xp, next } = useLevel();
  const { progress, completeLevel } = useProgress();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const baseId = useId();

  const need = Math.ceil(questions.length * PASS_RATIO);
  const score = picked.reduce<number>((s, p, i) => s + (p === questions[i].answer ? 1 : 0), 0);
  const passed = submitted && score >= need;
  const allAnswered = picked.every((p) => p !== null);
  const prev = progress.completed[slug];

  function submit() {
    setSubmitted(true);
    setDialogOpen(true);
    if (score >= need) {
      completeLevel(slug, score, questions.length);
      void celebrate();
    }
  }

  function retry() {
    setPicked(questions.map(() => null));
    setSubmitted(false);
    setDialogOpen(false);
    document.getElementById(`${baseId}-h`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="brut mt-16 bg-card p-5 shadow-brut-lg sm:p-8" aria-labelledby={`${baseId}-h`}>
      <span className="brut-sm inline-flex -rotate-2 items-center gap-1.5 bg-green px-3 py-1 font-h3 text-sm">
        <Flag className="size-4" strokeWidth={2.4} aria-hidden />
        চেকপয়েন্ট
      </span>
      <h2 id={`${baseId}-h`} className="mt-3 font-h2 text-2xl sm:text-3xl">
        ছোট কুইজ: {toBn(need)}/{toBn(questions.length)} ঠিক হলে লেভেল পার
      </h2>
      {prev && !submitted && (
        <p className="mt-2 text-base text-ok">
          ✔ আগেই পাশ করেছ ({toBn(prev.score)}/{toBn(prev.total)})। চাইলে আবার খেলো।
        </p>
      )}

      <ol className="mt-7 space-y-8" style={{ listStyle: "none" }}>
        {questions.map((item, qi) => {
          const chosen = picked[qi];
          const isRight = chosen === item.answer;
          return (
            <li key={qi}>
              <fieldset disabled={submitted}>
                <legend className="font-h3 text-lg">
                  <span>{toBn(qi + 1)}.</span> {item.q}
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {item.options.map((opt, oi) => {
                    const state = !submitted
                      ? chosen === oi
                        ? "bg-blue-soft shadow-[4px_4px_0_var(--color-ink)] -translate-x-0.5 -translate-y-0.5"
                        : "bg-card"
                      : oi === item.answer
                        ? "bg-green"
                        : chosen === oi
                          ? "bg-err-soft line-through decoration-err decoration-2"
                          : "bg-card opacity-55";
                    return (
                      <label
                        key={oi}
                        className={`brut-sm flex cursor-pointer items-start gap-3 px-4 py-3 text-base transition-transform has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${state}`}
                      >
                        <input
                          type="radio"
                          name={`${baseId}-q${qi}`}
                          className="mt-1.5 size-4 accent-ink"
                          checked={chosen === oi}
                          onChange={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-2 text-base">
                    <span className={`font-h3 ${isRight ? "text-ok" : "text-err"}`}>{isRight ? "ঠিক! " : "উঁহু। "}</span>
                    {item.why}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered}
            className="brut press bg-green px-7 py-3 font-h3 text-lg disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:transform-none disabled:hover:shadow-brut"
          >
            উত্তর জমা দাও
          </button>
        ) : (
          <>
            <span className="font-h3 text-lg">
              ফল: <span>{toBn(score)}/{toBn(questions.length)}</span>
            </span>
            <button type="button" onClick={retry} className="brut-sm press press-sm inline-flex items-center gap-2 bg-card px-4 py-2 font-h3">
              <RotateCcw className="size-4" strokeWidth={2.4} aria-hidden />
              আবার খেলো
            </button>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <motion.div
            initial={{ scale: 2.2, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: -10, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.1 }}
            className={`mx-auto mt-2 inline-block rounded-xl border-[5px] px-7 py-2 font-h1 text-4xl ${
              passed ? "border-ok text-ok" : "border-err text-err"
            }`}
            aria-hidden
          >
            {passed ? "পাস!" : "আবার"}
          </motion.div>
          <DialogTitle className="mt-6 font-h1 text-3xl">
            {passed ? "লেভেল পার!" : "প্রায় হয়ে গেছিল!"}
          </DialogTitle>
          <DialogDescription className="mt-2 font-body text-lg">
            {passed
              ? `${toBn(score)}/${toBn(questions.length)} ঠিক · +${toBn(xp)} XP পেলে।`
              : `${toBn(score)}/${toBn(questions.length)} ঠিক। আর ${toBn(need - score)}টা লাগবে। লাল-সবুজ ব্যাখ্যাগুলো পড়ে আবার চেষ্টা করো।`}
          </DialogDescription>
          <div className="mt-6 grid gap-3">
            {passed ? (
              next ? (
                <Link href={`/level/${next.slug}`} className="brut press inline-flex items-center justify-center gap-2 bg-yellow px-5 py-3 font-h3 text-lg">
                  পরের লেভেল: {next.title}
                  <ArrowRight className="size-5" strokeWidth={2.6} aria-hidden />
                </Link>
              ) : (
                <Link href="/" className="brut press inline-flex items-center justify-center gap-2 bg-yellow px-5 py-3 font-h3 text-lg">
                  ম্যাপে ফিরে যাও
                </Link>
              )
            ) : (
              <button type="button" onClick={retry} className="brut press inline-flex items-center justify-center gap-2 bg-yellow px-5 py-3 font-h3 text-lg">
                <RotateCcw className="size-5" strokeWidth={2.6} aria-hidden />
                আবার চেষ্টা করো
              </button>
            )}
            <DialogClose className="font-h3 text-base underline decoration-2 underline-offset-4">
              {passed ? "এখানেই থাকি" : "আগে ব্যাখ্যাগুলো দেখি"}
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
