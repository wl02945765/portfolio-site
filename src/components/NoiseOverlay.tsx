"use client";

import { useEffect, useState } from "react";

// The old version drew a pixel buffer by hand with Math.random() and
// putImageData ~12x/sec forever — real CPU work, every frame, on every page.
// An SVG feTurbulence filter produces the same "static specks" look but is
// generated natively by the browser's filter/compositor pipeline (GPU-backed
// where available), so there's no JS loop and no per-frame pixel math at
// all. baseFrequency controls speck size directly — higher is finer/smaller.
const BASE_FREQUENCY = 1.4;
const FLICKER_SEEDS = "1;9;4;13;7;2;11;5;15;8;3;12;6";

export function NoiseOverlay({ className }: { className?: string }) {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <svg className="absolute h-0 w-0">
        <filter id="grain-noise" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={BASE_FREQUENCY}
            numOctaves={2}
            seed={2}
            stitchTiles="stitch"
            result="noise"
          >
            {animate && (
              <animate
                attributeName="seed"
                values={FLICKER_SEEDS}
                dur="0.9s"
                repeatCount="indefinite"
                calcMode="discrete"
              />
            )}
          </feTurbulence>
          {/* Steep alpha ramp turns the smooth turbulence gradient into
              sparse, high-contrast specks instead of a cloudy haze. */}
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 16 -13"
          />
        </filter>
      </svg>
      <div className="h-full w-full" style={{ filter: "url(#grain-noise)" }} />
    </div>
  );
}
