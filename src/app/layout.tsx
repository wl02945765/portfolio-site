import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { NavBar } from "@/components/NavBar";
import { NoiseCanvas } from "@/components/NoiseCanvas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHING'S PROFILE",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <LanguageProvider>
          <NoiseCanvas className="fixed inset-0 -z-10 opacity-70" />
          <NavBar />
          <main className="flex flex-1 flex-col pt-[57px]">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
