import Link from "next/link";
import { Bug, Flag, Hammer, Pencil, Swords, Target, type LucideIcon } from "lucide-react";
import { BadgeStickers, LevelMap, ProgressPanel } from "@/components/LevelMap";
import { FlipCards, NotebookToSQL } from "@/components/HomeExtras";
import { CurlyArrow, Underline } from "@/components/Doodles";
import { ReadingText } from "@/components/ReadingLanguage";

const structure: [LucideIcon, string, string, string][] = [
  [Target, "মিশন", "এই লেভেলে কী শিখব", "bg-yellow-soft"],
  [Hammer, "প্র্যাকটিস কোয়েস্ট", "হাতে-কলমে কাজ", "bg-orange-soft"],
  [Bug, "বাগ মনস্টার", "সাধারণ ভুল আর তার সমাধান", "bg-pink-soft"],
  [Swords, "বস চ্যালেঞ্জ", "আগের সব মিলিয়ে একটা সমস্যা", "bg-purple-soft"],
  [Flag, "চেকপয়েন্ট", "ছোট কুইজ; পাশ করলে XP আর পরের লেভেল আনলক", "bg-green-soft"],
];
const englishStructure = [
  ["Learning goals", "What you’ll learn in this chapter"],
  ["Practice", "Try the query yourself"],
  ["Common mistakes", "Spot errors and fix them"],
  ["Boss challenge", "Combine what you’ve learned"],
  ["Checkpoint", "Pass the quiz to earn XP and unlock the next level"],
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
          <span className="brut-sm inline-block -rotate-3 bg-blue px-4 py-1 font-h3"><ReadingText bn="৩১টা লেভেল · ৬টা জোন · ৩টা বস" en="34 chapters · 6 zones · 3 boss challenges" /></span>
          <h1 className="mt-6 font-h1 text-4xl leading-[1.18] [overflow-wrap:anywhere] sm:text-6xl xl:text-7xl">
            <ReadingText
              bn={<>খাতা ভুলে যাও,<br /><span className="relative inline-block">
                Database <Underline className="absolute -bottom-3 left-[-2%] h-6 w-[104%]" />
              </span>{" "}শেখো</>}
              en={<>Learn MySQL<br /><span className="relative inline-block font-bold">
                by doing <Underline className="absolute -bottom-3 left-[-2%] h-6 w-[104%]" />
              </span></>}
            />
          </h1>
          <p className="mt-8 max-w-xl font-body text-xl leading-relaxed sm:text-2xl">
            <ReadingText
              bn="একজন সম্পূর্ণ নতুন পাঠক ৩১টা লেভেল পেরিয়ে ইউনি-লেভেলের MySQL শিখে ফেলবে, গেম খেলার মতো করে। কোনো আগের জ্ঞান লাগবে না।"
              en="Start with your first table, then build up to university-level MySQL with examples and practice. No prior database experience needed."
            />
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/level/level-0" className="brut press inline-flex items-center gap-2.5 bg-yellow px-6 py-3.5 font-h3 text-xl">
              <Pencil className="size-5" strokeWidth={2.4} aria-hidden />
              <ReadingText bn="লেখা শুরু করো" en="Start reading" />
            </Link>
            <a href="#map" className="brut press inline-flex items-center bg-card px-6 py-3.5 font-h3 text-xl">
              <ReadingText bn="সূচি দেখো" en="Browse chapters" />
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
        <SectionTitle id="analogy-h"><ReadingText bn="উপমা কার্ড" en="Database analogies" /></SectionTitle>
        <p className="mt-3 font-body text-lg text-muted"><ReadingText bn="কার্ডে ক্লিক করে উল্টাও। পুরো বই জুড়ে এই উপমাগুলো ফিরে ফিরে আসবে।" en="Flip each card to see what the term is like in a paper notebook." /></p>
        <div className="mt-7">
          <FlipCards />
        </div>
      </section>

      {/* কাঠামো */}
      <section className="mt-20" aria-labelledby="how-h">
        <SectionTitle id="how-h"><ReadingText bn="প্রতিটা লেভেলের কাঠামো" en="How the chapters work" /></SectionTitle>
        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" style={{ listStyle: "none" }}>
          {structure.map(([Icon, name, desc, bg], i) => (
            <li key={name} className={`brut-sm p-4 ${bg}`} style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
              <span className="grid size-10 place-items-center rounded-lg border-[2.5px] border-ink bg-card">
                <Icon className="size-5" strokeWidth={2.4} aria-hidden />
              </span>
              <p className="mt-3 font-h3 text-lg"><ReadingText bn={name} en={englishStructure[i][0]} /></p>
              <p className="text-base leading-relaxed"><ReadingText bn={desc} en={englishStructure[i][1]} /></p>
            </li>
          ))}
        </ol>
      </section>

      {/* ম্যাপ */}
      <section id="map" className="mt-20 scroll-mt-24" aria-labelledby="map-h">
        <SectionTitle id="map-h"><ReadingText bn="সূচি: চারটা খাতা" en="Chapter map" /></SectionTitle>
        <p className="mt-3 font-body text-lg text-muted">
          <ReadingText bn="প্রতিটা লাইন একটা লেভেল। চেকপয়েন্ট পাশ করলে টিক পড়ে, আর পরেরটা খুলে যায়।"
            en="Pick any chapter to read. Pass its checkpoint to record your progress and unlock the next level." />
        </p>
        <div className="mt-8">
          <LevelMap />
        </div>
      </section>

      {/* ব্যাজ */}
      <section id="badges" className="mt-20 scroll-mt-24" aria-labelledby="badges-h">
        <SectionTitle id="badges-h"><ReadingText bn="স্টিকার খাতা" en="Your badges" /></SectionTitle>
        <p className="mt-3 font-body text-lg text-muted"><ReadingText bn="প্রতিটা জোন শেষ করলে একটা স্টিকার।" en="Earn a badge by completing each zone." /></p>
        <div className="mt-8 max-w-3xl">
          <BadgeStickers />
        </div>
      </section>
    </main>
  );
}
