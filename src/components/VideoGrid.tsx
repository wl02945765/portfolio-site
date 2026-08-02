"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import type { Video } from "@/lib/content";

const HIGHLIGHT_SECONDS = 10;

function VideoCard({ video }: { video: Video }) {
  const { locale } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Link
      href={`/video-work/${video.slug}`}
      className="group relative block aspect-video w-full overflow-hidden bg-black"
      onMouseEnter={() => {
        const el = videoRef.current;
        if (!el) return;
        el.currentTime = 0;
        el.play().catch(() => {});
      }}
      onMouseLeave={() => {
        const el = videoRef.current;
        if (!el) return;
        el.pause();
        el.currentTime = 0;
      }}
    >
      <img
        src={withBasePath(video.thumbnail)}
        alt={video.title[locale]}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
      />
      <video
        ref={videoRef}
        src={withBasePath(video.videoSrc)}
        muted
        loop
        playsInline
        preload="none"
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime > HIGHLIGHT_SECONDS) {
            e.currentTarget.currentTime = 0;
          }
        }}
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-sm font-medium uppercase tracking-[0.08em] text-zinc-200">
          {video.title[locale]}
        </p>
        <p className="mt-1 text-[11px] tracking-wide text-zinc-400">
          {video.services[locale]}
        </p>
      </div>
    </Link>
  );
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  const { t } = useLanguage();

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

  return (
    <div className="px-6 pb-24 sm:px-10">
      <PageHeading>{t.videoWork.heading}</PageHeading>
      <div className="mt-10 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
