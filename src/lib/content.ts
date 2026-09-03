import photosData from "../../content/photos.json";
import categoriesData from "../../content/categories.json";
import videosData from "../../content/videos.json";
import videoCategoriesData from "../../content/videoCategories.json";
import soundData from "../../content/sound.json";
import aboutGalleryData from "../../content/aboutGallery.json";
import aboutSkillsData from "../../content/aboutSkills.json";
import aboutHeroData from "../../content/aboutHero.json";
import aboutTagsData from "../../content/aboutTags.json";
import aboutPhilosophyData from "../../content/aboutPhilosophy.json";
import aboutTimelineData from "../../content/aboutTimeline.json";
import featuredPhotosData from "../../content/featuredPhotos.json";
import designCategoriesData from "../../content/designCategories.json";
import designsData from "../../content/designs.json";

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
  categoryId: string;
  caption: LocalizedText;
  beforeSrc?: string;
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
  videoSrc: string;
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
  links: SoundLink[];
};

export type AboutGalleryPhoto = {
  id: string;
  src: string;
  caption: LocalizedText;
};

export type AboutSkillGroup = {
  id: string;
  category: LocalizedText;
  items: { zh: string[]; en: string[] };
};

export type AboutHero = {
  portraitSrc: string;
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
};

export type FeaturedPhoto = {
  id: string;
  src: string;
  caption: LocalizedText;
};

export function getPhotos(): Photo[] {
  return photosData as Photo[];
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getVideos(): Video[] {
  return videosData as Video[];
}

export function getVideoCategories(): VideoCategory[] {
  return videoCategoriesData as VideoCategory[];
}

export function getSound(): Sound {
  return soundData as Sound;
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
