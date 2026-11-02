"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { workCopy } from "@/i18n/jobhunt";
import { ProjectCard } from "@/components/ProjectCase";
import type { ProjectEntry } from "@/lib/projects";

/** 首頁首屏下方的「精選專案」4 張卡；/work 清單頁共用卡片。 */
export function FeaturedProjects({ entries, asPage = false }: { entries: ProjectEntry[]; asPage?: boolean }) {
  const { locale } = useLanguage();
  const w = workCopy[locale];
  if (entries.length === 0) return null;

  return (
    <section className={`mx-auto w-full max-w-6xl px-6 sm:px-10 ${asPage ? "pb-24 pt-16 sm:pt-20" : "pb-24 pt-10"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        {asPage ? (
          <h1 className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl">{w.listTitle}</h1>
        ) : (
          <h2 className="heading-font text-2xl font-medium text-zinc-100 sm:text-3xl">{w.featuredHeading}</h2>
        )}
        {!asPage && (
          <Link
            href="/work"
            className="inline-flex min-h-[44px] items-center font-mono text-xs uppercase tracking-[0.12em] text-zinc-400 hover:text-zinc-100"
          >
            {w.featuredAll} →
          </Link>
        )}
      </div>
      {asPage && <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">{w.listIntro}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((entry) => (
          <ProjectCard key={entry.project.slug} entry={entry} />
        ))}
      </div>
    </section>
  );
}
