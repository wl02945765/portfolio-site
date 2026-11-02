import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AboutContent } from "@/components/AboutContent";
import { hasResume } from "@/lib/resume";

export const metadata: Metadata = pageMeta(
  "關於我｜Ching's Profile",
  "Ching 的自我介紹：影像創作者，做影片製作、商品攝影、修圖與 Podcast 音訊製作；列出常用工具與求職狀態。",
  "/about/",
);

export default function AboutPage() {
  return <AboutContent resumeAvailable={hasResume()} />;
}
