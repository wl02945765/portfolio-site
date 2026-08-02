import photosData from "../../content/photos.json";
import videosData from "../../content/videos.json";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type Photo = {
  id: string;
  src: string;
  category: string;
  caption: LocalizedText;
  beforeSrc?: string;
};

export type Video = {
  id: string;
  slug: string;
  thumbnail: string;
  videoSrc: string;
  title: LocalizedText;
  services: LocalizedText;
  year?: string;
};

export function getPhotos(): Photo[] {
  return photosData as Photo[];
}

export function getVideos(): Video[] {
  return videosData as Video[];
}
