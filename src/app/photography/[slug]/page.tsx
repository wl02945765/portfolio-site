import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryDetail } from "@/components/CategoryDetail";
import { getPhotos, getCategories } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = getCategories();
  if (categories.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return categories.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategories().find((c) => c.id === slug);
  const name = category?.name.zh || category?.name.en || "攝影作品";
  const desc = category?.description?.zh || `${name}：Ching 的攝影與修圖作品。`;
  return pageMeta(`${name}｜Ching's Profile`, desc, `/photography/${slug}/`);
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

  return <CategoryDetail category={category} photos={photos} section="photography" />;
}
