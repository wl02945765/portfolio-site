"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import { SoundEpisodeCard } from "@/components/SoundEpisodeCard";
import type { Sound, SoundEpisode } from "@/lib/content";

// Per-bar animation offsets so the two meters never move in lockstep.
const METER_DELAYS = [
  [0.1, 0.5, 0.3, 0.8, 0.2, 0.6, 0.9, 0.4, 0.7, 1.0, 0.15],
  [0.6, 0.2, 0.9, 0.4, 0.7, 0.1, 0.5, 0.85, 0.3, 0.65, 0.95],
];

// Bars 1–6 idle grey, 7–9 gold, 10–11 peak red — same reading as a real VU meter.
function barColor(i: number) {
  if (i >= 9) return "bg-red-600";
  if (i >= 6) return "bg-[#c9a66b]";
  return "bg-zinc-700";
}

// The admin textarea keeps stray leading spaces and runs of blank lines;
// tidy them so paragraphs read as paragraphs.
function tidyText(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function VuMeter({ delays, label }: { delays: number[]; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-9 items-end gap-[3px]" aria-hidden>
        {delays.map((d, i) => (
          <span key={i} className={`vu-bar flex-1 ${barColor(i)}`} style={{ animationDelay: `-${d}s` }} />
        ))}
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">{label}</span>
    </div>
  );
}

function Channel({
  index,
  label,
  value,
  wide,
}: {
  index: number;
  label: string;
  value: string;
  wide?: boolean;
}) {
  // A long list (e.g. role: "現場錄音、音效、混音後製…") reads better as tags across a full row.
  const items = wide ? value.split(/[、,，]/).map((v) => v.trim()).filter(Boolean) : [];
  return (
    <div
      className={`flex min-w-0 flex-col gap-1.5 border-b border-r border-white/10 px-4 py-3.5 ${wide ? "sm:col-span-2" : ""}`}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500">
        CH {index} · {label}
      </span>
      {wide ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-[13px] text-zinc-200">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-sm leading-6 text-zinc-100">{value}</span>
      )}
    </div>
  );
}

export function SoundContent({ sound, episodes }: { sound: Sound; episodes: SoundEpisode[] }) {
  const { t, locale } = useLanguage();
  const otherLocale = locale === "zh" ? "en" : "zh";
  const showName = sound.showName[locale];
  const altName = sound.showName[otherLocale];
  const showDescription = tidyText(sound.showDescription[locale] ?? "");
  const role = sound.role[locale]?.trim();
  const genre = sound.genre?.[locale];
  const hosts = sound.hosts?.[locale];

  const channels = [
    genre && { label: t.sound.genreLabel, value: genre, wide: false },
    hosts && { label: t.sound.hostsLabel, value: hosts, wide: false },
    role && { label: t.sound.roleHeading, value: role, wide: true },
  ].filter((c): c is { label: string; value: string; wide: boolean } => Boolean(c));
  const paragraphs = showDescription ? showDescription.split("\n\n") : [];

  return (
    <div className="flex flex-1 flex-col pb-24">
      <PageHeading>{t.sound.heading}</PageHeading>

      <div className="mt-10 px-6 sm:px-10">
        <div className="border border-white/10 bg-black">
          {/* Top bar — same header language as the episode cards below */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-500">
              MASTER · {showName}
              {altName && altName !== showName ? ` ${altName}` : ""}
            </span>
            <span className="flex items-center gap-2 bg-red-600 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              ON AIR
            </span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            {/* Left: cover + meters */}
            <div className="grid content-start gap-5 border-b border-white/10 p-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-end lg:grid-cols-1 lg:border-b-0 lg:border-r">
              {sound.coverImage && (
                <img
                  src={withBasePath(sound.coverImage)}
                  alt={showName}
                  className="aspect-square w-full bg-black object-cover"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <VuMeter delays={METER_DELAYS[0]} label="L" />
                <VuMeter delays={METER_DELAYS[1]} label="R" />
              </div>
            </div>

            {/* Right: title, channel strip, description, links */}
            <div className="flex flex-col gap-7 p-6 sm:p-9">
              <div>
                {showName && (
                  <h2 className="heading-font text-4xl font-medium tracking-[0.06em] text-zinc-100 sm:text-5xl">
                    {showName}
                  </h2>
                )}
                {altName && altName !== showName && (
                  <p className="heading-font mt-1 text-xl italic text-zinc-500">{altName}</p>
                )}
              </div>

              {channels.length > 0 && (
                <div className="grid grid-cols-1 border-l border-t border-white/10 sm:grid-cols-2">
                  {channels.map((c, i) => (
                    <Channel key={c.label} index={i + 1} label={c.label} value={c.value} wide={c.wide} />
                  ))}
                </div>
              )}

              {paragraphs.length > 0 && (
                <div className="flex max-w-2xl flex-col gap-4">
                  {paragraphs.map((para, i) => (
                    <p
                      key={i}
                      className={`whitespace-pre-line text-[15px] leading-7 tracking-wide ${i === 0 ? "text-zinc-200" : "text-zinc-400"}`}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {sound.links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {sound.links.map((link, i) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-full border px-7 py-3 text-[11px] font-medium uppercase tracking-[0.15em] transition-colors ${
                        i === 0
                          ? "border-zinc-300 bg-zinc-300 text-black hover:bg-transparent hover:text-zinc-300"
                          : "border-zinc-500 text-zinc-300 hover:bg-zinc-300 hover:text-black"
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {episodes.length > 0 && (
        <div className="mt-16 flex flex-col gap-6 px-6 sm:px-10">
          {episodes.map((episode, i) => (
            <SoundEpisodeCard key={episode.id} episode={episode} channelNumber={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
