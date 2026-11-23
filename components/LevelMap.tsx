"use client";

import Link from "next/link";
import { useState } from "react";
import { Award, Check, Lock, Pencil, RotateCcw, Star } from "lucide-react";
import { motion } from "motion/react";
import { kindLabel, levels, toBn, totalXP, zoneBg, zones, type Level } from "@/lib/levels";
import { computeXP, earnedBadges, useProgress } from "@/lib/progress";
import { useStatus } from "./StatusDot";

function TodoItem({ level, index }: { level: Level; index: number }) {
  const status = useStatus(level.slug);
  const special = level.kind !== "level";
  return (
    <li>
      <Link
        href={`/level/${level.slug}`}
        className="group flex items-center gap-3 border-b-2 border-dashed border-grid py-3 pr-2 transition-colors hover:bg-yellow-soft"
      >
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-lg border-[2.5px] border-ink ${
            status === "done" ? "bg-green" : status === "open" ? "bg-yellow" : "bg-[#eeeeee]"
          }`}
          aria-label={status === "done" ? "শেষ" : status === "open" ? "খোলা" : "লক"}
        >
          {status === "done" && (
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
              <motion.path
                d="M20 6 9 17l-5-5"
                fill="none"
                stroke="#111"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              />
            </svg>
          )}
          {status === "locked" && <Lock className="size-4 text-muted" strokeWidth={2.6} aria-hidden />}
          {status === "open" && <Pencil className="size-4" strokeWidth={2.6} aria-hidden />}
        </span>
        <span className={`w-12 shrink-0 ${special ? "font-h3 text-xs leading-tight" : "font-h3 text-xl"}`}>{level.label}</span>
        <span className="min-w-0 flex-1">
          <span
            className={`block font-h3 text-lg leading-snug ${
              status === "done" ? "line-through decoration-pink decoration-[3px]" : status === "locked" ? "text-muted" : ""
            }`}
          >
            {level.title}
          </span>
          <span className="block text-sm leading-relaxed text-muted">{level.topics}</span>
        </span>
        <span className="hidden shrink-0 font-h3 text-sm sm:block">
          {special ? kindLabel(level.kind) + " · " : ""}
          {toBn(level.xp)} XP
        </span>
      </Link>
    </li>
  );
}

export function LevelMap() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {zones.map((z, zi) => (
        <motion.section
          key={z.id}
          aria-labelledby={`${z.id}-h`}
          initial={{ y: 28, rotate: 0 }}
          whileInView={{ y: 0, rotate: zi % 2 ? 0.6 : -0.6 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="brut relative bg-card pb-3 pl-14 pr-4 pt-6 sm:pl-16"
        >
          <span aria-hidden className="absolute bottom-0 left-10 top-0 w-0.5 bg-pink sm:left-12" />
          <span aria-hidden className="tape -top-3.5 right-8 rotate-3" />
          <span className={`brut-sm inline-block -rotate-2 px-3 py-0.5 font-h3 text-sm ${zoneBg[z.id]}`}>জোন {z.number}</span>
          <h3 id={`${z.id}-h`} className="mt-2 font-h2 text-3xl">
            {z.name}
          </h3>
          <p className="text-base text-muted">{z.tagline}</p>
          <ul className="mt-3">
            {levels
              .filter((l) => l.zone === z.id)
              .map((l, i) => (
                <TodoItem key={l.slug} level={l} index={i} />
              ))}
          </ul>
        </motion.section>
      ))}
    </div>
  );
}

export function ProgressPanel() {
  const { progress, reset } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const xp = computeXP(progress);
  const done = levels.filter((l) => progress.completed[l.slug]).length;
  const next = levels.find((l) => !progress.completed[l.slug]);
  const pct = Math.min(100, Math.round((done / levels.length) * 100));

  return (
    <section className="brut bg-card p-5 sm:p-7" aria-label="তোমার অগ্রগতি">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-h3 text-base text-muted">তোমার অগ্রগতি</p>
          <p className="flex items-center gap-2 font-deco text-4xl">
            <Star className="size-8 fill-yellow" strokeWidth={2.2} aria-hidden />
            {toBn(xp)} XP
          </p>
          <p className="text-base text-muted">
            {toBn(done)}/{toBn(levels.length)} লেভেল শেষ · লেভেল থেকে সর্বোচ্চ {toBn(totalXP)} XP, কোয়েস্ট আর বস থেকে আরও
          </p>
        </div>
        {next && (
          <Link href={`/level/${next.slug}`} className="brut press bg-yellow px-5 py-3 font-h3 text-lg">
            {done === 0 ? "শুরু করো →" : `চালিয়ে যাও: ${next.title} →`}
          </Link>
        )}
      </div>
      <div
        className="mt-5 h-6 overflow-hidden rounded-full border-[2.5px] border-ink bg-paper"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="সম্পূর্ণ হয়েছে"
      >
        <motion.div
          className="h-full border-r-[2.5px] border-ink bg-green"
          style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent 0 8px, rgb(17 17 17 / .12) 8px 12px)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
      {xp > 0 && (
        <div className="mt-4 text-right text-base">
          {confirming ? (
            <span>
              সব অগ্রগতি মুছে যাবে।{" "}
              <button type="button" className="font-h3 text-err underline decoration-2" onClick={() => { reset(); setConfirming(false); }}>
                হ্যাঁ, মুছে দাও
              </button>{" "}
              <button type="button" className="font-h3 underline decoration-2" onClick={() => setConfirming(false)}>
                না
              </button>
            </span>
          ) : (
            <button type="button" className="inline-flex items-center gap-1.5 text-muted underline decoration-2" onClick={() => setConfirming(true)}>
              <RotateCcw className="size-4" aria-hidden />
              অগ্রগতি রিসেট করো
            </button>
          )}
        </div>
      )}
    </section>
  );
}

const stickerTilt = [-6, 4, -3, 5];

export function BadgeStickers() {
  const { progress } = useProgress();
  const earned = earnedBadges(progress);
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {zones.map((z, i) => {
        const has = earned.some((b) => b.id === z.badge.id);
        return (
          <motion.div
            key={z.id}
            initial={{ scale: 0.85 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: i * 0.08 }}
            whileHover={has ? { rotate: 0, scale: 1.06 } : undefined}
            style={{ rotate: stickerTilt[i] }}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-full border-[3px] border-ink p-3 text-center ${
              has ? `${zoneBg[z.id]} shadow-brut` : "border-dashed bg-card opacity-60"
            }`}
            title={has ? "পেয়েছ" : `জোন ${z.number} শেষ করলে পাবে`}
          >
            <span className="grid size-12 place-items-center rounded-full border-[3px] border-ink bg-card">
              {has ? <Award className="size-6" strokeWidth={2.4} aria-hidden /> : <Lock className="size-5" strokeWidth={2.4} aria-hidden />}
            </span>
            <span className="font-h3 text-sm leading-tight sm:text-base">{z.badge.name}</span>
            {has && (
              <span className="flex items-center gap-1 text-xs">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
                পেয়েছ
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
