import type { Metadata } from "next";
import { Geist_Mono, Inter, EB_Garamond, LXGW_WenKai_TC, Chiron_Hei_HK } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { NavBar } from "@/components/NavBar";
import { NoiseCanvas } from "@/components/NoiseCanvas";
import { dictionaries } from "@/i18n/dictionaries";

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
  return (
    <html
      lang="zh-Hant"
      className={`${inter.variable} ${ebGaramond.variable} ${lxgwWenKaiTC.variable} ${chironHeiHK.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-300">
        <LanguageProvider>
          <NoiseCanvas className="fixed inset-0 -z-10 opacity-50" />
          <NavBar />
          <main className="flex flex-1 flex-col pt-[57px]">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
