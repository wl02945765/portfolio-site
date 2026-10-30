"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { aiPageCopy } from "@/i18n/dictionaries";
import { withBasePath } from "@/lib/basePath";

/**
 * /ai-workflow：我怎麼用 AI 當幫手（純靜態文字，零圖片）。
 * 不進主導覽，只從 About 底部一行連結進來。
 * 區塊 4「流程自動化」涉及合作的 Podcast 專案，只講抽象流程；
 * TODO(待使用者確認可否公開)：確認前預設仍顯示以便預覽，確認不行就刪掉該 <section>。
 */
const card = "rounded-md border border-white/10 bg-white/[0.03] p-6";
const h2 = "heading-font text-xl font-medium tracking-[0.08em] text-zinc-100 sm:text-2xl";

export function AiWorkflowContent() {
  const { locale } = useLanguage();
  const c = aiPageCopy[locale];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 pb-28 pt-14 sm:px-10 sm:pt-20">
      {/* 1 頁首 */}
      <header>
        <p className="font-mono text-[12px] tracking-[0.3em] text-zinc-400">{c.titleEn.toUpperCase()}</p>
        <h1 className="heading-font mt-4 text-3xl font-medium tracking-[0.06em] text-zinc-100 sm:text-5xl">
          {c.title}
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-loose text-zinc-300 sm:text-base">{c.intro}</p>
      </header>

      {/* 2 分工表 */}
      <section aria-labelledby="split">
        <h2 id="split" className={h2}>{c.splitHeading}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={card}>
            <p className="font-mono text-[12px] tracking-[0.2em] text-[#c9a66b]">{c.handTitle}</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-200">
              {c.handItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-5 border-t border-white/10 pt-4 text-sm text-zinc-300">
              {c.handNote} →{" "}
              <Link href="/photography" className="underline underline-offset-4 hover:text-white">
                {c.handNoteLink}
              </Link>
            </p>
          </div>
          <div className={card}>
            <p className="font-mono text-[12px] tracking-[0.2em] text-zinc-400">{c.aiTitle}</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-200">
              {c.aiItems.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 剪輯的幫手：兩張卡 */}
      <section aria-labelledby="edit">
        <h2 id="edit" className={h2}>{c.editHeading}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={card}>
            <h3 className="text-base font-medium text-zinc-100">{c.cardSubtitleTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{c.cardSubtitleBody}</p>
          </div>
          <div className={card}>
            <h3 className="text-base font-medium text-zinc-100">{c.cardMixTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{c.cardMixBody}</p>
          </div>
        </div>
      </section>

      {/* 4 流程自動化（待使用者確認可否公開）*/}
      <section aria-labelledby="flow">
        <div className="flex items-center gap-3">
          <h2 id="flow" className={h2}>{c.flowHeading}</h2>
          <span className="rounded-full border border-[#c9a66b] px-3 py-0.5 text-[11px] tracking-[0.15em] text-[#c9a66b]">
            {c.flowBadge}
          </span>
        </div>
        <div className={`${card} mt-6`}>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-300">{c.flowBody}</p>
          <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3">
            {c.flowSteps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="rounded border border-white/20 px-3 py-1.5 text-xs text-zinc-200">{s}</span>
                {i < c.flowSteps.length - 1 && (
                  <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true" className="text-zinc-500">
                    <path d="M0 5h13M9 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs text-zinc-400">{c.flowFootnote}</p>
        </div>
      </section>

      {/* 5 這個網站 */}
      <section aria-labelledby="site">
        <h2 id="site" className={h2}>{c.siteHeading}</h2>
        <p className="mt-5 max-w-2xl text-sm leading-loose text-zinc-300">{c.siteBody}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {c.sitePoints.map((p) => (
            <li key={p} className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-zinc-300">
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* 6 正在學的 AI（只用文字） */}
      <section aria-labelledby="learn">
        <h2 id="learn" className={h2}>{c.learnHeading}</h2>
        <p className="mt-5 max-w-2xl text-sm leading-loose text-zinc-300">{c.learnIntro}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {c.learnCards.map((card_) => (
            <div key={card_.title} className={card}>
              <h3 className="text-base font-medium text-zinc-100">{card_.title}</h3>
              <p className="mt-5 font-mono text-[12px] tracking-[0.2em] text-[#c9a66b]">{c.learnHowLabel}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{card_.how}</p>
              <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[12px] tracking-[0.2em] text-zinc-400">
                {c.learnTakeawayLabel}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{card_.takeaway}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6.5 我用 AI 做出來的東西（卡片 2 刻意不放連結：站上有即時同步選擇功能） */}
      <section aria-labelledby="built">
        <h2 id="built" className={h2}>{c.builtHeading}</h2>
        <p className="mt-5 max-w-2xl text-sm leading-loose text-zinc-300">{c.builtIntro}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {c.builtProjects.map((p) => (
            <div key={p.title} className={`${card} flex flex-col`}>
              <img
                src={withBasePath(p.image)}
                alt={p.title}
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full rounded-sm border border-white/10 object-cover object-top"
              />
              <h3 className="mt-5 text-base font-medium text-zinc-100">{p.title}</h3>
              <p className="mt-1 text-xs tracking-wide text-zinc-400">{p.subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">{p.body}</p>
              <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[12px] tracking-[0.2em] text-[#c9a66b]">
                {c.builtRoleLabel}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{p.role}</p>
              {p.linkHref && (
                <a
                  href={p.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-fit rounded-full border border-zinc-400 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:bg-zinc-200 hover:text-black"
                >
                  {p.linkLabel} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7 回到作品 */}
      <section aria-labelledby="back" className="border-t border-white/10 pt-10">
        <h2 id="back" className={h2}>{c.backHeading}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {c.backLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-zinc-400 px-7 py-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:bg-zinc-200 hover:text-black"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
