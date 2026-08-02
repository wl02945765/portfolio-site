import { VideoGrid } from "@/components/VideoGrid";
import { getVideos } from "@/lib/content";

export default function VideoWorkPage() {
  const videos = getVideos();

  return (
    <div className="flex flex-1 flex-col">
      <VideoGrid videos={videos} />
    </div>
  );
}
