import { Hero } from "@/components/Hero";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { getProjectEntries } from "@/lib/projects";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <FeaturedProjects entries={getProjectEntries()} />
    </div>
  );
}
