import { notFound } from "next/navigation";
import { CategoryDetail } from "@/components/CategoryDetail";
import { getDesignPhotos, getDesignCategories } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = getDesignCategories();
  if (categories.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return categories.map((category) => ({ slug: category.id }));
}

export default async function DesignCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getDesignCategories().find((c) => c.id === slug);
  const photos = getDesignPhotos().filter((p) => p.categoryId === slug);

  if (!category || photos.length === 0) {
    notFound();
  }

  return <CategoryDetail category={category} photos={photos} section="design" />;
}
