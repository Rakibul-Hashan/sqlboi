import Link from "next/link";
import { Bug, Flag, Hammer, Pencil, Swords, Target, type LucideIcon } from "lucide-react";
import { BadgeStickers, LevelMap, ProgressPanel } from "@/components/LevelMap";
import { FlipCards, NotebookToSQL } from "@/components/HomeExtras";
import { CurlyArrow, Underline } from "@/components/Doodles";

const structure: [LucideIcon, string, string, string][] = [
  [Target, "মিশন", "এই লেভেলে কী শিখব", "bg-yellow-soft"],
  [Hammer, "প্র্যাকটিস কোয়েস্ট", "হাতে-কলমে কাজ", "bg-orange-soft"],
  [Bug, "বাগ মনস্টার", "সাধারণ ভুল আর তার সমাধান", "bg-pink-soft"],
  [Swords, "বস চ্যালেঞ্জ", "আগের সব মিলিয়ে একটা সমস্যা", "bg-purple-soft"],
  [Flag, "চেকপয়েন্ট", "ছোট কুইজ; পাশ করলে XP আর পরের লেভেল আনলক", "bg-green-soft"],
];

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-h2 text-4xl sm:text-[2.6rem]">
      <span className="bg-[linear-gradient(transparent_60%,var(--color-yellow)_60%,var(--color-yellow)_92%,transparent_92%)] px-1 [box-decoration-break:clone]">
        {children}
      </span>
    </h2>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-[88rem] px-4">
      {/* হিরো */}
      <section className="flex flex-wrap items-center gap-12 py-14 sm:py-20">
        <div className="relative min-w-0 flex-[1_1_32rem]">
          <span className="brut-sm inline-block -rotate-3 bg-blue px-4 py-1 font-h3">৩১টা লেভেল · ৬টা জোন · ৩টা বস</span>
          <h1 className="mt-6 font-h1 text-5xl leading-[1.18] sm:text-7xl">
            খাতা ভুলে যাও,
            <br />
            <span className="relative inline-block">
              Database
              <Underline className="absolute -bottom-3 left-[-2%] h-6 w-[104%]" />
            </span>{" "}
            শেখো
          </h1>
          <p className="mt-8 max-w-xl font-body text-xl leading-relaxed sm:text-2xl">
            একজন সম্পূর্ণ নতুন পাঠক ৩১টা লেভেল পেরিয়ে ইউনি-লেভেলের MySQL শিখে ফেলবে, গেম খেলার মতো করে। কোনো আগের জ্ঞান লাগবে না।
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/level/level-0" className="brut press inline-flex items-center gap-2.5 bg-yellow px-6 py-3.5 font-h3 text-xl">
              <Pencil className="size-5" strokeWidth={2.4} aria-hidden />
              লেখা শুরু করো
            </Link>
            <a href="#map" className="brut press inline-flex items-center bg-card px-6 py-3.5 font-h3 text-xl">
              সূচি দেখো
            </a>
          </div>
          <CurlyArrow className="absolute -bottom-12 right-[8%] hidden w-28 md:block" />
        </div>
        <div className="min-w-0 flex-[1_1_24rem]">
          <NotebookToSQL />
        </div>
      </section>

      <ProgressPanel />

      {/* উপমা */}
      <section className="mt-20" aria-labelledby="analogy-h">
        <SectionTitle id="analogy-h">উপমা কার্ড</SectionTitle>
        <p className="mt-3 font-body text-lg text-muted">কার্ডে ক্লিক করে উল্টাও। পুরো বই জুড়ে এই উপমাগুলো ফিরে ফিরে আসবে।</p>
        <div className="mt-7">
          <FlipCards />
        </div>
      </section>

      {/* কাঠামো */}
      <section className="mt-20" aria-labelledby="how-h">
        <SectionTitle id="how-h">প্রতিটা লেভেলের কাঠামো</SectionTitle>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" style={{ listStyle: "none" }}>
          {structure.map(([Icon, name, desc, bg], i) => (
            <li key={name} className={`brut-sm p-4 ${bg}`} style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
              <span className="grid size-10 place-items-center rounded-lg border-[2.5px] border-ink bg-card">
                <Icon className="size-5" strokeWidth={2.4} aria-hidden />
              </span>
              <p className="mt-3 font-h3 text-lg">{name}</p>
              <p className="text-base leading-relaxed">{desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ম্যাপ */}
      <section id="map" className="mt-20 scroll-mt-24" aria-labelledby="map-h">
        <SectionTitle id="map-h">সূচি: চারটা খাতা</SectionTitle>
        <p className="mt-3 font-body text-lg text-muted">প্রতিটা লাইন একটা লেভেল। চেকপয়েন্ট পাশ করলে টিক পড়ে, আর পরেরটা খুলে যায়।</p>
        <div className="mt-8">
          <LevelMap />
        </div>
      </section>

      {/* ব্যাজ */}
      <section id="badges" className="mt-20 scroll-mt-24" aria-labelledby="badges-h">
        <SectionTitle id="badges-h">স্টিকার খাতা</SectionTitle>
        <p className="mt-3 font-body text-lg text-muted">প্রতিটা জোন শেষ করলে একটা স্টিকার।</p>
        <div className="mt-8 max-w-3xl">
          <BadgeStickers />
        </div>
      </section>
    </main>
  );
}
