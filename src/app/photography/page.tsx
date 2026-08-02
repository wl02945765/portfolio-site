import { PhotoGallery } from "@/components/PhotoGallery";
import { getPhotos } from "@/lib/content";

export default function PhotographyPage() {
  const photos = getPhotos();

  return (
    <div className="flex flex-1 flex-col">
      <PhotoGallery photos={photos} />
    </div>
  );
}
