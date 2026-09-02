"use client";

import { useLayoutEffect, useState } from "react";

const SESSION_KEY = "cp-intro-shown";
const DURATION_MS = 1800;
const HOLD_MS = 250;
const FADE_MS = 700;

export function IntroLoader() {
  const [visible, setVisible] = useState(true);
  const [percent, setPercent] = useState(0);
  const [fading, setFading] = useState(false);

  useLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const t = Math.min((now - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setPercent(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setFading(true), HOLD_MS);
        window.setTimeout(() => {
          setVisible(false);
          document.body.style.overflow = "";
        }, HOLD_MS + FADE_MS);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-out ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p className="heading-font mb-6 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Ching&apos;s Profile
      </p>
      <p className="heading-font text-6xl font-medium tabular-nums text-zinc-100 sm:text-7xl">
        {percent}
      </p>
      <div className="mt-8 h-px w-40 overflow-hidden bg-zinc-800 sm:w-56">
        <div className="h-full bg-zinc-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
