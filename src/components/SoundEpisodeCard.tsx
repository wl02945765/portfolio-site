"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import { AudioCompareToggle } from "@/components/AudioCompareToggle";
import type { SoundEpisode } from "@/lib/content";

export function SoundEpisodeCard({ episode, channelNumber }: { episode: SoundEpisode; channelNumber: number }) {
  const { locale } = useLanguage();
  const title = episode.title[locale];
  const description = episode.description?.[locale];
  const hasCompare = Boolean(episode.compare?.rawSrc && episode.compare?.mixedSrc);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  return (
    <div className="border border-white/10 bg-black">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-500">
          CH.{String(channelNumber).padStart(2, "0")} {title}
        </span>
        <span className="flex items-center gap-2 bg-red-600 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          ON AIR
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {episode.youtubeId && (
          <div className="relative mb-4 aspect-video overflow-hidden border border-zinc-700 bg-black">
            <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 h-3 w-3 border-l-2 border-t-2 border-zinc-500" />
            <span className="pointer-events-none absolute bottom-1.5 right-1.5 z-10 h-3 w-3 border-b-2 border-r-2 border-zinc-500" />
            {/* A YouTube embed pulls in ~1MB of player script and keeps it
                running whether or not anyone presses play; with one per
                episode that added up. Show the thumbnail until clicked. */}
            {playerLoaded ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${episode.youtubeId}?modestbranding=1&rel=0&autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayerLoaded(true)}
                aria-label={title}
                className="group absolute inset-0 h-full w-full"
              >
                <img
                  src={`https://i.ytimg.com/vi/${episode.youtubeId}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600/90 transition-transform group-hover:scale-110">
                  <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-white" />
                </span>
              </button>
            )}
          </div>
        )}

        {description && (
          <p className="mb-4 whitespace-pre-line text-sm leading-7 text-zinc-400">{description}</p>
        )}

        {episode.audioSrc && (
          <audio controls preload="metadata" src={withBasePath(episode.audioSrc)} className="mb-4 w-full" />
        )}

        {hasCompare && (
          <AudioCompareToggle
            rawSrc={episode.compare!.rawSrc}
            mixedSrc={episode.compare!.mixedSrc}
            rawLabel={locale === "zh" ? "未混音" : "Raw"}
            mixedLabel={locale === "zh" ? "混音後" : "Mixed"}
          />
        )}
      </div>
    </div>
  );
}
