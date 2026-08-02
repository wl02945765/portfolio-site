export type Locale = "zh" | "en";

export type Dictionary = {
  heroTitle: string;
  heroSlogan: string;
  heroCtaPhotography: string;
  heroCtaVideoWork: string;
  photography: {
    heading: string;
    empty: string;
    allCategory: string;
  };
  videoWork: {
    heading: string;
    empty: string;
    backToList: string;
  };
  about: {
    heading: string;
    body: string;
  };
  contact: {
    heading: string;
    body: string;
    emailLabel: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    heroTitle: "CHING'S PROFILE",
    heroSlogan: "攝影・修圖・影片剪輯・混音後期，一站找到你要的",
    heroCtaPhotography: "查看照片作品",
    heroCtaVideoWork: "查看影片作品",
    photography: {
      heading: "PHOTOGRAPHY",
      empty: "作品準備中，敬請期待。",
      allCategory: "全部",
    },
    videoWork: {
      heading: "VIDEO WORK",
      empty: "作品準備中，敬請期待。",
      backToList: "返回作品列表",
    },
    about: {
      heading: "ABOUT",
      body: "影視設計背景出身，橫跨攝影、修圖、影片剪輯與 Podcast 混音。無論是單一環節的協助，或是從企劃、攝影、燈光佈置、場地協調到後期混音的完整製作，都能一手包辦。",
    },
    contact: {
      heading: "CONTACT",
      body: "想討論案子規模或報價，歡迎直接聯繫。",
      emailLabel: "Email",
    },
  },
  en: {
    heroTitle: "CHING'S PROFILE",
    heroSlogan: "Photography · Retouching · Video Editing · Audio Mixing — one stop for it all",
    heroCtaPhotography: "View Photography",
    heroCtaVideoWork: "View Video Work",
    photography: {
      heading: "PHOTOGRAPHY",
      empty: "Work in progress — check back soon.",
      allCategory: "All",
    },
    videoWork: {
      heading: "VIDEO WORK",
      empty: "Work in progress — check back soon.",
      backToList: "Back to all work",
    },
    about: {
      heading: "ABOUT",
      body: "Background in film & media design, working across photography, retouching, video editing, and podcast mixing. Available for a single piece of the puzzle, or full production — planning, shooting, lighting, location scouting, and post — start to finish.",
    },
    contact: {
      heading: "CONTACT",
      body: "For project scope or quotes, feel free to reach out directly.",
      emailLabel: "Email",
    },
  },
};
