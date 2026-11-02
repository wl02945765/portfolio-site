import siteText from "../../content/site-text.json";
import aiPageData from "../../content/aiPage.json";

export type Locale = "zh" | "en";

export type Dictionary = {
  brandName: string;
  nav: {
    aboutLabel: string;
    photographyLabel: string;
    designLabel: string;
    videoWorkLabel: string;
    soundLabel: string;
    contactLabel: string;
  };
  heroTitle: string;
  heroSlogan: string;
  heroCtaPhotography: string;
  heroCtaVideoWork: string;
  photography: {
    heading: string;
    empty: string;
    folderEmpty: string;
    backToPhotography: string;
  };
  design: {
    heading: string;
    empty: string;
    folderEmpty: string;
    backToDesign: string;
  };
  videoWork: {
    heading: string;
    empty: string;
    backToList: string;
    uncategorized: string;
  };
  sound: {
    heading: string;
    linksHeading: string;
    roleHeading: string;
    genreLabel: string;
    hostsLabel: string;
  };
  about: {
    heading: string;
    heroDescription: string;
    storyTitle: string;
    storyBody: string;
    timelineTitle: string;
    philosophyTitle: string;
    philosophyIntro: string;
    philosophyClosing: string;
    beyondTitle: string;
    beyondBody: string;
    skillsTitle: string;
    ctaText: string;
    ctaButton: string;
  };
  contact: {
    heading: string;
    intro: string;
    emailLabel: string;
    locationLabel: string;
    location: string;
    ctaButton: string;
    titleLead: string;
    titleAccent: string;
    directLabel: string;
    copyLabel: string;
    copiedLabel: string;
    typeQuestion: string;
    types: string[];
    budgetQuestion: string;
    budgets: string[];
    descQuestion: string;
    descPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    timelineLabel: string;
    timelinePlaceholder: string;
    submitButton: string;
    formError: string;
    previewTitle: string;
    previewHint: string;
    copyAll: string;
    openMail: string;
    mailSubject: string;
    mailGreeting: string;
    mailIntro: string;
    mailType: string;
    mailBudget: string;
    mailTimeline: string;
    mailUnset: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = siteText as Record<Locale, Dictionary>;

/**
 * AI 頁文案。
 * 刻意不放進 content/site-text.json：後台（admin）會讀寫那份檔案，
 * 預覽期間分開放比較不會被覆蓋，定案後再決定要不要併回去。
 */
export type AiPageCopy = {
  linkFromAbout: string;
  title: string;
  titleEn: string;
  intro: string;
  splitHeading: string;
  handTitle: string;
  handItems: string[];
  handNote: string;
  handNoteLink: string;
  aiTitle: string;
  aiItems: string[];
  editHeading: string;
  cardSubtitleTitle: string;
  cardSubtitleBody: string;
  cardMixTitle: string;
  cardMixBody: string;
  flowHeading: string;
  flowBadge: string;
  flowBody: string;
  flowSteps: string[];
  flowFootnote: string;
  siteHeading: string;
  siteBody: string;
  sitePoints: string[];
  learnHeading: string;
  learnIntro: string;
  learnHowLabel: string;
  learnTakeawayLabel: string;
  learnCards: { title: string; how: string; takeaway: string }[];
  builtHeading: string;
  builtIntro: string;
  builtRoleLabel: string;
  builtProjects: {
    title: string;
    subtitle: string;
    body: string;
    role: string;
    image: string;
    linkLabel?: string;
    linkHref?: string;
  }[];
  builtStudio: {
    title: string;
    subtitle: string;
    body: string;
    role: string;
    flowAria: string;
    flow: { task: string; assistant: string; specialists: string[]; lead: string; check: string; report: string };
  };
  backHeading: string;
  backLinks: { href: string; label: string }[];
};

export const aiPageCopy = aiPageData as unknown as Record<Locale, AiPageCopy>;

export const aboutGalleryCaption: Record<Locale, string> = {
  zh: "澳洲的朋友們｜在工作與生活之間，我認識了來自各國的朋友。",
  en: "Friends in Australia — people from all over the world I met through work and everyday life.",
};
