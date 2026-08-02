"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { Photo } from "@/lib/content";

const EXPANDED_WIDTH = 45; // percent

export function PhotoStripCurtain({ photos }: { photos: Photo[] }) {
  const { locale } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const restWidth =
    hoveredIndex === null
      ? 100 / photos.length
      : (100 - EXPANDED_WIDTH) / (photos.length - 1 || 1);

  return (
    <section className="relative flex h-[65vh] w-full items-stretch justify-center overflow-hidden bg-black">
      {photos.map((photo, i) => {
        const isHovered = hoveredIndex === i;
        const width = hoveredIndex === null ? 100 / photos.length : isHovered ? EXPANDED_WIDTH : restWidth;

        return (
          <div
            key={photo.id}
            className="relative h-full overflow-hidden transition-[width] duration-500 ease-out"
            style={{ width: `${width}%` }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-out"
              style={{
                backgroundImage: `url(${withBasePath(photo.src)})`,
                opacity: isHovered ? 1 : 0,
              }}
            />
            {isHovered && (
              <span className="absolute bottom-4 left-4 text-xs tracking-wide text-zinc-200">
                {photo.caption[locale]}
              </span>
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full border border-white/30 bg-black/70 px-5 py-4 text-center backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: hoveredIndex === null ? 1 : 0 }}
        >
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
