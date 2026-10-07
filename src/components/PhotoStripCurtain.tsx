"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { LocalizedText } from "@/lib/content";

type StripPhoto = {
  id: string;
  src: string;
  thumbSrc?: string;
  miniSrc?: string;
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

// After the page has finished loading, the resting strips quietly swap their
// small mini copies for the sharp strip copies, a couple at a time at low
// priority, so they stop looking soft without competing with anything the
// visitor is waiting on. Desktop only: on a phone each strip is a few pixels
// wide (the mini copy is already plenty), and decoding 60+ larger images is
// exactly the memory pressure that used to crash mobile Safari.
const UPGRADE_CONCURRENCY = 2;
const UPGRADE_FLUSH_EVERY = 6;
const UPGRADE_MEDIA_QUERY = "(hover: hover) and (min-width: 1024px)";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function PhotoStripCurtain({ photos }: { photos: StripPhoto[] }) {
  const { locale } = useLanguage();
  const [hoveredStrip, setHoveredStrip] = useState<number | null>(null);
  // Strips that have been opened at least once. The expanded, larger copy is
  // only requested for these — loading it for all strips up front is what
  // made this row so heavy — and it stays mounted afterwards so re-opening
  // the same strip doesn't flash.
  const [openedStrips, setOpenedStrips] = useState<Set<number>>(() => new Set());
  const [sharpStrips, setSharpStrips] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (!window.matchMedia(UPGRADE_MEDIA_QUERY).matches) return;
    let cancelled = false;
    const queue = photos
      .map((photo, i) => ({ i, src: photo.miniSrc && photo.thumbSrc ? withBasePath(photo.thumbSrc) : null }))
      .filter((item): item is { i: number; src: string } => item.src !== null);
    const done: number[] = [];

    const flush = () => {
      if (cancelled || done.length === 0) return;
      const batch = done.splice(0);
      setSharpStrips((prev) => {
        const next = new Set(prev);
        batch.forEach((i) => next.add(i));
        return next;
      });
    };

    const loadNext = (): Promise<void> => {
      const item = queue.shift();
      if (!item || cancelled) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.fetchPriority = "low";
        img.decoding = "async";
        img.onload = () => {
          done.push(item.i);
          if (done.length >= UPGRADE_FLUSH_EVERY) flush();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = item.src;
      }).then(loadNext);
    };

    const start = () => {
      if (cancelled) return;
      Promise.all(Array.from({ length: UPGRADE_CONCURRENCY }, loadNext)).then(flush);
    };
    // Safari has no requestIdleCallback.
    const kickoff = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(start, { timeout: 3000 });
      else setTimeout(start, 1000);
    };

    if (document.readyState === "complete") kickoff();
    else window.addEventListener("load", kickoff, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", kickoff);
    };
  }, [photos]);
  const containerRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return null;

  // A finger can't land on one specific strip out of dozens crammed edge to
  // edge — dragging anywhere across the row is the whole point. This maps
  // the pointer's x position to a strip by its original equal share of the
  // row's width, not by hit-testing the (already-expanded, unevenly sized)
  // DOM elements, so it stays accurate as strips animate open and closed
  // underneath the finger.
  function updateHoverFromClientX(clientX: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const index = Math.min(photos.length - 1, Math.floor(ratio * photos.length));
    setHoveredStrip(index);
    setOpenedStrips((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  }

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
      <div
        ref={containerRef}
        className="absolute inset-0 flex touch-pan-y select-none"
        onPointerDown={(e) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // best-effort — the scrub still works without capture
          }
          updateHoverFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          // Buttons/pressure is 0 for a mouse that's merely passing over
          // without a button held — still fine to react to, since this row
          // has nothing else to scroll or click underneath it. A touch
          // point only ever sends pointermove while in contact, so this one
          // handler naturally covers both hover (mouse) and drag (touch).
          updateHoverFromClientX(e.clientX);
        }}
        onPointerLeave={() => setHoveredStrip(null)}
      >
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
            >
              {/* Real <img>, not a CSS background-image — the browser's preload
                  scanner only discovers <img src> while parsing the raw HTML;
                  background-image is discovered later, after CSS/layout, which
                  is what made this strip visibly pop in after the page had
                  already loaded. */}
              <img
                src={withBasePath(
                  (sharpStrips.has(i) ? strip.photo.thumbSrc : strip.photo.miniSrc) ||
                    strip.photo.thumbSrc ||
                    strip.photo.src,
                )}
                alt=""
                loading="eager"
                fetchPriority={i < HIGH_PRIORITY_COUNT ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: `${strip.objectPositionX} center`,
                  opacity: isHovered ? 0 : 1,
                  transition: "opacity 300ms ease",
                  WebkitTouchCallout: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }}
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
              <div
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-10"
                style={{ opacity: isHovered ? 1 : 0, transition: "opacity 300ms ease 150ms" }}
              >
                {openedStrips.has(i) && (
                <img
                  src={withBasePath(strip.photo.thumbSrc || strip.photo.src)}
                  alt=""
                  decoding="async"
                  className="h-full w-full max-w-none bg-contain bg-center bg-no-repeat object-contain"
                  // The sharper strip copy only starts downloading once the
                  // strip opens, and on a slow connection that left the opened
                  // strip blank for seconds. The mini copy is already loaded
                  // (it's the resting strip), so paint it underneath as a
                  // placeholder until the sharp one arrives.
                  style={
                    strip.photo.miniSrc
                      ? { backgroundImage: `url(${withBasePath(strip.photo.miniSrc)})`, WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }
                      : { WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }
                  }
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
                )}
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
            Touch me
          </p>
        </div>
      </div>
    </section>
  );
}
