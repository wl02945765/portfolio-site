import { notFound } from "next/navigation";
import { VideoDetail } from "@/components/VideoDetail";
import { getVideos } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const videos = getVideos();
  // `output: export` requires at least one static param for a dynamic route
  // to be valid, so before any video is uploaded we generate a single
  // placeholder path that simply 404s (it's never linked to from anywhere).
  if (videos.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return videos.map((video) => ({ slug: video.slug }));
}

export default async function VideoWorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = getVideos().find((v) => v.slug === slug);

  if (!video) {
    notFound();
  }

  return <VideoDetail video={video} />;
}
