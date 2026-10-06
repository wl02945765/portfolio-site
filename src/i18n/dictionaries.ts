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
