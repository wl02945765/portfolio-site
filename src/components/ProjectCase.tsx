"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { pending, workCopy } from "@/i18n/jobhunt";
import { YoutubeThumb } from "@/components/YoutubeThumb";
import { btnPrimary } from "@/lib/buttonStyles";
import { withBasePath } from "@/lib/basePath";
import type { Video } from "@/lib/content";
import type { ProjectEntry } from "@/lib/projects";

/** 虛線框佔位：一眼看得出是還沒補的內容，避免忘記補就上線。 */
export function PendingBox({ label, className = "" }: { label: string; className?: string }) {
  const { locale } = useLanguage();
  return (
    <p
      className={`border border-dashed border-zinc-500 px-3 py-2 font-mono text-xs leading-6 tracking-wide text-zinc-400 ${className}`}
    >
      {pending(locale, label)}
    </p>
  );
}

function Section({ heading, index, children }: { heading: string; index: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-6">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
        <span className="mr-2.5 text-[#c9a66b]">{index}</span>
        {heading}
      </h2>
      <div className="mt-4 flex flex-col gap-3 text-[15px] leading-7 tracking-wide text-zinc-300">{children}</div>
    </section>
  );
}

function pick(video: Video, locale: "zh" | "en") {
  return {
    title: video.title[locale] || video.title.zh,
    services: video.services[locale] || video.services.zh,
  };
}

