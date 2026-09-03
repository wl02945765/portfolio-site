"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PhotoCategoryGrid } from "@/components/PhotoCategoryGrid";
import type { Category, Photo } from "@/lib/content";

export function CategoryDetail({
  category,
  photos,
  section,
}: {
  category: Category;
  photos: Photo[];
  section: "photography" | "design";
}) {
  const { t, locale } = useLanguage();
  const description = category.description?.[locale];
  const location = category.location?.[locale];
  const basePath = section === "design" ? "/design" : "/photography";
  const backLabel = section === "design" ? t.design.backToDesign : t.photography.backToPhotography;

  return (
    <div className="flex flex-1 flex-col px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <Link
        href={basePath}
        className="fixed left-3 top-[73px] z-30 rounded-full bg-black/80 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-zinc-400 backdrop-blur-sm hover:text-zinc-200 sm:left-6"
      >
        ← {backLabel}
      </Link>

      <h1 className="heading-font text-2xl font-medium uppercase tracking-[0.1em] text-zinc-300 sm:text-3xl">
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
