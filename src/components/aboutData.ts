import type { LocalizedText } from "@/lib/content";

export const heroTags: LocalizedText[] = [
  { zh: "視覺設計", en: "Visual Design" },
  { zh: "攝影", en: "Photography" },
  { zh: "影像製作", en: "Video" },
  { zh: "音訊製作", en: "Audio Production" },
];

export const philosophyLines: LocalizedText[] = [
  { zh: "設計，用視覺溝通。", en: "Design communicates through visuals." },
  { zh: "攝影，捕捉當下。", en: "Photography captures moments." },
  { zh: "影像，創造動態。", en: "Video creates movement." },
  { zh: "聲音，堆疊情感。", en: "Sound builds emotion." },
];

export type TimelineStep = {
  period: LocalizedText;
  title: LocalizedText;
  items?: LocalizedText[];
};

export const timeline: TimelineStep[] = [
  {
    period: { zh: "童年", en: "Childhood" },
    title: { zh: "攝影與藝術啟蒙", en: "Photography & Art Inspiration" },
  },
  {
    period: { zh: "高中", en: "High School" },
    title: { zh: "多媒體設計", en: "Multimedia Design" },
  },
  {
    period: { zh: "大學", en: "University" },
    title: { zh: "影視設計", en: "Film Design" },
  },
  {
    period: { zh: "畢業製作", en: "Graduation Project" },
    title: { zh: "音訊製作與聲音設計", en: "Audio Production & Sound Design" },
  },
  {
    period: { zh: "專業經歷", en: "Professional Experience" },
    title: { zh: "", en: "" },
    items: [
      { zh: "平面設計", en: "Graphic Design" },
      { zh: "商品攝影", en: "Product Photography" },
      { zh: "修圖", en: "Photo Retouching" },
      { zh: "影片製作", en: "Video Production" },
      { zh: "Podcast 音訊製作", en: "Podcast Audio Production" },
    ],
  },
];

