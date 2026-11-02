"use client";

import { useState } from "react";

// YouTube's default `hqdefault` is only 480x360 (letterboxed 4:3), which
// looked soft blown up across a ~1400px monitor. Ask for the largest WebP
// first and step down when a size doesn't exist for this video — YouTube
// answers a missing size with a 404 that still carries a valid 120x90 grey
// placeholder image, so a "successful" load at that width means "missing" too.
const QUALITIES = ["maxresdefault", "sddefault", "hqdefault"] as const;
const MISSING_PLACEHOLDER_WIDTH = 120;

// 已知沒有 maxresdefault 的影片，直接從 sddefault 起跳，省掉一次必定 404 的請求
// （console 也不會再出現 404 錯誤）。新影片若遇到同樣情況會照舊自動降級。
const NO_MAXRES = new Set(["TA7b_Xc8qH8", "B4T5R1Yshpk"]);

export function YoutubeThumb({
  id,
  className,
  alt = "",
  loading,
  start = "maxresdefault",
}: {
  id: string;
  className?: string;
  alt?: string;
  loading?: "lazy" | "eager";
  // Small tiles don't need the 1280px copy; they can start lower.
  start?: (typeof QUALITIES)[number];
}) {
  const startLevel = NO_MAXRES.has(id) ? Math.max(QUALITIES.indexOf(start), 1) : QUALITIES.indexOf(start);
  const [level, setLevel] = useState(startLevel);
  const stepDown = () => setLevel((l) => Math.min(l + 1, QUALITIES.length - 1));

  return (
    <img
      src={`https://i.ytimg.com/vi_webp/${id}/${QUALITIES[level]}.webp`}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      onError={stepDown}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= MISSING_PLACEHOLDER_WIDTH) stepDown();
      }}
    />
  );
}
