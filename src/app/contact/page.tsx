import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ContactContent } from "@/components/ContactContent";

export const metadata: Metadata = pageMeta(
  "聯絡我｜Ching's Profile",
  "工作機會與合作詢問，歡迎來信或留言給 Ching。",
  "/contact/",
);

export default function ContactPage() {
  return <ContactContent />;
}
