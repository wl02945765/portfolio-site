"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { LocalizedText } from "@/lib/content";

type StripPhoto = {
  id: string;
  src: string;
  thumbSrc?: string;
  caption: LocalizedText;
};

// Every strip is visible the moment the page loads — this is one full-width
// row, not a scrolling grid, so there's no "below the fold" to lazy-load
// against. fetchPriority="high" on every tile was fine for the handful of
// photos this was designed around, but once the set grew into the hundreds,
// marking all of them "highest priority" at once (each still a fairly large
// file) was enough simultaneous network+memory pressure to crash the tab
// outright on mobile Safari. Only the first few — the ones a visitor's eye
// actually lands on first — get the aggressive hint; the rest still load
// eagerly, just without fighting each other for priority.
const HIGH_PRIORITY_COUNT = 8;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function PhotoStripCurtain({ photos }: { photos: StripPhoto[] }) {
  const { locale } = useLanguage();
  const [hoveredStrip, setHoveredStrip] = useState<number | null>(null);

  if (photos.length === 0) return null;

  // One strip per uploaded photo — never repeated. Gets denser purely as
  // more photos get uploaded, not by cycling the same ones multiple times.
  const strips = photos.map((photo, i) => ({
    photo,
    // object-position, not backgroundPositionX — see the <img> note below.
    objectPositionX: `${Math.round(pseudoRandom(i + 1) * 100)}%`,
  }));

  const hoveredPhoto = hoveredStrip !== null ? strips[hoveredStrip].photo : null;

  return (
    <section className="relative h-[65vh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 flex">
        {strips.map((strip, i) => {
          const isHovered = i === hoveredStrip;
          return (
            <div
              key={i}
              className="relative h-full flex flex-col items-center justify-center bg-black"
              style={{
                flex: isHovered ? "0 0 clamp(280px, 42vw, 640px)" : "1 1 0%",
                transition: "flex-basis 450ms ease, flex-grow 450ms ease",
              }}
              onMouseEnter={() => setHoveredStrip(i)}
              onMouseLeave={() => setHoveredStrip(null)}
            >
              {/* Real <img>, not a CSS background-image — the browser's preload
                  scanner only discovers <img src> while parsing the raw HTML;
                  background-image is discovered later, after CSS/layout, which
                  is what made this strip visibly pop in after the page had
                  already loaded. */}
              <img
                src={withBasePath(strip.photo.thumbSrc || strip.photo.src)}
                alt=""
                loading="eager"
                fetchPriority={i < HIGH_PRIORITY_COUNT ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: `${strip.objectPositionX} center`,
                  opacity: isHovered ? 0 : 1,
                  transition: "opacity 300ms ease",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10"
                style={{ opacity: isHovered ? 1 : 0, transition: "opacity 300ms ease 150ms" }}
              >
                <img
                  src={withBasePath(strip.photo.thumbSrc || strip.photo.src)}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="h-full w-full max-w-none object-contain"
                />
                <p className="mt-4 shrink-0 text-xs tracking-wide text-zinc-300">
                  {strip.photo.caption[locale]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300"
        style={{ opacity: hoveredPhoto ? 0 : 1 }}
      >
        <div className="rounded-full border border-white/30 bg-black/70 px-5 py-4 text-center backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-200">
            Ching&apos;s
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-200">
            Profile
          </p>
        </div>
      </div>
    </section>
  );
}
