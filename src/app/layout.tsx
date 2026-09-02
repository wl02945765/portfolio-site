import type { Metadata } from "next";
import { Geist_Mono, Inter, EB_Garamond, LXGW_WenKai_TC, Chiron_Hei_HK } from "next/font/google";
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

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const lxgwWenKaiTC = LXGW_WenKai_TC({
  variable: "--font-lxgw-wenkai-tc",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`${inter.variable} ${ebGaramond.variable} ${lxgwWenKaiTC.variable} ${chironHeiHK.variable} ${geistMono.variable} h-full antialiased`}
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
