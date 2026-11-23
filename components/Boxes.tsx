// লেখার বক্সগুলো, স্কেচবুক স্টাইলে: মোটা দাগ, শক্ত ছায়া, স্টিকারের মতো লেবেল।
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleCheck,
  CircleX,
  Info,
  Lightbulb,
  Pin,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { BugDoodle } from "./Doodles";

type Props = { title?: string; children: React.ReactNode };

function Label({ icon: Icon, children, className = "" }: { icon: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2 font-h3 text-base ${className}`}>
      <Icon className="size-5 shrink-0" strokeWidth={2.4} aria-hidden />
      {children}
    </p>
  );
}

export function Mission({ children }: Props) {
  return (
    <section className="brut -rotate-[0.6deg] bg-yellow-soft p-5 sm:p-6" aria-label="মিশন">
      <Label icon={Target}>মিশন: এই লেভেলে কী শিখব</Label>
      <div className="box-body mt-2 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </section>
  );
}

export function Story({ title, children }: Props) {
  return (
    <aside className="brut relative mt-8 bg-card p-5 pt-7 text-[1.1rem] leading-relaxed sm:p-7 sm:pt-8">
      <span aria-hidden className="tape -top-3.5 left-1/2 -translate-x-1/2 rotate-2" />
      {title && <Label icon={BookOpen} className="font-story text-lg">{title}</Label>}
      <div className={`box-body ${title ? "mt-2" : ""}`}>{children}</div>
    </aside>
  );
}

export function Analogy({ children }: Props) {
  return (
    <aside className="brut rotate-[0.5deg] bg-blue-soft p-5 sm:p-6">
      <Label icon={Sparkles} className="font-story text-lg">উপমা</Label>
      <div className="box-body mt-2">{children}</div>
    </aside>
  );
}

/** সলিড হলুদ স্টিকার: শুধু খুব জরুরি টিপে */
export function Tip({ title = "টিপ", children }: Props) {
  return (
    <aside className="brut -rotate-[0.8deg] bg-yellow p-5 sm:p-6 [&_code]:!bg-card [&_strong]:!bg-none [&_strong]:underline [&_strong]:decoration-2">
      <Label icon={Lightbulb} className="font-story text-lg">{title}</Label>
      <div className="box-body mt-2">{children}</div>
    </aside>
  );
}

/** সলিড গোলাপি স্টিকার: "মনে রেখো" */
export function Remember({ children }: Props) {
  return (
    <aside className="brut rotate-[0.8deg] bg-pink p-5 sm:p-6 [&_code]:!bg-card [&_strong]:!bg-none [&_strong]:underline [&_strong]:decoration-2">
      <Label icon={Pin} className="font-story text-lg">মনে রেখো</Label>
      <div className="box-body mt-2">{children}</div>
    </aside>
  );
}

export function Note({ title, children }: Props) {
  return (
    <aside className="brut-sm bg-card p-5 sm:p-6">
      {title && <Label icon={Info}>{title}</Label>}
      <div className={`box-body ${title ? "mt-2" : ""}`}>{children}</div>
    </aside>
  );
}

export function Success({ title = "সফল", children }: Props) {
  return (
    <div className="brut-sm bg-green-soft p-4 sm:p-5">
      <Label icon={CircleCheck} className="text-ok">{title}</Label>
      <div className="box-body mt-1">{children}</div>
    </div>
  );
}

export function ErrorBox({ title = "Error", children }: Props) {
  return (
    <div className="brut-sm bg-err-soft p-4 sm:p-5">
      <Label icon={CircleX} className="text-err">{title}</Label>
      <div className="box-body mt-1 font-code text-[0.95rem]">{children}</div>
    </div>
  );
}

export function BugMonster({ title, children }: Props) {
  return (
    <section className="brut bg-pink-soft p-5 sm:p-6" aria-label="বাগ মনস্টার">
      <div className="flex items-center gap-3">
        <BugDoodle className="w-16 shrink-0 animate-jiggle" />
        <p className="font-h3 text-lg">বাগ মনস্টার{title ? `: ${title}` : ""}</p>
      </div>
      <div className="box-body mt-3">{children}</div>
    </section>
  );
}

export function Solution({ title = "সমাধান দেখো", children }: Props) {
  return (
    <details className="group brut-sm bg-card px-4 py-2.5 open:pb-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-h3 select-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-5 transition-transform group-open:rotate-90" strokeWidth={2.6} aria-hidden />
        {title}
      </summary>
      <div className="box-body mt-3">{children}</div>
    </details>
  );
}

/** ধাপে ধাপে প্রবাহ */
export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="!pl-0 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ listStyle: "none" }}>
      {steps.map((s, i) => (
        <li key={i} className="!mt-0 flex items-center gap-3">
          <span className="brut-sm bg-card px-3 py-2 text-[1rem] leading-snug" style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
            <span className="font-h3">{"০১২৩৪৫৬৭৮৯"[i + 1]}.</span> {s}
          </span>
          {i < steps.length - 1 && <ArrowRight className="size-5 shrink-0 rotate-90 sm:rotate-0" strokeWidth={2.6} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
