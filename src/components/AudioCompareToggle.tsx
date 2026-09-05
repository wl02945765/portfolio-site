"use client";

import { useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

// Threshold above which the currently-silent track gets nudged back in sync
// with the audible one. Correcting only the silent side means any jump this
// causes is inaudible by construction — the audible track's timeline never moves.
const RESYNC_THRESHOLD_SECONDS = 0.2;

export function AudioCompareToggle({
  rawSrc,
  mixedSrc,
  rawLabel,
  mixedLabel,
}: {
  rawSrc: string;
  mixedSrc: string;
  rawLabel: string;
  mixedLabel: string;
}) {
  const rawRef = useRef<HTMLAudioElement>(null);
  const mixedRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState<"raw" | "mixed">("mixed");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Raw and mixed masters can end up a few frames off in length — clamp
  // everything (seek, progress, effective end-of-track) to the shorter one
  // rather than trying to auto-trim either side.
  function effectiveDuration(): number | null {
    const raw = rawRef.current;
    const mixed = mixedRef.current;
    if (!raw?.duration || !mixed?.duration) return null;
    return Math.min(raw.duration, mixed.duration);
  }

  function togglePlay() {
    const raw = rawRef.current;
    const mixed = mixedRef.current;
    if (!raw || !mixed) return;
    if (raw.paused) {
      // Both elements always start/stop together — a single call site owning
      // playback state is what keeps their clocks from drifting apart.
      raw.play().catch(() => {});
      mixed.play().catch(() => {});
      setIsPlaying(true);
    } else {
      raw.pause();
      mixed.pause();
      setIsPlaying(false);
    }
  }

  function switchTo(side: "raw" | "mixed") {
    const raw = rawRef.current;
    const mixed = mixedRef.current;
    if (!raw || !mixed) return;
    // Resync the about-to-become-audible track to the currently audible one
    // before flipping mute state, so the switch lands on the same instant.
    if (side === "raw") raw.currentTime = mixed.currentTime;
    else mixed.currentTime = raw.currentTime;
    setActive(side);
  }

  function handleTimeUpdate() {
    const audible = active === "raw" ? rawRef.current : mixedRef.current;
    const other = active === "raw" ? mixedRef.current : rawRef.current;
    if (!audible) return;
    const dur = effectiveDuration();
    if (dur) {
      setDuration(dur);
      setProgress(Math.min(1, audible.currentTime / dur));
    }
    if (other && Math.abs(audible.currentTime - other.currentTime) > RESYNC_THRESHOLD_SECONDS) {
      other.currentTime = audible.currentTime;
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const raw = rawRef.current;
    const mixed = mixedRef.current;
    const dur = effectiveDuration();
    if (!raw || !mixed || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const target = ratio * dur;
    raw.currentTime = target;
    mixed.currentTime = target;
    setProgress(ratio);
  }

  function handleEnded() {
    rawRef.current?.pause();
    mixedRef.current?.pause();
    setIsPlaying(false);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="border border-white/15 bg-black p-4 font-mono sm:p-5">
      <audio
        ref={rawRef}
        src={withBasePath(rawSrc)}
        preload="auto"
        playsInline
        muted={active !== "raw"}
        onTimeUpdate={active === "raw" ? handleTimeUpdate : undefined}
        onEnded={handleEnded}
      />
      <audio
        ref={mixedRef}
        src={withBasePath(mixedSrc)}
        preload="auto"
        playsInline
        muted={active !== "mixed"}
        onTimeUpdate={active === "mixed" ? handleTimeUpdate : undefined}
        onEnded={handleEnded}
      />

      <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-zinc-500">Input Select</p>
      <div className="mb-4 flex gap-[2px]">
        <button
          type="button"
          onClick={() => switchTo("raw")}
          className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
            active === "raw"
              ? "bg-[#c9a66b] font-semibold text-black"
              : "border border-zinc-700 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {rawLabel}
        </button>
        <button
          type="button"
          onClick={() => switchTo("mixed")}
          className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
            active === "mixed"
              ? "bg-[#c9a66b] font-semibold text-black"
              : "border border-zinc-700 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {mixedLabel}
        </button>
      </div>

      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-zinc-600 text-[10px] text-zinc-200 hover:border-zinc-300"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <div onClick={handleSeek} className="relative h-[3px] flex-1 cursor-pointer bg-zinc-800">
          <div className="h-full bg-[#c9a66b]" style={{ width: `${progress * 100}%` }} />
          <div
            className="absolute top-1/2 h-2 w-2 rounded-full bg-[#c9a66b]"
            style={{ left: `${progress * 100}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-zinc-500">
        <span>{formatTime(duration * progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
