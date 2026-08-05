import { SoundContent } from "@/components/SoundContent";
import { getSound } from "@/lib/content";

export default function SoundPage() {
  const sound = getSound();

  return <SoundContent sound={sound} />;
}
