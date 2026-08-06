"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import type { Video, VideoCategory } from "@/lib/content";

type Row = { key: string; label: string; videos: Video[] };

// Constant px/sec so a row of 3 videos and a row of 30 feel the same
// instead of one crawling and one racing.
const REEL_SPEED_PX_PER_SEC = 45;

function ReelRow({ label, videos, direction }: { label: string; videos: Video[]; direction: "left" | "right" }) {
  const { locale } = useLanguage();
  const [paused, setPaused] = useState(false);
  // null until measured, so we don't flash an animation sized for a 0-width track.
  const [sizes, setSizes] = useState<{ viewport: number; track: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function measure() {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;
      setSizes({ viewport: viewport.clientWidth, track: track.scrollWidth });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [videos]);

  // The row always keeps moving, one direction, single (non-duplicated) set
  // of videos: it sweeps fully off one edge before reappearing at the other,
  // so the wrap happens while nothing is on screen — no visible jump, and no
  // video tile ever appears twice at once. Looping the whole set again is
  // fine; showing two copies side by side at the same time is not.
  const travel = sizes ? sizes.viewport + sizes.track : 0;
  const duration = travel > 0 ? Math.max(travel / REEL_SPEED_PX_PER_SEC, 6) : 0;

  return (
    <div>
      <p className="mb-3 px-6 text-[11px] uppercase tracking-[0.3em] text-zinc-500 sm:px-10">
        {label}
      </p>
      <div
        ref={viewportRef}
        className="overflow-hidden py-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-3 sm:gap-4"
          style={
            sizes
              ? ({
                  "--reel-viewport": `${sizes.viewport}px`,
                  "--reel-track": `${sizes.track}px`,
                  animation: `video-reel-${direction} ${duration}s linear infinite`,
                  animationPlayState: paused ? "paused" : "running",
                } as React.CSSProperties)
              : undefined
          }
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
      <style>{`
        @keyframes video-reel-left {
          from { transform: translateX(var(--reel-viewport, 0px)); }
          to { transform: translateX(calc(-1 * var(--reel-track, 0px))); }
        }
        @keyframes video-reel-right {
          from { transform: translateX(calc(-1 * var(--reel-track, 0px))); }
          to { transform: translateX(var(--reel-viewport, 0px)); }
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
