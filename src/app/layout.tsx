import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Noto_Serif_TC, Inter, Chiron_Hei_HK } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { NavBar } from "@/components/NavBar";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { IntroLoader } from "@/components/IntroLoader";
import { dictionaries } from "@/i18n/dictionaries";
import siteText from "../../content/site-text.json";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const chironHeiHK = Chiron_Hei_HK({
  variable: "--font-chiron-hei-hk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: dictionaries.zh.brandName,
  description: "Photography, retouching, video editing & audio mixing — Ching's portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontScale = siteText.typography?.fontScale ?? 1;
  return (
    <html
      lang="zh-Hant"
      className={`${inter.variable} ${instrumentSerif.variable} ${notoSerifTC.variable} ${chironHeiHK.variable} ${geistMono.variable} h-full antialiased`}
      style={{ fontSize: `${Math.round(fontScale * 10000) / 100}%` }}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-300">
        <LanguageProvider>
          <IntroLoader />
          <NoiseOverlay className="fixed inset-0 -z-10 opacity-50" />
          <NavBar />
          <main className="flex flex-1 flex-col pt-[57px]">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
