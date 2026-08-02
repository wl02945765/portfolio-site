import type { Photo } from "@/lib/content";

const STRIP_COUNT = 90;

/** Deterministic pseudo-random 0..1 value from an index, so the strip layout is stable across server/client renders. */
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function HeroStrips({ photos }: { photos: Photo[] }) {
  const strips = Array.from({ length: STRIP_COUNT }, (_, i) => {
    if (photos.length === 0) {
      // Grayscale value 0-255, expressed as rgb() directly (not hsl()) —
      // browsers normalize hsl() back to rgb() when reflecting inline
      // styles, which trips a React hydration mismatch on the raw string.
      const v = Math.round((18 + pseudoRandom(i) * 14) * 2.55);
      return { kind: "placeholder" as const, rgb: `rgb(${v}, ${v}, ${v})` };
    }
    const photo = photos[i % photos.length];
    const positionX = `${Math.round(pseudoRandom(i + 1) * 100)}%`;
    return { kind: "photo" as const, photo, positionX };
  });

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {strips.map((strip, i) =>
        strip.kind === "photo" ? (
          <div
            key={i}
            className="h-full flex-1"
            style={{
              backgroundImage: `url(${strip.photo.src})`,
              backgroundSize: "auto 100%",
              backgroundPositionX: strip.positionX,
              backgroundPositionY: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div
            key={i}
            className="h-full flex-1"
            style={{ backgroundColor: strip.rgb }}
          />
        ),
      )}
    </div>
  );
}
