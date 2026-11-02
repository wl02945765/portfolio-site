import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideoDetail } from "@/components/VideoDetail";
import { getVideos } from "@/lib/content";
import { pageMeta } from "@/lib/seo";
import { withBasePath } from "@/lib/basePath";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideos().find((v) => v.slug === slug);
  const title = video?.title.zh || video?.title.en || "影片作品";
  const desc = `${title}${video?.year ? `（${video.year}）` : ""}：Ching 的影片作品。`;
  // 預覽圖用該片自己的縮圖（YouTube 為外部網址，本機上傳的才需要 basePath，withBasePath 已處理）
  const image = video?.thumbnail ? withBasePath(video.thumbnail) : undefined;
  return pageMeta(`${title}｜Ching's Profile`, desc, `/video-work/${encodeURI(slug)}/`, image);
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
