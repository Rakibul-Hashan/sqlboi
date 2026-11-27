"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const preferenceKey = "mysql-boi-reading-language";
const changeEvent = "mysql-boi-reading-language-change";
const LanguageContext = createContext(false);

function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

let english = false;
let storageWriteFailed = false;

function readPreference() {
  if (storageWriteFailed) return english;
  try {
    english = localStorage.getItem(preferenceKey) === "en";
  } catch {
    // Keep the in-memory preference if browser storage is unavailable.
  }
  return english;
}

function setLanguage(value: boolean) {
  english = value;
  try {
    localStorage.setItem(preferenceKey, value ? "en" : "bn");
    storageWriteFailed = false;
  } catch {
    storageWriteFailed = true;
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function ReadingLanguageProvider({ children }: { children: ReactNode }) {
  const isEnglish = useSyncExternalStore(subscribe, readPreference, () => false);
  useEffect(() => {
    document.documentElement.lang = isEnglish ? "en" : "bn";
    if (!isEnglish || document.getElementById("english-fonts")) return;
    const fonts = document.createElement("link");
    fonts.id = "english-fonts";
    fonts.rel = "stylesheet";
    fonts.href = "https://fonts.googleapis.com/css2?family=Kite+One&family=Lexend:wght@400..700&family=Oleo+Script:wght@400;700&family=Paprika&display=swap";
    document.head.append(fonts);
  }, [isEnglish]);
  return <LanguageContext.Provider value={isEnglish}>{children}</LanguageContext.Provider>;
}

export function useEnglish() {
  return useContext(LanguageContext);
}

export function ReadingText({ bn, en }: { bn: ReactNode; en: ReactNode }) {
  return useEnglish() ? en : bn;
}

export function BanglaContent({ children }: { children: ReactNode }) {
  return <LanguageContext.Provider value={false}>{children}</LanguageContext.Provider>;
}

export function LanguageSwitcher() {
  const isEnglish = useEnglish();
  return (
    <div role="group" aria-label="পড়ার ভাষা / Reading language" className="brut-sm flex h-11 shrink-0 items-stretch overflow-hidden bg-card text-sm">
      <button type="button" lang="bn" aria-pressed={!isEnglish} onClick={() => setLanguage(false)}
        className="px-2 aria-pressed:bg-yellow focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink">
        বাংলা
      </button>
      <button type="button" lang="en" aria-label="English" aria-pressed={isEnglish} onClick={() => setLanguage(true)}
        className="border-l-2 border-ink px-2 font-body font-semibold aria-pressed:bg-yellow focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink">
        EN
      </button>
    </div>
  );
}
