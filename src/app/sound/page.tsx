import { SoundContent } from "@/components/SoundContent";
import { getSound, getSoundEpisodes } from "@/lib/content";

export default function SoundPage() {
  const sound = getSound();
  const episodes = getSoundEpisodes();

  return <SoundContent sound={sound} episodes={episodes} />;
}
