import { withBasePath } from "@/lib/basePath";

// History: a hand-drawn canvas (Math.random + putImageData ~12x/sec) was
// replaced by a live SVG feTurbulence filter, which still had to re-synthesize
// full-viewport noise every ~170ms forever, on every page — on weaker GPUs the
// browser falls back to computing that on the CPU, and the whole site felt
// sluggish. The noise is now a small pre-rendered tile (captured from that
// same filter, so the specks look the same) and the "flicker" is just the
// tiled layer jumping between offsets via a stepped CSS transform: compositor
// only, nothing is re-rasterized or repainted. See `.noise-flicker` in
// globals.css; prefers-reduced-motion turns the jumping off there.
export function NoiseOverlay({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="noise-flicker absolute -inset-[512px]"
          style={{ backgroundImage: `url(${withBasePath("/noise.png")})` }}
        />
      </div>
    </div>
  );
}
