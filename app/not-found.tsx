import Link from "next/link";
import { BugDoodle } from "@/components/Doodles";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <BugDoodle className="mx-auto w-28 animate-jiggle" />
      <p className="mt-4 font-deco text-6xl">৪০৪</p>
      <h1 className="mt-2 font-h1 text-4xl">এই পাতাটা খাতায় নেই</h1>
      <p className="mt-4 font-body text-lg">
        হয়তো লিংকটা ভুল। <code className="rounded-md border-2 border-ink bg-card px-1.5 font-code text-base">SELECT * FROM pages WHERE url = ?</code> চালিয়ে কিছু পাওয়া গেল না।
      </p>
      <Link href="/" className="brut press mt-8 inline-block bg-yellow px-6 py-3 font-h3 text-lg">
        সূচিতে ফিরে যাও
      </Link>
    </main>
  );
}
