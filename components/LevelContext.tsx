"use client";

import { createContext, useContext } from "react";

export interface LevelCtx {
  slug: string;
  xp: number;
  next?: { slug: string; title: string };
}

const Ctx = createContext<LevelCtx | null>(null);

export function LevelProvider({ value, children }: { value: LevelCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLevel(): LevelCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLevel must be used inside <LevelProvider>");
  return v;
}
