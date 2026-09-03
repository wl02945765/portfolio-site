"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { PhotoStripCurtain } from "@/components/PhotoStripCurtain";
import { CategoryFolders } from "@/components/CategoryFolders";
import type { Category, FeaturedPhoto, Photo } from "@/lib/content";

export function PhotoGallery({
  photos,
  categories,
  featuredPhotos,
}: {
  photos: Photo[];
  categories: Category[];
  featuredPhotos: FeaturedPhoto[];
}) {
  const { t } = useLanguage();

  if (photos.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeading>{t.photography.heading}</PageHeading>
        <div className="flex flex-1 items-center justify-center px-6 py-32 text-sm tracking-wide text-zinc-500">
          {t.photography.empty}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {featuredPhotos.length > 0 && <PhotoStripCurtain photos={featuredPhotos} />}
      <CategoryFolders categories={categories} photos={photos} section="photography" />
    </div>
  );
}
