import { VideoGrid } from "@/components/VideoGrid";
import { getVideos, getVideoCategories } from "@/lib/content";

export default function VideoWorkPage() {
  const videos = getVideos();
  const categories = getVideoCategories();

  return (
    <div className="flex flex-1 flex-col">
      <VideoGrid videos={videos} categories={categories} />
    </div>
  );
}
