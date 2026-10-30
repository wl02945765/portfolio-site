import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AboutContent } from "@/components/AboutContent";

export const metadata: Metadata = pageMeta(
  "關於我｜Ching's Profile",
  "Ching 的自我介紹：做影像、修圖、剪輯與聲音後製的創作者，以及工作方式與能力。",
  "/about/",
);

export default function AboutPage() {
  return <AboutContent />;
}
