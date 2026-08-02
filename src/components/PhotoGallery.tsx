"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { withBasePath } from "@/lib/basePath";
import type { Photo } from "@/lib/content";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const { t, locale } = useLanguage();
  const [category, setCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set(photos.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [photos]);

  const filtered = useMemo(
    () =>
      category === "all" ? photos : photos.filter((p) => p.category === category),
    [photos, category],
  );

  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + filtered.length) % filtered.length,
    );
  const showNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, filtered.length]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeading>{t.photography.heading}</PageHeading>
        <div className="flex flex-1 items-center justify-center px-6 py-32 text-sm tracking-wide text-zinc-500">
          {t.photography.empty}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-24 sm:px-10">
      <PageHeading>{t.photography.heading}</PageHeading>
      {categories.length > 1 && (
        <div className="mb-8 mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => setCategory("all")}
            className={`text-[11px] uppercase tracking-[0.15em] ${
              category === "all" ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {t.photography.allCategory}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-[11px] uppercase tracking-[0.15em] ${
                category === c ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
        {filtered.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="group relative mb-3 block aspect-[4/5] w-full break-inside-avoid overflow-hidden bg-black"
          >
            <Image
              src={withBasePath(photo.src)}
              alt={photo.caption[locale]}
              width={800}
              height={1000}
              unoptimized
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black transition-opacity duration-500 ease-out group-hover:opacity-0" />
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-zinc-200 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {photo.caption[locale]}
            </span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute right-6 top-6 text-2xl text-zinc-400 hover:text-zinc-200"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-8 text-3xl text-zinc-400 hover:text-zinc-200 sm:left-6"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-8 text-3xl text-zinc-400 hover:text-zinc-200 sm:right-6"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next"
          >
            ›
          </button>

          <div
            className="relative flex max-h-[85vh] max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={withBasePath(filtered[lightboxIndex].src)}
              alt={filtered[lightboxIndex].caption[locale]}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[80vh] w-auto object-contain"
            />
            <p className="mt-4 text-xs tracking-wide text-zinc-400">
              {filtered[lightboxIndex].caption[locale]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
