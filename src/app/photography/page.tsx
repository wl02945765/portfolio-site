import { PhotoGallery } from "@/components/PhotoGallery";
import { getPhotos, getCategories, getFeaturedPhotos } from "@/lib/content";

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
