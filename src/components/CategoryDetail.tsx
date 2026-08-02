"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PhotoCategoryGrid } from "@/components/PhotoCategoryGrid";
import type { Category, Photo } from "@/lib/content";

export function CategoryDetail({
  category,
  photos,
}: {
  category: Category;
  photos: Photo[];
}) {
  const { t, locale } = useLanguage();
  const description = category.description?.[locale];
  const location = category.location?.[locale];

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <Link
        href="/photography"
        className="mb-8 inline-block w-fit text-[11px] uppercase tracking-[0.15em] text-zinc-500 hover:text-zinc-300"
      >
        ← {t.photography.backToPhotography}
      </Link>

      <h1 className="text-2xl font-semibold uppercase tracking-[0.1em] text-zinc-300 sm:text-3xl">
        {category.name[locale]}
      </h1>
      {location && (
        <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">{location}</p>
      )}
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{description}</p>
      )}

      <div className="mt-10">
        <PhotoCategoryGrid photos={photos} />
      </div>
    </div>
  );
}
