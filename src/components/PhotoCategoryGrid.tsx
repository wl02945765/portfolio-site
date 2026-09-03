"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { Photo } from "@/lib/content";

export function PhotoCategoryGrid({ photos }: { photos: Photo[] }) {
  const { locale } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
        {photos.map((photo, i) => {
          // Pointer Events, not mouse events — mobile has no hover concept,
          // so onMouseMove never fired there at all. pointermove covers mouse
          // hover AND a finger actively dragging across the tile with the
          // same handler: touch only ever sends pointermove while in contact,
          // which is exactly the "drag to scrub" behavior mobile needs.
          const onWipeDown = (e: React.PointerEvent<HTMLButtonElement>) => {
            // Some mobile browsers have incomplete/buggy Pointer Events
            // support — never let capturing the pointer be a way to crash
            // the tile's whole click handler if it throws.
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // ignore — the wipe still works without capture, just less
              // robust right at the tile's edges
            }
          };
          const onWipeMove = (e: React.PointerEvent<HTMLButtonElement>) => {
            const afterLayer = e.currentTarget.querySelector<HTMLElement>('[data-role="after-layer"]');
            const wipeLine = e.currentTarget.querySelector<HTMLElement>('[data-role="wipe-line"]');
            if (!afterLayer) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            afterLayer.style.clipPath = `inset(0 0 0 ${pct}%)`;
            if (wipeLine) wipeLine.style.left = `${pct}%`;
          };
          const onWipeLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
            const afterLayer = e.currentTarget.querySelector<HTMLElement>('[data-role="after-layer"]');
            const wipeLine = e.currentTarget.querySelector<HTMLElement>('[data-role="wipe-line"]');
            if (!afterLayer) return;
            afterLayer.style.clipPath = "inset(0 0 0 50%)";
            if (wipeLine) wipeLine.style.left = "50%";
          };

          return (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(i)}
              onPointerDown={photo.beforeSrc ? onWipeDown : undefined}
              onPointerMove={photo.beforeSrc ? onWipeMove : undefined}
              onPointerLeave={photo.beforeSrc ? onWipeLeave : undefined}
              className={`group relative mb-3 block w-full break-inside-avoid overflow-hidden bg-black ${
                photo.beforeSrc ? "touch-pan-y" : ""
              }`}
            >
              {photo.beforeSrc ? (
                <div className="relative">
                  <Image
                    src={withBasePath(photo.beforeSrc)}
                    alt={photo.caption[locale]}
                    width={photo.width || 800}
                    height={photo.height || 1000}
                    unoptimized
                    priority={i < 4}
                    className="h-auto w-full object-cover"
                  />
                  <img
                    src={withBasePath(photo.thumbSrc || photo.src)}
                    alt=""
                    data-role="after-layer"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ clipPath: "inset(0 0 0 50%)" }}
                  />
                  <div
                    data-role="wipe-line"
                    className="pointer-events-none absolute inset-y-0 w-px bg-white/70"
                    style={{ left: "50%" }}
                  />
                  <span className="pointer-events-none absolute left-2 top-2 bg-black/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-zinc-300">
                    Before / After
                  </span>
                </div>
              ) : (
                <Image
                  src={withBasePath(photo.thumbSrc || photo.src)}
                  alt={photo.caption[locale]}
                  width={photo.width || 800}
                  height={photo.height || 1000}
                  unoptimized
                  priority={i < 4}
                  className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}
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
