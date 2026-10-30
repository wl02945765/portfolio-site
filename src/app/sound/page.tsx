import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SoundContent } from "@/components/SoundContent";
import { getSound, getSoundEpisodes } from "@/lib/content";

export const metadata: Metadata = pageMeta(
  "聲音作品｜Ching's Profile",
  "Podcast 與聲音後製作品：錄音與混音。",
  "/sound/",
);

export default function SoundPage() {
  const sound = getSound();
  const episodes = getSoundEpisodes();

  return <SoundContent sound={sound} episodes={episodes} />;
}
