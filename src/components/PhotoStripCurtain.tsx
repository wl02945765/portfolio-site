"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { Photo } from "@/lib/content";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function PhotoStripCurtain({ photos }: { photos: Photo[] }) {
  const { locale } = useLanguage();
  const [hoveredStrip, setHoveredStrip] = useState<number | null>(null);

  if (photos.length === 0) return null;

  // One strip per uploaded photo — never repeated. Gets denser purely as
  // more photos get uploaded, not by cycling the same ones multiple times.
  const strips = photos.map((photo, i) => ({
    photo,
    positionX: `${Math.round(pseudoRandom(i + 1) * 100)}%`,
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
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${withBasePath(strip.photo.src)})`,
                  backgroundSize: "auto 100%",
                  backgroundPositionX: strip.positionX,
                  backgroundPositionY: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: isHovered ? 0 : 1,
                  transition: "opacity 300ms ease",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10"
                style={{ opacity: isHovered ? 1 : 0, transition: "opacity 300ms ease 150ms" }}
              >
                <div
                  className="h-full w-full max-w-none"
                  style={{
                    backgroundImage: `url(${withBasePath(strip.photo.src)})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
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
