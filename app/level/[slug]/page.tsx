import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelHotkeys } from "@/components/LevelHotkeys";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { getLevel, getNeighbours, getZone, kindLabel, levels, toBn, zoneBg } from "@/lib/levels";
import { content } from "@/lib/content";
import { LevelProvider } from "@/components/LevelContext";
import { LevelGate } from "@/components/LevelGate";
import { LevelList } from "@/components/Sidebar";
import { Underline } from "@/components/Doodles";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return levels.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const level = getLevel(slug);
  if (!level) return {};
  const prefix = level.kind === "level" ? `লেভেল ${level.label}` : level.label;
  return { title: `${prefix}: ${level.title}`, description: level.topics };
}

export default async function LevelPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const level = getLevel(slug);
  const load = content[slug];
  if (!level || !load) notFound();

  const { default: Content } = await load();
  const zone = getZone(level.zone);
  const { prev, next } = getNeighbours(slug);

  return (
    <div className="mx-auto grid max-w-[88rem] gap-10 px-4 lg:grid-cols-[16rem_1fr] xl:gap-14 xl:grid-cols-[18rem_1fr] xl:px-8">
      {/* বড় স্ক্রিনে স্থির সূচি; ছোট স্ক্রিনে হেডারের "সূচি" বোতামে off-canvas */}
      <aside className="hidden lg:block">
        <div data-scroll-box className="brut sticky top-24 mt-10 max-h-[calc(100dvh-8rem)] overflow-y-auto bg-card p-4">
          <LevelList current={slug} />
        </div>
      </aside>

      <main className="min-w-0 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className={`brut-sm press press-sm -rotate-2 px-3 py-0.5 font-h3 text-sm ${zoneBg[level.zone]}`}>
            জোন {zone.number}: {zone.name}
          </Link>
          <span className="brut-sm inline-flex rotate-1 items-center gap-1.5 bg-card px-3 py-0.5 font-h3 text-sm">
            <Star className="size-4 fill-yellow" strokeWidth={2.4} aria-hidden />
            {kindLabel(level.kind)} {level.kind === "level" ? level.label : ""} · {toBn(level.xp)} XP
          </span>
        </div>

        <h1 className="relative mt-5 inline-block font-h1 text-4xl leading-snug sm:text-5xl">
          {level.title}
          <Underline className="absolute -bottom-3 left-0 h-5 w-full" />
        </h1>
        <p className="mt-5 max-w-[62rem] font-body text-lg text-muted xl:text-xl">{level.topics}</p>

        <div className="mt-6">
          <LevelGate slug={slug} />
        </div>

        <LevelProvider value={{ slug, xp: level.xp, next: next && { slug: next.slug, title: next.title } }}>
          <article className="prose-boi mt-8">
            <Content />
          </article>
        </LevelProvider>

        <LevelHotkeys prev={prev?.slug} next={next?.slug} />
        <nav className="mt-16 grid gap-5 sm:grid-cols-2" aria-label="আগের ও পরের লেভেল">
          {prev ? (
            <Link href={`/level/${prev.slug}`} className="brut press flex items-center gap-3 bg-card p-4">
              <ArrowLeft className="size-6 shrink-0" strokeWidth={2.6} aria-hidden />
              <span>
                <span className="block font-h3 text-sm text-muted">আগের <kbd className="kbd ml-1 hidden !h-5 !min-w-5 !text-[0.65rem] sm:inline-grid">[</kbd></span>
                <span className="block font-h3 text-lg">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/level/${next.slug}`} className="brut press flex items-center justify-end gap-3 bg-yellow p-4 text-right">
              <span>
                <span className="block font-h3 text-sm"><kbd className="kbd mr-1 hidden !h-5 !min-w-5 !text-[0.65rem] sm:inline-grid">]</kbd> পরের</span>
                <span className="block font-h3 text-lg">{next.title}</span>
              </span>
              <ArrowRight className="size-6 shrink-0" strokeWidth={2.6} aria-hidden />
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
