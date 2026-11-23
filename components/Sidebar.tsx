"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Lock } from "lucide-react";
import { levels, zones, zoneBg } from "@/lib/levels";
import { useStatus } from "./StatusDot";

function Item({
  slug,
  label,
  title,
  current,
  onNavigate,
}: {
  slug: string;
  label: string;
  title: string;
  current: boolean;
  onNavigate?: () => void;
}) {
  const status = useStatus(slug);
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // বর্তমান লেভেলটা তালিকার মাঝখানে আনো (পুরো পেজ স্ক্রল না করে)
    const el = ref.current;
    const box = el?.closest<HTMLElement>("[data-scroll-box]");
    if (current && el && box) box.scrollTop = el.offsetTop - box.clientHeight / 2;
  }, [current]);

  return (
    <li>
      <Link
        ref={ref}
        href={`/level/${slug}`}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
        className={`flex items-center gap-2.5 rounded-lg border-2 px-2 py-1.5 text-[0.95rem] leading-snug transition-colors ${
          current ? "border-ink bg-yellow shadow-[3px_3px_0_var(--color-ink)]" : "border-transparent hover:border-ink hover:bg-card"
        }`}
      >
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink ${
            status === "done" ? "bg-green" : status === "open" ? "bg-card" : "bg-[#eeeeee]"
          }`}
          aria-label={status === "done" ? "শেষ" : status === "open" ? "খোলা" : "লক"}
        >
          {status === "done" && <Check className="size-4" strokeWidth={3.2} aria-hidden />}
          {status === "locked" && <Lock className="size-3 text-muted" strokeWidth={2.6} aria-hidden />}
        </span>
        <span className={`w-10 shrink-0 ${/^[০-৯]+$/.test(label) ? "font-h3 text-base" : "font-h3 text-[0.7rem] leading-tight"}`}>{label}</span>
        <span className={`flex-1 ${status === "locked" && !current ? "text-muted" : ""}`}>{title}</span>
      </Link>
    </li>
  );
}

export function LevelList({ current, onNavigate }: { current?: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="সব লেভেল" className="space-y-6">
      {zones.map((z, zi) => (
        <div key={z.id}>
          <p
            className={`brut-sm inline-block px-3 py-0.5 font-h3 text-sm ${zoneBg[z.id]}`}
            style={{ transform: `rotate(${zi % 2 ? 1.5 : -1.5}deg)` }}
          >
            জোন {z.number}: {z.name}
          </p>
          <ul className="mt-3 space-y-1">
            {levels
              .filter((l) => l.zone === z.id)
              .map((l) => (
                <Item
                  key={l.slug}
                  slug={l.slug}
                  label={l.label}
                  title={l.title}
                  current={l.slug === current}
                  onNavigate={onNavigate}
                />
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
