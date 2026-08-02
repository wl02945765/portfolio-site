import { notFound } from "next/navigation";
import { CategoryDetail } from "@/components/CategoryDetail";
import { getPhotos, getCategories } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = getCategories();
  if (categories.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return categories.map((category) => ({ slug: category.id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategories().find((c) => c.id === slug);
  const photos = getPhotos().filter((p) => p.categoryId === slug);

  if (!category || photos.length === 0) {
    notFound();
  }

  return <CategoryDetail category={category} photos={photos} />;
}
