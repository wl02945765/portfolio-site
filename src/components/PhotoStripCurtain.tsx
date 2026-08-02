"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { Photo } from "@/lib/content";

const STRIP_COUNT = 100;
const CYCLE_MS = 4500;

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function PhotoStripCurtain({ photos }: { photos: Photo[] }) {
  const { locale } = useLanguage();
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      setRevealOpen((open) => {
        if (open) {
          setRevealIndex((i) => (i + 1) % photos.length);
        }
        return !open;
      });
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [photos.length]);

  const strips = Array.from({ length: STRIP_COUNT }, (_, i) => {
    const photo = photos[i % photos.length];
    const positionX = `${Math.round(pseudoRandom(i + 1) * 100)}%`;
    return { photo, positionX };
  });

  const revealPhoto = photos[revealIndex];

  return (
    <section className="relative h-[65vh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 flex">
        {strips.map((strip, i) => (
          <div
            key={i}
            className="h-full flex-1"
            style={{
              backgroundImage: `url(${withBasePath(strip.photo.src)})`,
              backgroundSize: "auto 100%",
              backgroundPositionX: strip.positionX,
              backgroundPositionY: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>

      {revealPhoto && (
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-out"
          style={{ opacity: revealOpen ? 1 : 0 }}
        >
          <div
            className="h-[62%] w-[42%] min-w-[220px] bg-black shadow-2xl transition-transform duration-1000 ease-out"
            style={{
              backgroundImage: `url(${withBasePath(revealPhoto.src)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: revealOpen ? "scale(1)" : "scale(0.92)",
            }}
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full border border-white/30 bg-black/70 px-5 py-4 text-center backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-200">
            Ching&apos;s
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-200">
            Profile
          </p>
        </div>
      </div>

      {revealPhoto && (
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs tracking-wide text-zinc-300 transition-opacity duration-700"
          style={{ opacity: revealOpen ? 1 : 0 }}
        >
          {revealPhoto.caption[locale]}
        </div>
      )}
    </section>
  );
}
