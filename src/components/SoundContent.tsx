"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import { SoundEpisodeCard } from "@/components/SoundEpisodeCard";
import type { Sound, SoundEpisode } from "@/lib/content";

export function SoundContent({ sound, episodes }: { sound: Sound; episodes: SoundEpisode[] }) {
  const { t, locale } = useLanguage();
  const showName = sound.showName[locale];
  const showDescription = sound.showDescription[locale];
  const role = sound.role[locale];

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 sm:px-10">
      <PageHeading>{t.sound.heading}</PageHeading>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        {sound.coverImage && (
          <img
            src={withBasePath(sound.coverImage)}
            alt={showName}
            className="aspect-square w-full max-w-sm rounded-sm object-cover lg:w-80 lg:shrink-0"
          />
        )}

        <div className="flex flex-col gap-8">
          {showName && (
            <h2 className="heading-font text-2xl font-medium tracking-[0.04em] text-zinc-200 sm:text-3xl">
              {showName}
            </h2>
          )}

          {showDescription && (
            <p className="max-w-xl whitespace-pre-line text-base leading-8 tracking-wide text-zinc-400">
              {showDescription}
            </p>
          )}

          {role && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                {t.sound.roleHeading}
              </p>
              <p className="mt-2 max-w-xl whitespace-pre-line text-sm leading-7 text-zinc-400">{role}</p>
            </div>
          )}

          {sound.links.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                {t.sound.linksHeading}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {sound.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-zinc-500 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {episodes.length > 0 && (
        <div className="mt-16 flex flex-col gap-6">
          {episodes.map((episode, i) => (
            <SoundEpisodeCard key={episode.id} episode={episode} channelNumber={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
