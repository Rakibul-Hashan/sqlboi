import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/jetbrains-mono";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Providers } from "@/components/Providers";
import { TEXT_SIZE_SCRIPT } from "@/components/TextSize";
import { ReadingText } from "@/components/ReadingLanguage";
import "./globals.css";

// ফন্ট-বরাদ্দ (ডক অনুযায়ী)। সব ফন্ট self-host করা, তাই বাইরের কোনো রিকোয়েস্ট নেই।
const alinur = localFont({
  src: [
    { path: "./fonts/alinur-regular.woff2", style: "normal" },
    { path: "./fonts/alinur-italic.woff2", style: "italic" },
  ],
  variable: "--font-alinur",
  display: "swap",
});
const mustafa = localFont({
  src: [
    { path: "./fonts/mustafa-regular.woff2", style: "normal" },
    { path: "./fonts/mustafa-italic.woff2", style: "italic" },
  ],
  variable: "--font-mustafa",
  display: "swap",
  preload: false,
});
const upohar = localFont({ src: "./fonts/upohar-regular.woff2", variable: "--font-upohar", display: "swap", preload: false });
const mahfuj = localFont({ src: "./fonts/mahfuj-regular.woff2", variable: "--font-mahfuj", display: "swap" });
const titir = localFont({ src: "./fonts/titir-regular.woff2", variable: "--font-titir", display: "swap", preload: false });
const mayukh = localFont({
  src: [
    { path: "./fonts/mayukh-regular.woff2", style: "normal" },
    { path: "./fonts/mayukh-italic.woff2", style: "italic" },
  ],
  variable: "--font-mayukh",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: { url: "/icon.svg", type: "image/svg+xml" } },
  title: { default: "MySQL বই: গেম খেলার মতো করে শেখো", template: "%s · MySQL বই" },
  description:
    "একজন সম্পূর্ণ নতুন পাঠক ৩১টা লেভেল পেরিয়ে ইউনি-লেভেলের MySQL শিখে ফেলবে, গেম খেলার মতো করে। কোনো আগের জ্ঞান লাগবে না।",
  openGraph: { type: "book", locale: "bn_BD", siteName: "MySQL বই" },
};

export const viewport: Viewport = { themeColor: "#FFFDF5", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [alinur, mustafa, upohar, mahfuj, titir, mayukh].map((f) => f.variable).join(" ");
  return (
    <html lang="bn" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:border-2 focus:border-ink focus:bg-yellow focus:px-3 focus:py-1">
            <ReadingText bn="মূল লেখায় যাও" en="Skip to content" />
          </a>
          <SiteHeader />
          <div id="main">{children}</div>
          <footer className="mt-24 border-t-[3px] border-ink bg-paper">
            <div className="mx-auto flex max-w-[88rem] flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p><ReadingText bn="MySQL বই · @Poralekha · তোমার অগ্রগতি শুধু তোমার ব্রাউজারেই থাকে।" en="MySQL Book · @Poralekha · Your progress is saved in this browser." /></p>
                <nav aria-labelledby="footer-nav" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-h3">
                  <span id="footer-nav" className="sr-only"><ReadingText bn="ফুটার" en="Footer" /></span>
                  <Link href="/cheatsheet" className="hover:underline"><ReadingText bn="চিট শিট" en="Cheat Sheet" /></Link>
                  <Link href="/revision" className="hover:underline"><ReadingText bn="রিভিশন" en="Revision" /></Link>
                  <Link href="/glossary" className="hover:underline"><ReadingText bn="শব্দকোষ" en="Glossary" /></Link>
                  <Link href="/level/level-4-5" className="hover:underline"><ReadingText bn="প্র্যাকটিস অ্যারেনা" en="Practice Arena" /></Link>
                  <a href="https://oursql.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    <ReadingText bn="OurSQL-এ প্র্যাকটিস ↗" en="Practice on OurSQL ↗" />
                  </a>
                </nav>
              </div>
              <p>
                <ReadingText bn="ওয়েবফন্ট-" en="Bangla fonts by" />{" "}
                <a href="https://lipighor.com" className="underline decoration-blue decoration-[3px] underline-offset-4" target="_blank" rel="noopener">
                  lipighor.com
                </a>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
