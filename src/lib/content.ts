import photosData from "../../content/photos.json";
import categoriesData from "../../content/categories.json";
import videosData from "../../content/videos.json";
import videoCategoriesData from "../../content/videoCategories.json";
import soundData from "../../content/sound.json";
import soundEpisodesData from "../../content/soundEpisodes.json";
import aboutGalleryData from "../../content/aboutGallery.json";
import aboutSkillsData from "../../content/aboutSkills.json";
import aboutHeroData from "../../content/aboutHero.json";
import aboutTagsData from "../../content/aboutTags.json";
import aboutPhilosophyData from "../../content/aboutPhilosophy.json";
import aboutTimelineData from "../../content/aboutTimeline.json";
import featuredPhotosData from "../../content/featuredPhotos.json";
import designCategoriesData from "../../content/designCategories.json";
import designsData from "../../content/designs.json";
import contactData from "../../content/contact.json";
import contactLinksData from "../../content/contactLinks.json";
import projectsData from "../../content/projects.json";
import aboutToolsData from "../../content/aboutTools.json";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type Category = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  location?: LocalizedText;
  coverPhotoId?: string;
};

export type Photo = {
  id: string;
  src: string;
  categoryId?: string;
  caption: LocalizedText;
  beforeSrc?: string;
  // A ~1200px copy of src, matched in size to beforeSrc — used on the
  // "after" side of the wipe tile so it doesn't pair a full-res before
  // with a tiny after (or vice versa).
  compareSrc?: string;
  // A ~800px copy for masonry-grid browsing — src is full resolution
  // (up to 2400px) and is reserved for the lightbox.
  thumbSrc?: string;
  width?: number;
  height?: number;
};

export type VideoCategory = {
  id: string;
  name: LocalizedText;
};

export type Video = {
  id: string;
  slug: string;
  thumbnail: string;
  // ≤640px-wide copy of a local thumbnail for the small camera tiles (sharp
  // even on 2x screens at their largest, ~330px); thumbnail itself (up to
  // 1280px) is for the big PGM monitor and the detail page poster.
  thumbnailSmall?: string;
  // Uploaded videos: an adaptive HLS master playlist ("…-hls/index.m3u8",
  // 1080p + 720p renditions). "" for YouTube-backed videos.
  videoSrc: string;
  // Same ~8s loop at 1280px for the PGM monitor, where the 640px one looked
  // soft stretched across the full width.
  previewHdSrc?: string;
  // ~8s, 640px, silent loop cut from videoSrc for the Video Work page's
  // hover previews and PGM monitor — videoSrc itself is the full master.
  previewSrc?: string;
  title: LocalizedText;
  services: LocalizedText;
  year?: string;
  categoryId?: string | null;
  // Present only for videos that live on YouTube instead of as an uploaded
  // file — videoSrc is "" in that case and playback goes through an embed.
  youtubeId?: string;
};

export type SoundLink = {
  id: string;
  label: string;
  url: string;
};

export type Sound = {
  coverImage: string;
  showName: LocalizedText;
  showDescription: LocalizedText;
  role: LocalizedText;
  genre?: LocalizedText;
  hosts?: LocalizedText;
  links: SoundLink[];
};

export type SoundAudioCompare = {
  rawSrc: string;
  mixedSrc: string;
};

export type SoundEpisode = {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  date?: string;
  audioSrc?: string;
  youtubeId?: string;
  compare?: SoundAudioCompare;
};

export type AboutGalleryPhoto = {
  id: string;
  src: string;
  videoSrc?: string;
  caption: LocalizedText;
  width?: number;
  height?: number;
};

export type AboutSkillGroup = {
  id: string;
  category: LocalizedText;
  items: { zh: string[]; en: string[] };
};

export type AboutHero = {
  portraitSrc: string;
};

export type ContactVisual = {
  visualImage: string;
};

export type ContactLink = {
  id: string;
  label: string;
  url: string;
};

export type AboutTag = {
  id: string;
  zh: string;
  en: string;
};

export type AboutTimelineStep = {
  id: string;
  period: LocalizedText;
  title: LocalizedText;
  items: { zh: string[]; en: string[] };
  // 資料還沒補齊時顯示虛線框「【待補：…】」用的說明文字（例：專業經歷的期間與類型）
  placeholder?: LocalizedText;
};

export type AboutTool = {
  id: string;
  name: string;
  note: LocalizedText;
};

