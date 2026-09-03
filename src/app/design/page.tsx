import { CategoryFolders } from "@/components/CategoryFolders";
import { getDesignCategories, getDesignPhotos } from "@/lib/content";

export default function DesignPage() {
  const categories = getDesignCategories();
  const photos = getDesignPhotos();

  return (
    <div className="flex flex-1 flex-col">
      <CategoryFolders categories={categories} photos={photos} section="design" />
    </div>
  );
}
