"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { withBasePath } from "@/lib/basePath";
import { PageHeading } from "@/components/PageHeading";
import { encodeCategorySlug } from "@/lib/categorySlug";
import type { Photo } from "@/lib/content";

const EXPANDED_WIDTH = 45; // percent

function getCategoryCover(photos: Photo[], category: string): Photo {
  return (
    photos.find((p) => p.category === category && p.isCover) ??
    photos.find((p) => p.category === category)!
  );
}

export function CategoryFolders({ photos }: { photos: Photo[] }) {
  const { t, locale } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  const restWidth =
    hoveredIndex === null
      ? 100 / categories.length
      : (100 - EXPANDED_WIDTH) / (categories.length - 1 || 1);

  return (
    <div className="pb-24">
      <div className="px-6 pt-16 sm:px-10 sm:pt-20">
        <PageHeading>{t.photography.heading}</PageHeading>
      </div>

      {categories.length === 0 ? (
        <div className="flex items-center justify-center px-6 py-32 text-center text-sm tracking-wide text-zinc-500">
          {t.photography.folderEmpty}
        </div>
      ) : (
        <div className="relative mt-10 flex h-[55vh] w-full items-stretch justify-center overflow-hidden bg-black">
          {categories.map(({ name, cover, count }, i) => {
            const isHovered = hoveredIndex === i;
            const width =
              hoveredIndex === null ? 100 / categories.length : isHovered ? EXPANDED_WIDTH : restWidth;

            return (
              <Link
                key={name}
                href={`/photography/${encodeCategorySlug(name)}`}
                className="relative h-full overflow-hidden transition-[width] duration-500 ease-out"
                style={{ width: `${width}%` }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-out"
                  style={{
                    backgroundImage: `url(${withBasePath(cover.src)})`,
                    opacity: isHovered ? 1 : 0,
                  }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-500"
                  style={{ opacity: isHovered ? 1 : 0 }}
                />
                {isHovered && (
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-sm font-medium uppercase tracking-[0.1em] text-zinc-100">
                      {name}
                    </p>
                    <p className="mt-1 text-[11px] tracking-wide text-zinc-400">
                      {count} {cover.caption[locale]}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
