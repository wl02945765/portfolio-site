"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import { AudioCompareToggle } from "@/components/AudioCompareToggle";
import type { SoundEpisode } from "@/lib/content";

export function SoundEpisodeCard({ episode, channelNumber }: { episode: SoundEpisode; channelNumber: number }) {
  const { locale } = useLanguage();
  const title = episode.title[locale];
  const description = episode.description?.[locale];
  const hasCompare = Boolean(episode.compare?.rawSrc && episode.compare?.mixedSrc);

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
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${episode.youtubeId}?modestbranding=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
            />
          </div>
        )}

        {description && (
          <p className="mb-4 whitespace-pre-line text-sm leading-7 text-zinc-400">{description}</p>
        )}

        {episode.audioSrc && (
          <audio controls src={withBasePath(episode.audioSrc)} className="mb-4 w-full" />
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
