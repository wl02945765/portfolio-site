import siteText from "../../content/site-text.json";

export type Locale = "zh" | "en";

export type Dictionary = {
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
  videoWork: {
    heading: string;
    empty: string;
    backToList: string;
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
