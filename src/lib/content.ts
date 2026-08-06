import photosData from "../../content/photos.json";
import categoriesData from "../../content/categories.json";
import videosData from "../../content/videos.json";
import videoCategoriesData from "../../content/videoCategories.json";
import soundData from "../../content/sound.json";

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
