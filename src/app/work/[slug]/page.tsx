import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCase } from "@/components/ProjectCase";
import { getProjectEntries } from "@/lib/projects";
import { pageMeta } from "@/lib/seo";
import { withBasePath } from "@/lib/basePath";

export const dynamicParams = false;

export async function generateStaticParams() {
  const entries = getProjectEntries();
  // `output: export` 的動態路由至少要有一組參數；沒有任何專案時產生一個只會 404 的佔位頁。
  if (entries.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return entries.map((e) => ({ slug: e.project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getProjectEntries().find((e) => e.project.slug === slug);
  const name = entry?.video.title.zh || "專案說明";
  const services = entry?.video.services.zh;
  const desc = `${name}${entry?.video.year ? `（${entry.video.year}）` : ""}：專案說明。${services ? `我參與的項目：${services}。` : ""}`;
  const image = entry?.video.thumbnail ? withBasePath(entry.video.thumbnail) : undefined;
  return pageMeta(`${name}｜專案說明｜Ching's Profile`, desc, `/work/${slug}/`, image);
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entries = getProjectEntries();
  const index = entries.findIndex((e) => e.project.slug === slug);
  if (index === -1) {
    notFound();
  }
  return <ProjectCase entry={entries[index]} prev={entries[index - 1]} next={entries[index + 1]} />;
}
