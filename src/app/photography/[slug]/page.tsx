import { notFound } from "next/navigation";
import { CategoryDetail } from "@/components/CategoryDetail";
import { getPhotos } from "@/lib/content";
import { encodeCategorySlug, decodeCategorySlug } from "@/lib/categorySlug";

export const dynamicParams = false;

export async function generateStaticParams() {
  const photos = getPhotos();
  const categories = Array.from(
    new Set(photos.map((p) => p.category).filter((c): c is string => Boolean(c))),
  );
  if (categories.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return categories.map((category) => ({ slug: encodeCategorySlug(category) }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = decodeCategorySlug(slug);
  const photos = getPhotos().filter((p) => p.category === category);

  if (photos.length === 0) {
    notFound();
  }

  return <CategoryDetail category={category} photos={photos} />;
}
