"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import type { Video, VideoCategory } from "@/lib/content";

type Row = { key: string; label: string; videos: Video[] };

function ReelRow({ label, videos, direction }: { label: string; videos: Video[]; direction: "left" | "right" }) {
  const { locale } = useLanguage();
  const [paused, setPaused] = useState(false);
  // Doubled so translateX(-50%) loops seamlessly regardless of row length.
  const doubled = [...videos, ...videos];

  return (
    <div>
      <p className="mb-3 px-6 text-[11px] uppercase tracking-[0.3em] text-zinc-500 sm:px-10">
        {label}
      </p>
      <div
        className="overflow-hidden py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex w-max gap-3 sm:gap-4"
          style={{
            animation: `video-reel-${direction} 34s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {doubled.map((video, i) => (
            <Link
              key={`${video.id}-${i}`}
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
      <style>{`
        @keyframes video-reel-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes video-reel-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <PageHeading>{t.videoWork.heading}</PageHeading>

      <div className="mt-10 flex flex-col gap-10 sm:gap-14">
        {rows.map((row, i) => (
          <ReelRow
            key={row.key}
            label={row.label || (locale === "zh" ? "未命名" : "Untitled")}
            videos={row.videos}
            direction={i % 2 === 0 ? "left" : "right"}
          />
        ))}
      </div>
    </div>
  );
}
