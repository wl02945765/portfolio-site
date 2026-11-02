"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

// 404 頁內容。文字在 content/site-text.json 的 notFound（後台「文字內容」可改，中英都有）。
export function NotFoundContent() {
  const { t } = useLanguage();
  const n = t.notFound;
  const btn =
    "inline-flex min-h-[44px] items-center rounded-full border border-zinc-500 px-8 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black";
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <h1 className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl">{n.title}</h1>
      <p className="max-w-md text-sm leading-7 text-zinc-400">{n.body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={btn}>
          {n.homeButton}
        </Link>
        <Link href="/video-work" className={btn}>
          {n.videoButton}
        </Link>
      </div>
    </div>
  );
}
