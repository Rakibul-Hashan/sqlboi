"use client";

import { Tabs } from "radix-ui";
import { useEnglish } from "./ReadingLanguage";

export interface TierTab {
  id: string;
  label: string;
  hint: string;
  englishLabel: string;
  englishHint: string;
  color: string;
  content: React.ReactNode;
}

export function RevisionTabs({ tabs }: { tabs: TierTab[] }) {
  const english = useEnglish();
  return (
    <Tabs.Root defaultValue={tabs[0].id}>
      <Tabs.List aria-label={english ? "Difficulty levels" : "কঠিনতার ধাপ"} className="flex flex-wrap gap-3">
        {tabs.map((t, i) => (
          <Tabs.Trigger
            key={t.id}
            value={t.id}
            className={`brut-sm press press-sm flex min-h-11 flex-col items-start bg-card px-4 py-2 text-left data-[state=active]:-rotate-1 data-[state=active]:shadow-brut ${t.color}`}
          >
            <span className="font-h3 text-lg">
              <span className="font-code">{english ? i + 1 : "১২৩৪"[i]}.</span> {english ? t.englishLabel : t.label}
            </span>
            <span className="text-xs">{english ? t.englishHint : t.hint}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Content key={t.id} value={t.id} className="mt-8 outline-none">
          {t.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
