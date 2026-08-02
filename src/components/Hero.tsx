"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative flex h-[calc(100svh-57px)] w-full flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-[0.08em] text-zinc-300 sm:text-6xl md:text-7xl">
        {t.heroTitle}
      </h1>
      <p className="mt-6 max-w-xl text-sm tracking-[0.05em] text-zinc-400 sm:text-base">
        {t.heroSlogan}
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/photography"
          className="rounded-full border border-zinc-500 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black"
        >
          {t.heroCtaPhotography}
        </Link>
        <Link
          href="/video-work"
          className="rounded-full border border-zinc-500 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black"
        >
          {t.heroCtaVideoWork}
        </Link>
      </div>
    </section>
  );
}
