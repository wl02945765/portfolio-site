"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";

const NAV_ITEMS = [
  { href: "/about", label: "About Me" },
  { href: "/photography", label: "Photography" },
  { href: "/video-work", label: "Video Work" },
  { href: "/contact", label: "Contact" },
];

export function NavBar() {
  const pathname = usePathname();
  const { locale, setLocale } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="text-[11px] font-medium tracking-[0.2em] text-zinc-300"
        >
          CHING&apos;S PROFILE
        </Link>

        <nav className="flex items-center gap-5 sm:gap-8">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-medium uppercase tracking-[0.15em] transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            className="text-[11px] font-medium tracking-[0.15em] text-zinc-400 transition-colors hover:text-white"
            aria-label="Switch language"
          >
            {locale === "zh" ? "中 / EN" : "EN / 中"}
          </button>
        </nav>
      </div>
    </header>
  );
}
