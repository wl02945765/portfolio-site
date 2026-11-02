import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ContactContent } from "@/components/ContactContent";

export const metadata: Metadata = pageMeta(
  "聯絡我｜Ching's Profile",
  "招募洽詢與案子合作，歡迎來信給 Ching（住新北市樹林區）。",
  "/contact/",
);

export default function ContactPage() {
  return <ContactContent />;
}
