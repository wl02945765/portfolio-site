import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PhotoGallery } from "@/components/PhotoGallery";
import { getPhotos, getCategories, getFeaturedPhotos } from "@/lib/content";

export const metadata: Metadata = pageMeta(
  "攝影與修圖｜Ching's Profile",
  "商品攝影、修圖前後對比、城市光影、人像與旅行攝影作品。",
  "/photography/",
);

export default function PhotographyPage() {
  const photos = getPhotos();
  const categories = getCategories();
  const featuredPhotos = getFeaturedPhotos();

  return (
    <div className="flex flex-1 flex-col">
      <PhotoGallery photos={photos} categories={categories} featuredPhotos={featuredPhotos} />
    </div>
  );
}
