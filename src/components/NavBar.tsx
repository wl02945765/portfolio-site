"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageProvider";

export function NavBar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/about", label: t.nav.aboutLabel },
    { href: "/photography", label: t.nav.photographyLabel },
    { href: "/video-work", label: t.nav.videoWorkLabel },
    { href: "/sound", label: t.nav.soundLabel },
    { href: "/contact", label: t.nav.contactLabel },
  ];

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="heading-font text-[12px] font-medium tracking-[0.2em] text-zinc-300"
        >
          {t.brandName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 md:flex md:gap-8">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`heading-font text-[12px] font-medium uppercase tracking-[0.15em] transition-colors ${
                  active ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="text-[12px] font-medium tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-200"
            aria-label="Switch language"
          >
            {locale === "zh" ? "中 / EN" : "EN / 中"}
          </button>
        </nav>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="h-px w-5 bg-zinc-300"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="h-px w-5 bg-zinc-300"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="h-px w-5 bg-zinc-300"
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/10 bg-black md:hidden"
          >
            <div className="flex flex-col gap-6 px-6 py-8 sm:px-10">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`heading-font text-base font-medium uppercase tracking-[0.15em] transition-colors ${
                      active ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
                className="w-fit text-[11px] font-medium tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-200"
                aria-label="Switch language"
              >
                {locale === "zh" ? "中 / EN" : "EN / 中"}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
