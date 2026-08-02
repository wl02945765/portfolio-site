"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { PageHeading } from "@/components/PageHeading";
import { PhotoStripCurtain } from "@/components/PhotoStripCurtain";
import { CategoryFolders } from "@/components/CategoryFolders";
import type { Photo } from "@/lib/content";

export function PhotoGallery({ photos }: { photos: Photo[] }) {
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
      <PhotoStripCurtain photos={photos} />
      <CategoryFolders photos={photos} />
    </div>
  );
}
