"use client";

import { useCallback, useSyncExternalStore } from "react";
import { levels, zones } from "./levels";

/**
 * পাঠকের অগ্রগতি শুধু তার ব্রাউজারের localStorage-এ থাকে।
 * কোনো সার্ভার, লগইন বা ট্র্যাকিং নেই।
 */

const STORAGE_KEY = "mysql-boi:progress:v1";

export interface LevelResult {
  score: number;
  total: number;
  at: number;
}

export interface Progress {
  /** checkpoint পাশ করা লেভেল */
  completed: Record<string, LevelResult>;
  /** শেষ করা কোয়েস্ট/বস চ্যালেঞ্জ — key: `${slug}:${id}` */
  tasks: Record<string, number>;
}

const EMPTY: Progress = { completed: {}, tasks: {} };

export const QUEST_XP = 10;
export const BOSS_XP = 30;

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function isProgress(v: unknown): v is Progress {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.completed === "object" && p.completed !== null &&
    typeof p.tasks === "object" && p.tasks !== null
  );
}

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cache = isProgress(parsed) ? parsed : EMPTY;
  } catch {
    // Private mode বা নষ্ট ডেটা — খালি দিয়ে শুরু
    cache = EMPTY;
  }
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // স্টোরেজ বন্ধ থাকলে অন্তত এই সেশনে মনে থাকবে
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY;

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const completeLevel = useCallback((slug: string, score: number, total: number) => {
    const cur = read();
    const prev = cur.completed[slug];
    if (prev && prev.score >= score) return;
    write({ ...cur, completed: { ...cur.completed, [slug]: { score, total, at: Date.now() } } });
  }, []);

  const toggleTask = useCallback((key: string) => {
    const cur = read();
    const tasks = { ...cur.tasks };
    if (tasks[key]) delete tasks[key];
    else tasks[key] = Date.now();
    write({ ...cur, tasks });
  }, []);

  const reset = useCallback(() => write(EMPTY), []);

  return { progress, completeLevel, toggleTask, reset };
}

export function computeXP(p: Progress): number {
  let xp = 0;
  for (const l of levels) if (p.completed[l.slug]) xp += l.xp;
  for (const key of Object.keys(p.tasks)) xp += key.includes(":boss") ? BOSS_XP : QUEST_XP;
  return xp;
}

export function isUnlocked(p: Progress, slug: string): boolean {
  const i = levels.findIndex((l) => l.slug === slug);
  if (i <= 0) return true;
  return Boolean(p.completed[levels[i - 1].slug]);
}

export function earnedBadges(p: Progress) {
  return zones
    .filter((z) => levels.filter((l) => l.zone === z.id).every((l) => p.completed[l.slug]))
    .map((z) => z.badge);
}
