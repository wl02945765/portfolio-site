"use client";

import { useEffect, useRef } from "react";

const FRAME_MS = 80;
const LIT_PROBABILITY = 0.05;
const MAX_DPR = 2;

export function NoiseCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let imageData: ImageData | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = Math.round(canvas.clientWidth * dpr);
      height = Math.round(canvas.clientHeight * dpr);
      canvas.width = width;
      canvas.height = height;
      imageData = width > 0 && height > 0 ? ctx.createImageData(width, height) : null;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const draw = () => {
      if (!imageData) return;
      const buffer = imageData.data;
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

    const interval = window.setInterval(draw, FRAME_MS);
    return () => {
      window.clearInterval(interval);
      resizeObserver.disconnect();
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