export function ProjectCase({
  entry,
  prev,
  next,
}: {
  entry: ProjectEntry;
  prev?: ProjectEntry;
  next?: ProjectEntry;
}) {
  const { locale } = useLanguage();
  const w = workCopy[locale];
  const { project, video } = entry;
  const { title, services } = pick(video, locale);
  const [playing, setPlaying] = useState(false);

  const tools = project.tools[locale];
  const steps = project.process[locale];
  const typeText = project.type[locale] || project.type.zh;
  const lengthText = project.length[locale] || project.length.zh;
  const background = project.background[locale] || project.background.zh;
  const outcome = project.outcome[locale] || project.outcome.zh;

  const glance = [
    { label: w.glanceRole, body: <span>{services}</span> },
    {
      label: w.glanceTools,
      body: tools.length ? <span>{tools.join(" / ")}</span> : <PendingBox label={w.pendingTools} />,
    },
    {
      label: w.glanceLength,
      body: (
        <span>
          {w.platformYoutube}
          {lengthText ? `｜${lengthText}` : ""}
          {!lengthText && <PendingBox label={w.pendingLength} className="mt-2" />}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <Link
        href="/work"
        className="mb-8 inline-flex min-h-[44px] w-fit items-center rounded-full bg-black/80 px-4 text-xs uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-200"
      >
        ← {w.backToList}
      </Link>

      {/* 0 頁首 */}
      <header className="mx-auto w-full max-w-[720px]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
          {video.year && <span className="mr-3">{video.year}</span>}
          {typeText ? typeText : <span className="border border-dashed border-zinc-500 px-2 py-0.5">{pending(locale, w.pendingType)}</span>}
        </p>
        <h1 className="heading-font mt-3 text-3xl font-medium leading-tight text-zinc-100 sm:text-4xl">{title}</h1>
      </header>

      {/* 1 成品影片：點擊後才載入 YouTube，進頁面時只下載一張縮圖 */}
      <div className="mx-auto mt-8 w-full max-w-[1100px]">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {video.youtubeId && playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?modestbranding=1&rel=0&autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full bg-black"
              style={{ border: 0 }}
            />
          ) : (
            <>
              {video.youtubeId ? (
                <YoutubeThumb
                  id={video.youtubeId}
                  start="sddefault"
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={withBasePath(video.thumbnail)}
                  alt={title}
                  fill
                  sizes="(min-width: 1100px) 1100px, 100vw"
                  unoptimized
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`${w.watchPlay}：${title}`}
                className="group absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/40"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-black/50 transition-transform group-hover:scale-110">
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[17px] border-y-transparent border-l-white" />
                </span>
              </button>
            </>
          )}
        </div>
        {video.youtubeId && (
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center text-xs uppercase tracking-[0.1em] text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
          >
            {w.watchOnYoutube}
          </a>
        )}
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[720px] flex-col gap-10">
        {/* 2 一行摘要 + 三格速覽 */}
        <section>
          <p className="text-base leading-8 tracking-wide text-zinc-200 sm:text-lg">
            {w.summaryFallback(video.year, services)}
          </p>
          <dl className="mt-6 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {glance.map((g) => (
              <div key={g.label} className="bg-black p-4">
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">{g.label}</dt>
                <dd className="mt-2 text-sm leading-6 text-zinc-200">{g.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 3 背景 */}
        <Section index="01" heading={w.backgroundHeading}>
          {background ? <p>{background}</p> : <PendingBox label={w.pendingBackground} />}
        </Section>

        {/* 4 我的角色 */}
        <Section index="02" heading={w.roleHeading}>
          <ul className="flex flex-wrap gap-2">
            {services.split("、").map((s) => (
              <li key={s} className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-200">
                {s}
              </li>
            ))}
          </ul>
          <PendingBox label={`${w.roleTeamNote}；${w.pendingRoleConfirm}`} />
        </Section>

        {/* 5 使用工具 */}
        <Section index="03" heading={w.toolsHeading}>
          {tools.length ? (
            <ul className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <li key={tool} className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-200">
                  {tool}
                </li>
              ))}
            </ul>
          ) : (
            <PendingBox label={w.pendingTools} />
          )}
        </Section>

        {/* 6 流程 */}
        <Section index="04" heading={w.processHeading}>
          {steps.length ? (
            <ol className="flex list-decimal flex-col gap-2 pl-5">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <PendingBox label={w.pendingProcess} />
          )}
        </Section>

        {/* 7 成果：只寫成品規格，不填觀看數或評價 */}
        <Section index="05" heading={w.outcomeHeading}>
          <p>
            {w.outcomePlatform}：{w.platformYoutube}
          </p>
          {outcome ? <p>{outcome}</p> : <PendingBox label={w.pendingOutcome} />}
        </Section>

        {/* 8 頁尾導覽 */}
        <nav className="flex flex-col gap-4 border-t border-white/10 pt-8" aria-label={w.projectNote}>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {prev ? (
              <Link
                href={`/work/${prev.project.slug}`}
                className="inline-flex min-h-[44px] items-center text-sm text-zinc-300 hover:text-white"
              >
                ← {w.prev}：{pick(prev.video, locale).title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/work/${next.project.slug}`}
                className="inline-flex min-h-[44px] items-center text-sm text-zinc-300 hover:text-white sm:text-right"
              >
                {w.next}：{pick(next.video, locale).title} →
              </Link>
            )}
          </div>
          <Link
            href="/contact?mode=hire"
            className={`${btnPrimary} w-fit`}
          >
            {w.contactHire}
          </Link>
        </nav>
      </div>
    </div>
  );
}

/** 精選專案卡片（首頁與 /work 清單共用）。縮圖只載入一張小圖，lazy。 */
export function ProjectCard({ entry }: { entry: ProjectEntry }) {
  const { locale } = useLanguage();
  const w = workCopy[locale];
  const { project, video } = entry;
  const { title, services } = pick(video, locale);
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex flex-col border border-white/10 transition-colors hover:border-white/35"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {video.youtubeId ? (
          <YoutubeThumb
            id={video.youtubeId}
            start="hqdefault"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <Image
            src={withBasePath(video.thumbnailSmall || video.thumbnail)}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-400">{video.year}</p>
        <h3 className="heading-font text-lg leading-snug text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-400">{services}</p>
        <span className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-[#c9a66b]">
          {w.viewProject} →
        </span>
      </div>
    </Link>
  );
}
