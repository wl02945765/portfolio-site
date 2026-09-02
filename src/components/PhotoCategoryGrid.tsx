"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import justifiedLayout from "justified-layout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { Photo } from "@/lib/content";

const TARGET_ROW_HEIGHT = 260;
const BOX_SPACING = 12;

export function PhotoCategoryGrid({ photos }: { photos: Photo[] }) {
  const { locale } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (containerWidth === 0 || photos.length === 0) return null;
    return justifiedLayout(
      photos.map((p) => ({ width: p.width || 800, height: p.height || 1000 })),
      {
        containerWidth,
        targetRowHeight: TARGET_ROW_HEIGHT,
        boxSpacing: BOX_SPACING,
        containerPadding: 0,
      },
    );
  }, [photos, containerWidth]);

  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  const showNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, photos.length]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: layout ? layout.containerHeight : undefined }}
      >
        {layout &&
          photos.map((photo, i) => {
            const box = layout.boxes[i];
            return (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(i)}
                className="group absolute overflow-hidden bg-black"
                style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
              >
                <Image
                  src={withBasePath(photo.src)}
                  alt={photo.caption[locale]}
                  width={photo.width || 800}
                  height={photo.height || 1000}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-zinc-200 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.caption[locale]}
                </span>
              </button>
            );
          })}
      </div>

      {lightboxIndex !== null && photos[lightboxIndex] && (
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
              src={withBasePath(photos[lightboxIndex].src)}
              alt={photos[lightboxIndex].caption[locale]}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[80vh] w-auto object-contain"
            />
            <p className="mt-4 text-xs tracking-wide text-zinc-400">
              {photos[lightboxIndex].caption[locale]}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
