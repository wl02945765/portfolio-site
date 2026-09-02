"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import type { Video } from "@/lib/content";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const videoReveal: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export function VideoDetail({ video }: { video: Video }) {
  const { t, locale } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [infosOpen, setInfosOpen] = useState(false);
  const [speed, setSpeed] = useState(1);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  function cycleSpeed() {
    const el = videoRef.current;
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (el) el.playbackRate = next;
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * el.duration;
  }

  function handleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen().catch(() => {});
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <Link
        href="/video-work"
        className="sticky top-[57px] z-30 mb-8 inline-block w-fit rounded-full bg-black/80 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-zinc-400 backdrop-blur-sm hover:text-zinc-200"
      >
        ← {t.videoWork.backToList}
      </Link>

      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div
          ref={containerRef}
          variants={videoReveal}
          className="group relative w-full select-none overflow-hidden bg-black"
        >
          <video
            ref={videoRef}
            src={withBasePath(video.videoSrc)}
            poster={withBasePath(video.thumbnail)}
            playsInline
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) setProgress(el.currentTime / el.duration);
            }}
            className="aspect-video w-full cursor-pointer bg-black"
          />

          {/* Centered play button, fades out once playing — click anywhere to toggle */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/40 transition-transform duration-200 hover:scale-110">
              <div className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
            </div>
          </button>

          {/* Bottom control bar: progress + play/pause + speed + text buttons */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
            <div
              onClick={handleProgressClick}
              className="mb-3 h-[2px] w-full cursor-pointer bg-white/25"
            >
              <div
                className="h-full bg-white"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-4 w-4 items-center justify-center text-zinc-300 hover:text-white"
                >
                  {isPlaying ? (
                    <div className="flex gap-[3px]">
                      <div className="h-3.5 w-[3px] bg-current" />
                      <div className="h-3.5 w-[3px] bg-current" />
                    </div>
                  ) : (
                    <div className="h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-current" />
                  )}
                </button>
                <button
                  onClick={cycleSpeed}
                  className="text-[11px] uppercase tracking-[0.15em] text-zinc-300 hover:text-white"
                >
                  {speed}x
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleFullscreen}
                  className="text-[11px] uppercase tracking-[0.15em] text-zinc-300 hover:text-white"
                >
                  Fullscreen
                </button>
                <button
                  onClick={() => setInfosOpen(true)}
                  className="text-[11px] uppercase tracking-[0.15em] text-zinc-300 hover:text-white"
                >
                  Infos
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
        >
          <h1 className="heading-font text-xl font-medium uppercase tracking-[0.06em]">
            {video.title[locale]}
          </h1>
          {video.year && (
            <span className="text-xs tracking-wide text-zinc-500">{video.year}</span>
          )}
        </motion.div>
        <motion.p variants={fadeUp} className="mt-2 text-sm tracking-wide text-zinc-400">
          {video.services[locale]}
        </motion.p>
      </motion.div>

      {/* Infos popin */}
      <AnimatePresence>
        {infosOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center"
            onClick={() => setInfosOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md border border-white/10 bg-black p-8 sm:p-10"
            >
              <button
                onClick={() => setInfosOpen(false)}
                className="mb-6 block text-[11px] uppercase tracking-[0.15em] text-zinc-500 hover:text-white"
              >
                Close
              </button>
              <h2 className="heading-font text-lg uppercase tracking-[0.06em]">
                {video.title[locale]}
              </h2>
              <p className="mt-3 text-sm leading-relaxed tracking-wide text-zinc-400">
                {video.services[locale]}
              </p>
              {video.year && (
                <p className="mt-4 text-xs tracking-wide text-zinc-600">{video.year}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
