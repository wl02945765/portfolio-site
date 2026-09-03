"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import { PageHeading } from "@/components/PageHeading";
import type { Category, Photo } from "@/lib/content";

export function CategoryFolders({
  categories,
  photos,
  section,
}: {
  categories: Category[];
  photos: Photo[];
  section: "photography" | "design";
}) {
  const { t, locale } = useLanguage();
  const sectionText = t[section];
  const basePath = section === "design" ? "/design" : "/photography";

  const folders = useMemo(
    () =>
      categories
        .map((category) => {
          const categoryPhotos = photos.filter((p) => p.categoryId === category.id);
          const cover =
            categoryPhotos.find((p) => p.id === category.coverPhotoId) ?? categoryPhotos[0];
          return { category, cover, count: categoryPhotos.length };
        })
        .filter((f) => f.cover),
    [categories, photos],
  );

  return (
    <div className="px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <PageHeading>{sectionText.heading}</PageHeading>

      {folders.length === 0 ? (
        <div className="flex items-center justify-center px-6 py-32 text-center text-sm tracking-wide text-zinc-500">
          {sectionText.folderEmpty}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {folders.map(({ category, cover, count }) => (
            <Link
              key={category.id}
              href={`${basePath}/${category.id}`}
              className="group relative block aspect-square w-full overflow-hidden bg-black"
            >
              <img
                src={withBasePath(cover.thumbSrc || cover.src)}
                alt={category.name[locale]}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-medium uppercase tracking-[0.1em] text-zinc-100">
                  {category.name[locale]}
                </p>
                <p className="mt-1 text-[11px] tracking-wide text-zinc-400">{count}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
