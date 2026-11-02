"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
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

// One selectable rendition. `id` is the hls.js level index, or the position in
// the parsed master playlist when the browser plays HLS natively (Safari).
type QualityOption = { id: number; height: number; uri?: string };
const AUTO_QUALITY = -1;

// Pulls the renditions (height + playlist URL) out of an HLS master playlist,
// lowest first — the same order hls.js reports its levels in.
function parseMasterPlaylist(text: string, masterUrl: string): QualityOption[] {
  const lines = text.split("\n").map((l) => l.trim());
  const found: { height: number; uri: string }[] = [];
  lines.forEach((line, i) => {
    const m = line.match(/^#EXT-X-STREAM-INF:.*RESOLUTION=\d+x(\d+)/);
    const uri = lines[i + 1];
    if (m && uri && !uri.startsWith("#")) found.push({ height: Number(m[1]), uri: new URL(uri, masterUrl).href });
  });
  return found.sort((a, b) => a.height - b.height).map((q, id) => ({ id, ...q }));
}

export function VideoDetail({ video }: { video: Video }) {
  const { t, locale } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [infosOpen, setInfosOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [quality, setQuality] = useState(AUTO_QUALITY);
  const [qualityOpen, setQualityOpen] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const masterUrlRef = useRef("");
  const resumeAtRef = useRef(0);
  const resumeHandlerRef = useRef<(() => void) | null>(null);

  function selectQuality(id: number) {
    const el = videoRef.current;
    setQuality(id);
    setQualityOpen(false);
    if (!el) return;
    const hls = hlsRef.current;
    if (hls) {
      // hls.js: -1 returns to automatic switching; otherwise pin that level.
      hls.currentLevel = id;
      return;
    }
    // Native HLS (Safari) has no level API, so load the chosen rendition's own
    // playlist (or the master again for Auto) and resume where we were.
    const target = id === AUTO_QUALITY ? masterUrlRef.current : qualities.find((q) => q.id === id)?.uri;
    if (!target) return;
    // The element is preload="none", so after a src swap nothing loads until
    // play() — if the visitor switches while paused, the position to resume at
    // must be remembered across several swaps (currentTime reads 0 by then).
    const resumeAt = el.readyState > 0 ? el.currentTime : resumeAtRef.current;
    const wasPlaying = !el.paused;
    resumeAtRef.current = resumeAt;
    if (resumeHandlerRef.current) el.removeEventListener("loadedmetadata", resumeHandlerRef.current);
    const onLoaded = () => {
      el.currentTime = resumeAtRef.current;
      resumeAtRef.current = 0;
      resumeHandlerRef.current = null;
    };
    resumeHandlerRef.current = onLoaded;
    el.addEventListener("loadedmetadata", onLoaded, { once: true });
    el.src = target;
    if (wasPlaying) el.play().catch(() => {});
  }

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

  const isExternal = Boolean(video.youtubeId);

  // Uploaded videos are adaptive HLS (1080p + 720p, ~4s segments): the live
  // site is on Cloudflare Pages, which caps single files at 25 MiB, and
  // segments also let a slow connection drop to 720p instead of stalling.
  // Safari plays HLS natively; elsewhere hls.js (loaded only on this page)
  // feeds the same <video>. Nothing is fetched until the visitor hits play.
  useEffect(() => {
    const el = videoRef.current;
    if (isExternal || !el || !video.videoSrc) return;
    const url = withBasePath(video.videoSrc);
    let cancelled = false;
    let destroy = () => {};
    if (!video.videoSrc.endsWith(".m3u8") || el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = url;
      if (video.videoSrc.endsWith(".m3u8")) {
        masterUrlRef.current = new URL(url, window.location.href).href;
        fetch(masterUrlRef.current)
          .then((r) => r.text())
          .then((text) => {
            if (!cancelled) setQualities(parseMasterPlaylist(text, masterUrlRef.current));
          })
          .catch(() => {});
      }
      return () => {
        cancelled = true;
      };
    }
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;
      if (!Hls.isSupported()) {
        el.src = url;
        return;
      }
      const hls = new Hls({ autoStartLoad: false, capLevelToPlayerSize: true });
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setQualities(hls.levels.map((l, id) => ({ id, height: l.height })));
      });
      hls.loadSource(url);
      hls.attachMedia(el);
      const start = () => hls.startLoad();
      el.addEventListener("play", start, { once: true });
      destroy = () => {
        el.removeEventListener("play", start);
        hls.destroy();
        hlsRef.current = null;
      };
    });
    return () => {
      cancelled = true;
      destroy();
    };
  }, [isExternal, video.videoSrc]);

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
          {isExternal ? (
            // YouTube's own iframe already ships scrub/speed/fullscreen
            // controls, so the custom bottom bar below is native-app-only.
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?modestbranding=1&rel=0`}
              title={video.title[locale]}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full bg-black"
              style={{ border: 0 }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                preload="none"
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
                    {qualities.length > 1 && (
                      <div className="relative">
                        <button
                          onClick={() => setQualityOpen((o) => !o)}
                          aria-haspopup="listbox"
                          aria-expanded={qualityOpen}
                          className="text-[11px] uppercase tracking-[0.15em] text-zinc-300 hover:text-white"
                        >
                          {quality === AUTO_QUALITY
                            ? "Auto"
                            : `${qualities.find((q) => q.id === quality)?.height ?? ""}p`}
                        </button>
                        {qualityOpen && (
                          <ul
                            role="listbox"
                            className="absolute bottom-full right-0 mb-3 min-w-[84px] border border-white/15 bg-black/90 py-1 backdrop-blur-sm"
                          >
                            {[...qualities]
                              .sort((a, b) => b.height - a.height)
                              .map((q) => ({ id: q.id, label: `${q.height}p` }))
                              .concat({ id: AUTO_QUALITY, label: "Auto" })
                              .map((option) => (
                                <li key={option.id} role="option" aria-selected={quality === option.id}>
                                  <button
                                    onClick={() => selectQuality(option.id)}
                                    className={`block w-full px-4 py-1.5 text-left text-[11px] uppercase tracking-[0.15em] transition-colors hover:text-white ${
                                      quality === option.id ? "text-[#c9a66b]" : "text-zinc-400"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
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
            </>
          )}
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
        {isExternal && (
          <motion.a
            variants={fadeUp}
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block w-fit border border-white/30 px-4 py-2 text-center text-[11px] uppercase tracking-[0.1em] text-zinc-100 transition-colors hover:border-white hover:bg-white/10"
          >
            {locale === "zh" ? "在 YouTube 上觀看 ↗" : "Watch on YouTube ↗"}
          </motion.a>
        )}
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
