"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import { btnPrimary, btnSecondary } from "@/lib/buttonStyles";

const EMAIL = "ching.huang.tpe@gmail.com";

/**
 * 首頁首屏（Hero A：職能直述）。依 _review/design/hero-a.html 與 spec.md。
 * 注意：背景圖 public/media/home/hero-*.webp 只是「示意圖」（取自 featured 照片重新輸出），
 * 不是使用者自己的作品畫面，上線前須換成使用者自己的 showreel 封面／代表畫面，
 * 換圖後遮罩（下方 gradient）也要重測文字對比 ≥4.5:1。
 * 職稱在使用者確認做過剪輯前，不得寫「剪輯」。
 */
export function Hero() {
  const { t } = useLanguage();
  const parts = t.heroRoleParts;
  const resumeHref = `mailto:${EMAIL}?subject=${encodeURIComponent(t.heroResumeSubject)}`;

  return (
    // isolate：建立獨立堆疊環境，讓 -z 的背景圖不會被外層 body 黑底蓋掉
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-57px)] w-full flex-col justify-end overflow-hidden pb-10 md:pb-16"
    >
      {/* 原生 picture：手機抓 828 寬（約 53KB）、桌機抓 1920 寬（約 114KB）；
          首屏最大圖，不 lazy，fetchPriority 高。 */}
      <picture>
        <source media="(max-width:767px)" srcSet={withBasePath("/media/home/hero-m-828.webp")} />
        <img
          src={withBasePath("/media/home/hero-d-1920.webp")}
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      </picture>
      {/* 電影感遮罩：下半段加深，讓小字對比 ≥4.5:1 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.4) 18%, rgba(0,0,0,.82) 42%, rgba(0,0,0,.9) 65%, #000 100%)",
        }}
      />

      {/* 與導覽列相同的最大寬度與左右內距，左邊界才會對齊 */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <p className="mb-[18px] flex items-center gap-2.5 text-sm tracking-[0.14em] text-zinc-300 [text-shadow:0_1px_6px_rgba(0,0,0,.85)]">
          <i aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-[#c9a66b]" />
          {t.heroLocation}
        </p>

        {/* 手機三段各一行；桌機同一行並顯示金色分隔點。aria-label 讓讀屏讀出頓號 */}
        <h1
          id="hero-title"
          aria-label={t.heroRoleAria}
          className="heading-font text-[38px] font-medium leading-[1.18] tracking-[0.06em] text-zinc-100 md:text-[clamp(44px,5.4vw,80px)] md:tracking-[0.07em]"
        >
          {parts.map((part, i) => (
            <span key={part} aria-hidden="true" className="block md:inline">
              {part}
              {i < parts.length - 1 && <em className="hidden px-[.08em] not-italic text-[#c9a66b] md:inline">・</em>}
            </span>
          ))}
        </h1>

        <p className="mt-[18px] max-w-[34rem] text-[15px] tracking-[0.04em] text-zinc-200 [text-wrap:balance] md:mt-[22px] md:text-lg">
          {t.heroSub}
        </p>

        <div className="mt-7 flex flex-col items-stretch gap-3 md:mt-9 md:flex-row md:flex-wrap md:items-center md:gap-4">
          <Link href="/work" className={btnPrimary}>
            {t.heroCtaWork}
          </Link>
          <Link href="/contact?mode=hire" className={btnSecondary}>
            {t.heroCtaContact}
          </Link>
        </div>

        <p className="mt-[18px] flex flex-col gap-0.5 text-sm text-zinc-300 [text-shadow:0_1px_6px_rgba(0,0,0,.85)] md:mt-[22px] md:flex-row md:items-center md:gap-5">
          <span className="font-mono">{EMAIL}</span>
          <a
            href={resumeHref}
            className="inline-flex min-h-[32px] items-center underline decoration-zinc-500 underline-offset-[3px] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c9a66b]"
          >
            {t.heroResumeHint}
          </a>
        </p>
      </div>
    </section>
  );
}
