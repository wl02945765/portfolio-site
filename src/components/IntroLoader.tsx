"use client";

import { useLayoutEffect, useRef, useState } from "react";

const SESSION_KEY = "cp-intro-shown";
const STATIC_DURATION_MS = 1680;
const STATIC_CANVAS_WIDTH = 120;

// A previous version of this component tried to hold the intro open until
// every <img> on the page had loaded, to avoid revealing a page that was
// still popping in. That backfired badly: document.images includes images
// with loading="lazy" (everything past the first few in any grid), and a
// lazy image structurally never fires load/error until it scrolls into
// view — which can't happen while this component has body scroll locked.
// So on any page with more than a handful of photos, that wait condition
// could never be satisfied, and the intro sat at its worst-case duration
// every single time — the opposite of the intended fix. Fixed duration,
// always. The real fix for "photos load slowly" is serving smaller images
// in the first place (see the grid-thumbnail work in PhotoCategoryGrid).

export function IntroLoader() {
  const [visible, setVisible] = useState(true);
  const [label, setLabel] = useState("NO SIGNAL");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barTopRef = useRef<HTMLDivElement>(null);
  const barBottomRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Some mobile in-app browsers (LINE, Instagram, FB Messenger) restrict
    // sessionStorage and throw on access instead of just no-op'ing. This ran
    // unguarded — an uncaught exception here crashed the whole page before
    // any content rendered, every single time the link was opened from one
    // of those apps. Fail safe: skip the intro rather than break the site.
    let alreadyShown = false;
    try {
      alreadyShown = Boolean(sessionStorage.getItem(SESSION_KEY));
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      setVisible(false);
      return;
    }
    if (alreadyShown) {
      setVisible(false);
      return;
    }
    document.body.style.overflow = "hidden";

    const canvas = canvasRef.current;
    const barTop = barTopRef.current;
    const barBottom = barBottomRef.current;
    const line = lineRef.current;
    if (!canvas || !barTop || !barBottom || !line) {
      document.body.style.overflow = "";
      return;
    }

    const ctx = canvas.getContext("2d");
    const internalW = STATIC_CANVAS_WIDTH;
    const internalH = Math.round(internalW * (window.innerHeight / window.innerWidth));
    canvas.width = internalW;
    canvas.height = internalH;

    let raf = 0;
    const timers: number[] = [];

    function drawStatic() {
      if (!ctx) return;
      const img = ctx.createImageData(internalW, internalH);
      const data = img.data;
      // Sparse "snow" rather than dense 50%-grey noise — it sits at roughly
      // the same brightness as the rest of the (dark, quiet) site, so the
      // reveal at the end still reads as the moment things get bright.
      for (let i = 0; i < data.length; i += 4) {
        const isSpeck = Math.random() > 0.86;
        const v = isSpeck ? 140 + Math.random() * 115 : 8;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }

    // The animation itself just keeps redrawing for as long as it's asked
    // to — the decision about WHEN to stop lives entirely in the plain
    // setTimeout below, not here.
    function animate() {
      drawStatic();
      raf = requestAnimationFrame(animate);
    }

    // A plain setTimeout, deliberately not driven by requestAnimationFrame —
    // some in-app browsers (Instagram's embedded webview, notably) throttle
    // or fully pause rAF, which would silently stop this from ever firing
    // and leave people stuck on "NO SIGNAL" forever. A fixed duration, timed
    // independently of rAF, always reveals on schedule.
    timers.push(window.setTimeout(settle, STATIC_DURATION_MS));

    function settle() {
      cancelAnimationFrame(raf);
      setLabel("SIGNAL LOCKED");
      canvas!.style.transition = "opacity 220ms ease";
      canvas!.style.opacity = "0";

      timers.push(
        window.setTimeout(() => {
          line!.style.transition =
            "transform 260ms cubic-bezier(.2,.9,.3,1), opacity 180ms ease";
          line!.style.transform = "translate(-50%, -50%) scaleX(1)";
          line!.style.opacity = "1";
        }, 120),
      );

      timers.push(
        window.setTimeout(() => {
          barTop!.style.transition = "transform 480ms cubic-bezier(.5,0,.15,1)";
          barBottom!.style.transition = "transform 480ms cubic-bezier(.5,0,.15,1)";
          barTop!.style.transform = "scaleY(0)";
          barBottom!.style.transform = "scaleY(0)";
          line!.style.transition = "opacity 320ms ease 80ms";
          line!.style.opacity = "0";
        }, 750),
      );

      timers.push(
        window.setTimeout(() => {
          setVisible(false);
          document.body.style.overflow = "";
        }, 1320),
      );
    }

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      // Whatever point the sequence was at, unmounting must never leave the
      // page permanently unscrollable — this used to only get reset by the
      // last timer inside settle(), so navigating away before that timer
      // fired left body scroll locked forever.
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black">
      {/* Shutter bars sit UNDER the static canvas — they're what's left
          showing (solid black) once the static fades, and later retract
          to reveal the page. If these paint above the canvas, the static
          never shows at all. */}
      <div ref={barTopRef} className="absolute inset-x-0 top-0 h-1/2 origin-top bg-black" />
      <div ref={barBottomRef} className="absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-black" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Vignette — sells the tube glass */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      {/* Faint persistent scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div
        ref={lineRef}
        className="absolute left-1/2 top-1/2 h-[2px] w-full opacity-0"
        style={{
          transform: "translate(-50%, -50%) scaleX(0)",
          background: "#f5f4f0",
          boxShadow: "0 0 10px 1px rgba(245,244,240,0.9), 0 0 34px 6px rgba(245,244,240,0.25)",
        }}
      />

      <p className="heading-font absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 bg-black/70 px-3 py-1.5 text-xs uppercase tracking-[0.32em] text-zinc-400">
        {label}
      </p>
    </div>
  );
}
