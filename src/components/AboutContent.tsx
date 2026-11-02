"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  getAboutGallery,
  getAboutSkills,
  getAboutHero,
  getAboutTags,
  getAboutPhilosophy,
  getAboutTimeline,
  getAboutTools,
} from "@/lib/content";
import { withBasePath } from "@/lib/basePath";
import { aiPageCopy, aboutGalleryCaption } from "@/i18n/dictionaries";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function paragraphs(text: string) {
  return text.split("\n\n").filter(Boolean);
}

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">{label}</span>
      </div>
    </div>
  );
}

export function AboutContent() {
  const { t, locale } = useLanguage();
  const a = t.about;
  const galleryPhotos = getAboutGallery();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const skillGroups = getAboutSkills();
  const hero = getAboutHero();
  const heroTags = getAboutTags();
  const philosophyLines = getAboutPhilosophy();
  const timeline = getAboutTimeline();
  const tools = getAboutTools();

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Section 1 — Hero */}
      <section className="px-6 pt-20 sm:px-10 sm:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col gap-8"
          >
            <motion.div variants={fadeUp}>
              <h1 className="heading-font text-5xl font-medium tracking-[0.02em] text-zinc-100 sm:text-7xl">
                {a.heading}
              </h1>
              <p className="heading-font mt-3 text-lg italic tracking-wide text-zinc-400 sm:text-xl">
                {t.heroTitle}
              </p>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="max-w-md text-base leading-8 tracking-wide text-zinc-400"
            >
              {a.heroDescription}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              {heroTags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-zinc-700 px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] text-zinc-400"
                >
                  {tag[locale]}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {hero.portraitSrc ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-black">
                <img
                  src={withBasePath(hero.portraitSrc)}
                  alt={locale === "zh" ? "Ching 的肖像照" : "Portrait of Ching"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            ) : (
              <Placeholder label="Portrait" className="aspect-[3/4] w-full" />
            )}
          </motion.div>
        </div>
      </section>

      {/* Section 2 — My Story */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="px-6 py-28 sm:px-10 sm:py-36"
      >
        <div className="mx-auto max-w-4xl">
          <motion.h2
            variants={fadeUp}
            className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl"
          >
            {a.storyTitle}
          </motion.h2>
          <div className="mt-10 flex max-w-2xl flex-col gap-6">
            {paragraphs(a.storyBody).map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-base leading-8 tracking-wide text-zinc-400 sm:text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 3 — Timeline */}
      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl"
          >
            {a.timelineTitle}
          </motion.h2>

          <div ref={timelineRef} className="relative mt-16 pl-8 sm:pl-10">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-800" />
            <motion.div
              className="absolute left-0 top-0 w-px origin-top bg-zinc-400"
              style={{ scaleY: lineScale, height: "100%" }}
            />

            <div className="flex flex-col gap-14">
              {timeline.map((step) => (
                <motion.div
                  key={step.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={fadeUp}
                  className="relative"
                >
                  <span className="absolute -left-[41px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-400 sm:-left-[49px]" />
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    {step.period[locale]}
                  </p>
                  {step.title[locale] && (
                    <p className="heading-font mt-2 text-xl text-zinc-100 sm:text-2xl">
                      {step.title[locale]}
                    </p>
                  )}
                  {step.items[locale].length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {step.items[locale].map((item, i) => (
                        <li key={i} className="text-sm text-zinc-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Philosophy */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="px-6 py-28 sm:px-10 sm:py-36"
      >
        <div className="mx-auto max-w-4xl">
          <motion.h2
            variants={fadeUp}
            className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl"
          >
            {a.philosophyTitle}
          </motion.h2>

          <div className="max-w-2xl">
            <motion.p
              variants={fadeUp}
              className="mt-10 text-base leading-8 tracking-wide text-zinc-400 sm:text-lg"
            >
              {a.philosophyIntro}
            </motion.p>

            <div className="mt-10 flex flex-col gap-3">
              {philosophyLines.map((line) => (
                <motion.p
                  key={line.id}
                  variants={fadeUp}
                  className="heading-font text-xl text-zinc-200 sm:text-2xl"
                >
                  {line[locale]}
                </motion.p>
              ))}
            </div>

            <motion.p
              variants={fadeUp}
              className="mt-10 text-base leading-8 tracking-wide text-zinc-400 sm:text-lg"
            >
              {a.philosophyClosing}
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Section 5 — Beyond Work */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="px-6 py-28 sm:px-10 sm:py-36"
      >
        <div className="mx-auto max-w-4xl">
          <motion.h2
            variants={fadeUp}
            className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl"
          >
            {a.beyondTitle}
          </motion.h2>

          <div className="mt-10 flex max-w-2xl flex-col gap-6">
            {paragraphs(a.beyondBody).map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-base leading-8 tracking-wide text-zinc-400 sm:text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Justified rows: every photo keeps its own aspect ratio (no
              forced 4:5 crop chopping landscape shots), and each row stretches
              to fill the full width. flex-grow = aspect ratio is what makes a
              row's photos share one height. The trailing spacer soaks up the
              last row's leftover space so a short final row isn't blown up. */}
          <div className="mt-14 flex flex-wrap gap-3 [--row-h:130px] sm:[--row-h:200px]">
            {galleryPhotos.map((photo) => {
              const ratio = photo.width && photo.height ? photo.width / photo.height : 4 / 5;
              if (photo.videoSrc) {
                return (
                  <motion.figure key={photo.id} variants={fadeUp} className="w-full">
                    <div
                      className="relative mx-auto w-full overflow-hidden rounded-sm bg-black"
                      style={{ aspectRatio: ratio }}
                    >
                      {playingId === photo.id ? (
                        <video
                          src={withBasePath(photo.videoSrc)}
                          poster={withBasePath(photo.src)}
                          controls
                          autoPlay
                          playsInline
                          preload="none"
                          className="absolute inset-0 h-full w-full bg-black object-contain"
                        />
                      ) : (
                        <>
                          <img
                            src={withBasePath(photo.src)}
                            alt={photo.caption[locale]}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label="Play video"
                            onClick={() => setPlayingId(photo.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/40"
                          >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 text-xl text-white">
                              ▶
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                    {photo.caption[locale] && (
                      <figcaption className="mt-3 text-sm leading-7 tracking-wide text-zinc-400">
                        {photo.caption[locale]}
                      </figcaption>
                    )}
                  </motion.figure>
                );
              }
              return (
                <motion.div
                  key={photo.id}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-sm bg-black"
                  style={{ flexGrow: ratio, flexBasis: `calc(var(--row-h) * ${ratio})`, aspectRatio: ratio }}
                >
                  {photo.src ? (
                    <>
                      <img
                        src={withBasePath(photo.src)}
                        alt={photo.caption[locale]}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                      {photo.caption[locale] && (
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs tracking-wide text-zinc-200">
                          {photo.caption[locale]}
                        </span>
                      )}
                    </>
                  ) : (
                    <Placeholder label={photo.caption[locale]} className="absolute! inset-0" />
                  )}
                </motion.div>
              );
            })}
            <div aria-hidden="true" style={{ flexGrow: 10, flexBasis: 0 }} />
          </div>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-sm leading-7 tracking-wide text-zinc-500"
          >
            {aboutGalleryCaption[locale]}
          </motion.p>
        </div>
      </motion.section>

      {/* Section 6 — Skills */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="px-6 py-28 sm:px-10 sm:py-36"
      >
        <div className="mx-auto max-w-4xl">
          <motion.h2
            variants={fadeUp}
            className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl"
          >
            {a.skillsTitle}
          </motion.h2>

          <div className="mt-14 grid gap-12 sm:grid-cols-3">
            {skillGroups.map((group) => (
              <motion.div key={group.id} variants={fadeUp}>
                <p className="border-b border-zinc-800 pb-3 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {group.category[locale]}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.items[locale].map((item, i) => (
                    <li key={i} className="text-sm text-zinc-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* 工具熟悉度：只列工具名；熟練度資料（content/aboutTools.json 的 level）有填才顯示 */}
          <motion.div variants={fadeUp} className="mt-14">
            <p className="border-b border-zinc-800 pb-3 text-xs uppercase tracking-[0.2em] text-zinc-400">
              {a.toolsTitle}
            </p>
            <ul className="mt-4 flex flex-col divide-y divide-white/10">
              {tools.map((tool) => (
                <li key={tool.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2.5 text-sm">
                  <span className="text-zinc-300">
                    {tool.name}
                    {tool.note[locale] && <span className="ml-2 text-zinc-400">{tool.note[locale]}</span>}
                  </span>
                  {tool.level[locale] && <span className="text-zinc-400">{tool.level[locale]}</span>}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* Final Section — CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="flex flex-col items-center gap-10 px-6 pb-32 pt-16 text-center sm:px-10"
      >
        <motion.p
          variants={fadeUp}
          className="heading-font max-w-2xl text-xl font-medium leading-tight text-zinc-100 sm:text-3xl"
        >
          {a.ctaText}
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/contact"
            className="rounded-full border border-zinc-500 px-10 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black"
          >
            {a.ctaButton}
          </Link>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link
            href="/ai-workflow"
            className="text-sm tracking-[0.05em] text-zinc-400 underline underline-offset-4 transition-colors hover:text-zinc-100"
          >
            {aiPageCopy[locale].linkFromAbout}
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
