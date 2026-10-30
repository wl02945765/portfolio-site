import type { Metadata } from "next";
import { withBasePath } from "@/lib/basePath";

export const SITE_URL = "https://ching-profile.pages.dev";
const OG_IMAGE = { url: withBasePath("/og-image.jpg"), width: 1200, height: 630, alt: "Ching's Profile" };

/** 各頁獨立的 title / description 與分享預覽（OG／Twitter）。圖片網址相對於 layout 的 metadataBase。 */
export function pageMeta(title: string, description: string, path: string, imageUrl?: string): Metadata {
  const image = imageUrl ? { url: imageUrl, alt: title } : OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: withBasePath(path) },
    openGraph: {
      title,
      description,
      url: withBasePath(path),
      siteName: "Ching's Profile",
      locale: "zh_TW",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
