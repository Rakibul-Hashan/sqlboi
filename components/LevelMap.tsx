"use client";

import Link from "next/link";
import { useState } from "react";
import { Award, Check, Lock, Pencil, RotateCcw, Star } from "lucide-react";
import { motion } from "motion/react";
import { kindLabel, levels, toBn, totalXP, zoneBg, zones, type Level } from "@/lib/levels";
import { computeXP, earnedBadges, useProgress } from "@/lib/progress";
import { useStatus } from "./StatusDot";
import { useEnglish } from "./ReadingLanguage";
import { englishLevelLabel, englishLevels, englishZones } from "@/lib/english-levels";

function TodoItem({ level, index }: { level: Level; index: number }) {
  const status = useStatus(level.slug);
  const english = useEnglish();
  const special = level.kind !== "level";
  return (
    <li>
      <Link
        href={`/level/${level.slug}`}
        className="group flex items-center gap-2 border-b-2 border-dashed border-grid py-3 pr-1 transition-colors hover:bg-yellow-soft sm:gap-3 sm:pr-2"
      >
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-lg border-[2.5px] border-ink ${
            status === "done" ? "bg-green" : status === "open" ? "bg-yellow" : "bg-[#eeeeee]"
          }`}
          aria-label={english ? { done: "Complete", open: "Open", locked: "Locked" }[status] : status === "done" ? "শেষ" : status === "open" ? "খোলা" : "লক"}
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
        <span className={`w-9 shrink-0 sm:w-12 ${special ? "font-h3 text-xs leading-tight" : "font-h3 text-base sm:text-xl"}`}>{english ? englishLevelLabel(level) : level.label}</span>
        <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          <span
            className={`block font-h3 text-lg leading-snug ${
              status === "done" ? "line-through decoration-pink decoration-[3px]" : status === "locked" ? "text-muted" : ""
            }`}
          >
            {english ? englishLevels[level.slug].title : level.title}
          </span>
          <span className="block text-sm leading-relaxed text-muted">{english ? englishLevels[level.slug].topics : level.topics}</span>
        </span>
        <span className="hidden shrink-0 font-h3 text-sm sm:block">
          {special && !english ? kindLabel(level.kind) + " · " : ""}
          {english ? level.xp : toBn(level.xp)} XP
        </span>
      </Link>
    </li>
  );
}

export function LevelMap() {
  const english = useEnglish();
  return (
    <div lang={english ? "en" : "bn"} className="grid gap-10 lg:grid-cols-2">
      {zones.map((z, zi) => (
        <motion.section
          key={z.id}
          aria-labelledby={`${z.id}-h`}
          initial={{ y: 28 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="brut relative min-w-0 bg-card pb-3 pl-5 pr-3 pt-6 sm:pl-16 sm:pr-4"
        >
          <span aria-hidden className="absolute bottom-0 left-2 top-0 w-0.5 bg-pink sm:left-12" />
          <span aria-hidden className="tape -top-3.5 right-8 rotate-3" />
          <span className={`brut-sm inline-block -rotate-2 px-3 py-0.5 font-h3 text-sm ${zoneBg[z.id]}`}>{english ? englishZones[z.id].label : `জোন ${z.number}`}</span>
          <h3 id={`${z.id}-h`} className="mt-2 font-h2 text-3xl">
            {english ? englishZones[z.id].name : z.name}
          </h3>
          <p className="text-base text-muted">{english ? englishZones[z.id].topics : z.tagline}</p>
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
  const english = useEnglish();
  const { progress, reset } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const xp = computeXP(progress);
  const done = levels.filter((l) => progress.completed[l.slug]).length;
  const next = levels.find((l) => !progress.completed[l.slug]);
  const pct = Math.min(100, Math.round((done / levels.length) * 100));

  return (
    <section className="brut bg-card p-5 sm:p-7" aria-label={english ? "Your progress" : "তোমার অগ্রগতি"}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-h3 text-base text-muted">{english ? "Your progress" : "তোমার অগ্রগতি"}</p>
          <p className="flex items-center gap-2 font-deco text-4xl">
            <Star className="size-8 fill-yellow" strokeWidth={2.2} aria-hidden />
            {english ? xp : toBn(xp)} XP
          </p>
          <p className="text-base text-muted">
            {english ? `${done}/${levels.length} chapters completed · Up to ${totalXP} XP from chapters, plus XP from quests and bosses` :
              `${toBn(done)}/${toBn(levels.length)} লেভেল শেষ · লেভেল থেকে সর্বোচ্চ ${toBn(totalXP)} XP, কোয়েস্ট আর বস থেকে আরও`}
          </p>
        </div>
        {next && (
          <Link href={`/level/${next.slug}`} className="brut press bg-yellow px-5 py-3 font-h3 text-lg">
            {english ? (done === 0 ? "Start reading →" : `Continue: ${englishLevels[next.slug].title} →`) : (done === 0 ? "শুরু করো →" : `চালিয়ে যাও: ${next.title} →`)}
          </Link>
        )}
      </div>
      <div
        className="mt-5 h-6 overflow-hidden rounded-full border-[2.5px] border-ink bg-paper"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={english ? "Progress completed" : "সম্পূর্ণ হয়েছে"}
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
              {english ? "This will erase your progress." : "সব অগ্রগতি মুছে যাবে।"}{" "}
              <button type="button" className="font-h3 text-err underline decoration-2" onClick={() => { reset(); setConfirming(false); }}>
                {english ? "Reset progress" : "হ্যাঁ, মুছে দাও"}
              </button>{" "}
              <button type="button" className="font-h3 underline decoration-2" onClick={() => setConfirming(false)}>
                {english ? "Cancel" : "না"}
              </button>
            </span>
          ) : (
            <button type="button" className="inline-flex items-center gap-1.5 text-muted underline decoration-2" onClick={() => setConfirming(true)}>
              <RotateCcw className="size-4" aria-hidden />
              {english ? "Reset progress" : "অগ্রগতি রিসেট করো"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

const stickerTilt = [-6, 4, -3, 5];
const englishBadges = ["SQL Basics", "Query Builder", "Database Designer", "Advanced SQL", "Assignment Solver", "Database Master"];

export function BadgeStickers() {
  const english = useEnglish();
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
            className={`flex aspect-square min-h-28 min-w-0 flex-col items-center justify-center gap-1 rounded-full border-[3px] border-ink p-2 text-center [overflow-wrap:anywhere] sm:gap-2 sm:p-3 ${
              has ? `${zoneBg[z.id]} shadow-brut` : "border-dashed bg-card opacity-60"
            }`}
            title={english ? (has ? "Earned" : `Complete ${englishZones[z.id].label} to earn this badge`) : (has ? "পেয়েছ" : `জোন ${z.number} শেষ করলে পাবে`)}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-card sm:size-12">
              {has ? <Award className="size-6" strokeWidth={2.4} aria-hidden /> : <Lock className="size-5" strokeWidth={2.4} aria-hidden />}
            </span>
            <span className="font-h3 text-sm leading-tight sm:text-base">{english ? englishBadges[i] : z.badge.name}</span>
            {has && (
              <span className="flex items-center gap-1 text-xs">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
                {english ? "Earned" : "পেয়েছ"}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
