"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import { PageHeading } from "@/components/PageHeading";
import { encodeCategorySlug } from "@/lib/categorySlug";
import type { Photo } from "@/lib/content";

function getCategoryCover(photos: Photo[], category: string): Photo {
  return (
    photos.find((p) => p.category === category && p.isCover) ??
    photos.find((p) => p.category === category)!
  );
}

export function CategoryFolders({ photos }: { photos: Photo[] }) {
  const { t } = useLanguage();

  const categories = useMemo(() => {
    const set = new Set(
      photos.map((p) => p.category).filter((c): c is string => Boolean(c)),
    );
    return Array.from(set).map((category) => ({
      name: category,
      cover: getCategoryCover(photos, category),
      count: photos.filter((p) => p.category === category).length,
    }));
  }, [photos]);

  return (
    <div className="px-6 pb-24 pt-16 sm:px-10 sm:pt-20">
      <PageHeading>{t.photography.heading}</PageHeading>

      {categories.length === 0 ? (
        <div className="flex items-center justify-center px-6 py-32 text-center text-sm tracking-wide text-zinc-500">
          {t.photography.folderEmpty}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(({ name, cover, count }) => (
            <Link
              key={name}
              href={`/photography/${encodeCategorySlug(name)}`}
              className="group relative block aspect-square w-full overflow-hidden bg-black"
            >
              <img
                src={withBasePath(cover.src)}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-medium uppercase tracking-[0.1em] text-zinc-100">
                  {name}
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
