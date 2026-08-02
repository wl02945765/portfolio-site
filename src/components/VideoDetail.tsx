"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Video } from "@/lib/content";

export function VideoDetail({ video }: { video: Video }) {
  const { t, locale } = useLanguage();

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <Link
        href="/video-work"
        className="mb-8 inline-block w-fit text-[11px] uppercase tracking-[0.15em] text-black/45 hover:text-black"
      >
        ← {t.videoWork.backToList}
      </Link>

      <video
        src={video.videoSrc}
        poster={video.thumbnail}
        controls
        playsInline
        className="w-full bg-black"
      />

      <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-xl font-semibold uppercase tracking-[0.06em]">
          {video.title[locale]}
        </h1>
        {video.year && (
          <span className="text-xs tracking-wide text-black/40">{video.year}</span>
        )}
      </div>
      <p className="mt-2 text-sm tracking-wide text-black/60">
        {video.services[locale]}
      </p>
    </div>
  );
}
