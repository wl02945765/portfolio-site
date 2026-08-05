"use client";

import { useEffect, useRef } from "react";

const FRAME_MS = 80;
const LIT_PROBABILITY = 0.05;
// Redrawing at full viewport resolution (millions of pixels, ~12x/sec,
// forever, on every page) pinned the CPU hard enough to heat up phones and
// laptops just from having the site open. A small fixed-size buffer
// stretched to fill the screen via CSS looks visually the same for random
// grain — the softening from upscaling actually reads as film grain — but
// is ~100x cheaper to redraw.
const NOISE_SIZE = 420;

export function NoiseCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    canvas.width = NOISE_SIZE;
    canvas.height = NOISE_SIZE;
    const imageData = ctx.createImageData(NOISE_SIZE, NOISE_SIZE);
    const buffer = imageData.data;

    const draw = () => {
      for (let i = 0; i < buffer.length; i += 4) {
        const lit = Math.random() < LIT_PROBABILITY;
        // grayish, not pure white — keeps the flicker easy on the eyes
        const v = lit ? Math.round(90 + Math.random() * 100) : 0;
        buffer[i] = v;
        buffer[i + 1] = v;
        buffer[i + 2] = v;
        buffer[i + 3] = lit ? Math.round(60 + Math.random() * 120) : 0;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    let interval: number | null = null;
    const start = () => {
      if (interval == null) interval = window.setInterval(draw, FRAME_MS);
    };
    const stop = () => {
      if (interval != null) {
        window.clearInterval(interval);
        interval = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    draw();
    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
