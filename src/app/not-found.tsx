import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";

// 預設 404 頁的 title 會變成「404: This page could not be found.Ching's Profile」（少分隔符號）。
// 自訂一頁，title 與其他頁一致；頁面文字在 content/site-text.json 的 notFound。
export const metadata: Metadata = {
  title: "找不到頁面｜Ching's Profile",
};

export default function NotFound() {
  return <NotFoundContent />;
}
