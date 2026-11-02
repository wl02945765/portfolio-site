import type { Metadata } from "next";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { getProjectEntries } from "@/lib/projects";
import { pageMeta } from "@/lib/seo";
import { workCopy } from "@/i18n/jobhunt";

export const metadata: Metadata = pageMeta(
  workCopy.zh.listMetaTitle,
  "Ching 的精選影像專案：每支作品的背景、我的角色、使用工具與流程。",
  "/work/",
);

export default function WorkPage() {
  return <FeaturedProjects entries={getProjectEntries()} asPage />;
}
