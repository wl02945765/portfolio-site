"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import type { Video, VideoCategory } from "@/lib/content";

type Row = { key: string; label: string; videos: Video[] };

const SCROLL_EDGE_TOLERANCE = 4;

function ReelRow({ label, videos }: { label: string; videos: Video[] }) {
  const { locale } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = viewportRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= SCROLL_EDGE_TOLERANCE);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - SCROLL_EDGE_TOLERANCE);
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [videos]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85 });
  };

  return (
    <div className="group/row relative">
      <p className="mb-3 px-6 text-[11px] uppercase tracking-[0.3em] text-zinc-500 sm:px-10">
        {label}
      </p>

      <div className="relative">
        {!atStart && (
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Scroll left"
            className="absolute inset-y-0 left-0 z-20 hidden w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent text-2xl text-zinc-200 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:text-white sm:flex sm:w-16"
          >
            ‹
          </button>
        )}
        {!atEnd && (
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Scroll right"
            className="absolute inset-y-0 right-0 z-20 hidden w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent text-2xl text-zinc-200 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:text-white sm:flex sm:w-16"
          >
            ›
          </button>
        )}

        <div
          ref={viewportRef}
          onScroll={updateEdges}
          className="flex scroll-smooth gap-3 overflow-x-auto px-6 py-2 [scrollbar-width:none] sm:gap-4 sm:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/video-work/${video.slug}`}
              className="group relative h-[26vh] flex-shrink-0 overflow-hidden bg-black transition-transform duration-300 hover:z-10 hover:scale-[1.03] sm:h-[38vh]"
              style={{ aspectRatio: "16 / 9" }}
              onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
              onMouseLeave={(e) => {
                const v = e.currentTarget.querySelector("video");
                if (!v) return;
                v.pause();
                v.currentTime = 0;
              }}
            >
              <img
                src={withBasePath(video.thumbnail)}
                alt={video.title[locale]}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              />
              <video
                src={withBasePath(video.videoSrc)}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 sm:p-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-100 sm:text-sm">
                  {video.title[locale]}
                </p>
                <p className="mt-1 text-[10px] tracking-wide text-zinc-400 sm:text-[11px]">
                  {video.services[locale]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function groupIntoRows(videos: Video[], categories: VideoCategory[], uncategorizedLabel: string): Row[] {
  const rows: Row[] = [];
  for (const category of categories) {
    const inCategory = videos.filter((v) => v.categoryId === category.id);
    if (inCategory.length > 0) {
      rows.push({ key: category.id, label: category.name.zh || category.name.en, videos: inCategory });
    }
  }
  const knownIds = new Set(categories.map((c) => c.id));
  const uncategorized = videos.filter((v) => !v.categoryId || !knownIds.has(v.categoryId));
  if (uncategorized.length > 0) {
    rows.push({ key: "__uncategorized", label: uncategorizedLabel, videos: uncategorized });
  }
  return rows;
}

export function VideoGrid({
  videos,
  categories,
}: {
  videos: Video[];
  categories: VideoCategory[];
}) {
  const { t, locale } = useLanguage();

  if (videos.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeading>{t.videoWork.heading}</PageHeading>
        <div className="flex flex-1 items-center justify-center px-6 py-32 text-sm tracking-wide text-zinc-500">
          {t.videoWork.empty}
        </div>
      </div>
    );
  }

  const rows = groupIntoRows(videos, categories, t.videoWork.uncategorized);

  return (
    <div className="pb-24">
      <PageHeading>{t.videoWork.heading}</PageHeading>

      <div className="mt-10 flex flex-col gap-10 sm:gap-14">
        {rows.map((row) => (
          <ReelRow
            key={row.key}
            label={row.label || (locale === "zh" ? "未命名" : "Untitled")}
            videos={row.videos}
          />
        ))}
      </div>
    </div>
  );
}
