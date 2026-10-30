import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { VisionMixerWall } from "@/components/VisionMixerWall";
import { getVideos, getVideoCategories } from "@/lib/content";

export const metadata: Metadata = pageMeta(
  "影片作品｜Ching's Profile",
  "影片剪輯作品集：旅行紀錄、商品影片與短片。",
  "/video-work/",
);

export default function VideoWorkPage() {
  const videos = getVideos();
  const categories = getVideoCategories();

  return (
    <div className="flex flex-1 flex-col">
      <VisionMixerWall videos={videos} categories={categories} />
    </div>
  );
}
