"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PhotoCategoryGrid } from "@/components/PhotoCategoryGrid";
import type { Photo } from "@/lib/content";

export function CategoryDetail({
  category,
  photos,
}: {
  category: string;
  photos: Photo[];
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <Link
        href="/photography"
        className="mb-8 inline-block w-fit text-[11px] uppercase tracking-[0.15em] text-zinc-500 hover:text-zinc-300"
      >
        ← {t.photography.backToPhotography}
      </Link>

      <h1 className="text-2xl font-semibold uppercase tracking-[0.1em] text-zinc-300 sm:text-3xl">
        {category}
      </h1>

      <div className="mt-10">
        <PhotoCategoryGrid photos={photos} />
      </div>
    </div>
  );
}
