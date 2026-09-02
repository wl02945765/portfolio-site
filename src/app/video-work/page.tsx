import { VisionMixerWall } from "@/components/VisionMixerWall";
import { getVideos, getVideoCategories } from "@/lib/content";

export default function VideoWorkPage() {
  const videos = getVideos();
  const categories = getVideoCategories();

  return (
    <div className="flex flex-1 flex-col">
      <VisionMixerWall videos={videos} categories={categories} />
    </div>
  );
}
