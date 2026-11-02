import { getProjects, getVideos } from "@/lib/content";
import type { Project, Video } from "@/lib/content";

export type ProjectEntry = { project: Project; video: Video };

/** 專案＋對應影片（找不到影片的專案會被略過；getProjects 已在建置時檢查 videoId）。 */
export function getProjectEntries(): ProjectEntry[] {
  const videos = getVideos();
  return getProjects().flatMap((project) => {
    const video = videos.find((v) => v.id === project.videoId);
    return video ? [{ project, video }] : [];
  });
}
