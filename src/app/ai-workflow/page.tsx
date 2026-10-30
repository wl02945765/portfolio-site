import type { Metadata } from "next";
import { AiWorkflowContent } from "@/components/AiWorkflowContent";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "我怎麼用 AI 當幫手｜Ching's Profile",
  "修圖、攝影、剪輯與聲音後製由我親手完成；AI 協助字幕初稿、音軌排列與重複性步驟。說明我和 AI 如何分工。",
  "/ai-workflow/",
);

export default function AiWorkflowPage() {
  return <AiWorkflowContent />;
}
