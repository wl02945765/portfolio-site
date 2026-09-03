"use client";

import { useEffect, useState } from "react";

// The old version drew a pixel buffer by hand with Math.random() and
// putImageData ~12x/sec forever — real CPU work, every frame, on every page.
// An SVG feTurbulence filter produces the same "static specks" look and is
// GPU-backed on Apple Silicon, but on weaker/older GPUs (reported: visible
// site-wide stutter on a lower-end PC) browsers fall back to rasterizing the
// turbulence on the CPU — and this filter used to run over the full,
// uncapped viewport every 0.9s, forever, on every page. It's now generated
// at half linear size (1/4 the pixels to synthesize) and simply upscaled via
// a GPU-cheap CSS transform; baseFrequency is doubled so the doubled scale
// lands back on the original speck size, and the reseed interval is slowed
// so it recomputes less often. Noise has no fine detail to preserve, so none
// of this is visible — it just costs a lot less to keep animating.
const BASE_FREQUENCY = 2.8;
const FLICKER_SEEDS = "1;9;4;13;7;2;11;5;15;8;3;12;6";
const FLICKER_DURATION_S = 2.2;

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
                dur={`${FLICKER_DURATION_S}s`}
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
      <div
        className="h-1/2 w-1/2 origin-top-left"
        style={{ filter: "url(#grain-noise)", transform: "scale(2)" }}
      />
    </div>
  );
}
