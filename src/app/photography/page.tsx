import { PhotoGallery } from "@/components/PhotoGallery";
import { getPhotos, getCategories } from "@/lib/content";

export default function PhotographyPage() {
  const photos = getPhotos();
  const categories = getCategories();

  return (
    <div className="flex flex-1 flex-col">
      <PhotoGallery photos={photos} categories={categories} />
    </div>
  );
}
