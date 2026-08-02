"use client";

import { useEffect, useRef } from "react";

const BUFFER_WIDTH = 400;
const BUFFER_HEIGHT = 250;
const FRAME_MS = 80;
const LIT_PROBABILITY = 0.15;

export function NoiseCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = BUFFER_WIDTH;
    canvas.height = BUFFER_HEIGHT;
    const imageData = ctx.createImageData(BUFFER_WIDTH, BUFFER_HEIGHT);
    const buffer = imageData.data;

    const draw = () => {
      for (let i = 0; i < buffer.length; i += 4) {
        const lit = Math.random() < LIT_PROBABILITY;
        const v = lit ? Math.round(80 + Math.random() * 175) : 0;
        buffer[i] = v;
        buffer[i + 1] = v;
        buffer[i + 2] = v;
        buffer[i + 3] = lit ? Math.round(Math.random() * 255) : 0;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    draw();
    const interval = window.setInterval(draw, FRAME_MS);
    return () => window.clearInterval(interval);
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