// 專案說明頁（/work/[slug]）。videoId 指向 videos.json 的影片，不複製影片資料。
// 文字欄位留空字串／空陣列＝還沒補，頁面會顯示「【待補：…】」佔位，不編造內容。
export type Project = {
  slug: string;
  videoId: string;
  type: LocalizedText;
  background: LocalizedText;
  tools: { zh: string[]; en: string[] };
  process: { zh: string[]; en: string[] };
  length: LocalizedText;
  outcome: LocalizedText;
};

export type FeaturedPhoto = {
  id: string;
  src: string;
  // A downsized copy for the filmstrip — src is full resolution (up to
  // 2400px). Every strip loads eagerly at fetchPriority="high", so a
  // large curated set of full-res files was blowing past mobile Safari's
  // per-tab memory budget and crashing the tab outright.
  thumbSrc?: string;
  // An even smaller copy (~500px tall) for the strip's resting, collapsed
  // state; thumbSrc is only fetched once a strip is actually opened.
  miniSrc?: string;
  caption: LocalizedText;
};

// 動態路由網址片段只能是純 ASCII 英數與連字號（中文會讓靜態站悄悄變成 404）。
// 資料不合規就在建置時直接失敗，並指出是哪一筆。
const SLUG_PATTERN = /^[A-Za-z0-9-]+$/;
function assertAsciiSlugs<T>(items: T[], source: string, pick: (item: T) => string): T[] {
  for (const item of items) {
    const slug = pick(item);
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(
        `[slug 檢查] ${source} 有不合規的 slug：「${slug}」。動態路由片段只能用英數與連字號（純 ASCII）。`,
      );
    }
  }
  return items;
}

export function getPhotos(): Photo[] {
  return photosData as Photo[];
}

export function getCategories(): Category[] {
  return assertAsciiSlugs(categoriesData as Category[], "content/categories.json（id）", (c) => c.id);
}

export function getVideos(): Video[] {
  return assertAsciiSlugs(videosData as Video[], "content/videos.json（slug）", (v) => v.slug);
}

export function getVideoCategories(): VideoCategory[] {
  return videoCategoriesData as VideoCategory[];
}

export function getSound(): Sound {
  return soundData as Sound;
}

export function getSoundEpisodes(): SoundEpisode[] {
  return soundEpisodesData as SoundEpisode[];
}

export function getAboutGallery(): AboutGalleryPhoto[] {
  return aboutGalleryData as AboutGalleryPhoto[];
}

export function getAboutSkills(): AboutSkillGroup[] {
  return aboutSkillsData as AboutSkillGroup[];
}

export function getAboutHero(): AboutHero {
  return aboutHeroData as AboutHero;
}

export function getContactVisual(): ContactVisual {
  return contactData as ContactVisual;
}

export function getContactLinks(): ContactLink[] {
  return contactLinksData as ContactLink[];
}

export function getAboutTags(): AboutTag[] {
  return aboutTagsData as AboutTag[];
}

export function getAboutPhilosophy(): AboutTag[] {
  return aboutPhilosophyData as AboutTag[];
}

export function getAboutTimeline(): AboutTimelineStep[] {
  return aboutTimelineData as AboutTimelineStep[];
}

export function getFeaturedPhotos(): FeaturedPhoto[] {
  return featuredPhotosData as FeaturedPhoto[];
}

// Graphic design (logos, business cards, etc.) reuses the exact Category/Photo
// shape as Photography — it's the same "categorised images with captions"
// model, just a separate content set so the two don't mix.
export function getDesignCategories(): Category[] {
  return designCategoriesData as Category[];
}

export function getDesignPhotos(): Photo[] {
  return designsData as Photo[];
}

export function getProjects(): Project[] {
  const projects = assertAsciiSlugs(projectsData as Project[], "content/projects.json（slug）", (p) => p.slug);
  const videoIds = new Set((videosData as Video[]).map((v) => v.id));
  for (const p of projects) {
    if (!videoIds.has(p.videoId)) {
      throw new Error(`[專案檢查] content/projects.json 的「${p.slug}」找不到對應影片 videoId：${p.videoId}`);
    }
  }
  return projects;
}

export function getProjectByVideoId(videoId: string): Project | undefined {
  return getProjects().find((p) => p.videoId === videoId);
}

export function getAboutTools(): AboutTool[] {
  return aboutToolsData as AboutTool[];
}
