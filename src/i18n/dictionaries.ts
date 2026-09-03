import siteText from "../../content/site-text.json";

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
    body: string;
    emailLabel: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = siteText as Record<Locale, Dictionary>;
