"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import type { Video, VideoCategory } from "@/lib/content";

type Row = { key: string; label: string; videos: Video[] };

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

// A running elapsed-time readout, isolated in its own component so the
// once-a-second tick doesn't re-render the program monitor or the camera grid.
function OnAirClock() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <span className="font-mono text-[11px] tracking-[0.08em] text-zinc-300 sm:text-xs">
      {hh}:{mm}:{ss}
    </span>
  );
}

function CameraTile({
  video,
  camNumber,
  isOnAir,
  onSelect,
  locale,
}: {
  video: Video;
  camNumber: number;
  isOnAir: boolean;
  onSelect: () => void;
  locale: "zh" | "en";
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play().catch(() => {})}
      onMouseLeave={(e) => {
        const v = e.currentTarget.querySelector("video");
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      }}
      className={`group relative aspect-video overflow-hidden bg-black text-left outline outline-2 -outline-offset-2 transition-all duration-200 ${
        isOnAir ? "outline-red-600" : "outline-transparent hover:outline-zinc-500"
      }`}
    >
      <img
        src={withBasePath(video.thumbnail)}
        alt={video.title[locale]}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-200 ${
          isOnAir ? "brightness-100" : "brightness-75 saturate-[.85] group-hover:brightness-95 group-hover:saturate-100"
        }`}
      />
      {/* Hover-scrub preview only exists for uploaded files — a YouTube-backed
          video has no raw file to loop, so it just stays on the thumbnail. */}
      {video.videoSrc && (
        <video
          src={withBasePath(video.videoSrc)}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
      )}
      <span className="absolute left-1.5 top-1.5 bg-black/55 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.05em] text-zinc-200">
        CAM {camNumber}
      </span>
      <span
        className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${
          isOnAir ? "bg-red-600 shadow-[0_0_6px_2px_rgba(220,38,38,0.55)]" : "bg-zinc-600"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="truncate text-[11px] font-medium text-zinc-100">{video.title[locale]}</p>
      </div>
    </button>
  );
}

export function VisionMixerWall({ videos, categories }: { videos: Video[]; categories: VideoCategory[] }) {
  const { t, locale } = useLanguage();
  const [activeId, setActiveId] = useState<string | undefined>(videos[0]?.id);
  const pgmVideoRef = useRef<HTMLVideoElement>(null);

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

  const active = videos.find((v) => v.id === activeId) ?? videos[0];
  const rows = groupIntoRows(videos, categories, t.videoWork.uncategorized);

  // Cameras are numbered once, in on-screen order, continuing across category
  // banks — the way a real multi-camera truck numbers its feeds rather than
  // restarting per category.
  let camCounter = 0;
  const camNumbers = new Map<string, number>();
  for (const row of rows) {
    for (const video of row.videos) {
      camCounter += 1;
      camNumbers.set(video.id, camCounter);
    }
  }
  const activeCamNumber = camNumbers.get(active.id) ?? 1;

  return (
    <div className="pb-24">
      <PageHeading>{t.videoWork.heading}</PageHeading>

      <div className="mt-8 px-6 sm:px-10">
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          {active.youtubeId ? (
            // The PGM monitor's chrome (ON AIR badge, CAM label, title, watch
            // button) stays identical either way — YouTube is just this
            // shot's signal source, not a different kind of page section.
            <iframe
              key={active.id}
              src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${active.youtubeId}&controls=0&modestbranding=1&rel=0`}
              title={active.title[locale]}
              allow="autoplay; encrypted-media"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
            />
          ) : (
            <video
              key={active.id}
              ref={pgmVideoRef}
              src={withBasePath(active.videoSrc)}
              autoPlay
              muted
              loop
              playsInline
              poster={withBasePath(active.thumbnail)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent p-3 sm:p-4">
            <span className="flex items-center gap-2 bg-red-600 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              ON AIR
            </span>
            <OnAirClock />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/85 to-transparent p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">CAM {activeCamNumber}</p>
              <h2 className="heading-font mt-1 text-xl text-zinc-100 sm:text-2xl">{active.title[locale]}</h2>
              <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">{active.services[locale]}</p>
            </div>
            <Link
              href={`/video-work/${active.slug}`}
              className="shrink-0 border border-white/30 px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-100 transition-colors hover:border-white hover:bg-white/10"
            >
              {locale === "zh" ? "觀看完整版 ↗" : "Watch Full ↗"}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10 px-6 sm:gap-14 sm:px-10">
        {rows.map((row) => (
          <div key={row.key}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">{row.label}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {row.videos.map((video) => (
                <CameraTile
                  key={video.id}
                  video={video}
                  camNumber={camNumbers.get(video.id) ?? 0}
                  isOnAir={video.id === active.id}
                  onSelect={() => setActiveId(video.id)}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
