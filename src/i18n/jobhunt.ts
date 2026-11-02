import type { Locale } from "./dictionaries";

/**
 * 求職版新增文案（Contact 雙模式、About 工具區）。
 * 刻意不放進 content/site-text.json：那份檔案原本由後台讀寫，分開放不會被覆蓋。
 * 文案來源：_review/positioning.md（T3）。標「待使用者確認」的句子一律採用不含推論的替代版。
 */

type ContactCopy = {
  tabHire: string;
  tabProject: string;
  tabsAria: string;
  tabHint: string;
  hireTitleLead: string;
  hireTitleAccent: string;
  hireIntro: string;
  hireCompany: string;
  hireCompanyPh: string;
  hireRole: string;
  hireRolePh: string;
  hireLink: string;
  hireLinkPh: string;
  hireMessage: string;
  hireMessagePh: string;
  hireOptionalNote: string;
  hireMailSubject: string;
  hireMailGreeting: string;
  hireMailIntro: string;
  hireMailCompany: string;
  hireMailRole: string;
  hireMailLink: string;
  basedIn: string;
  externalLinks: string;
};

export const contactCopy: Record<Locale, ContactCopy> = {
  zh: {
    tabHire: "招募洽詢",
    tabProject: "案子合作",
    tabsAria: "聯絡類型",
    tabHint: "全職或長期職缺請選「招募洽詢」，單次案子請選「案子合作」。",
    hireTitleLead: "聊聊",
    hireTitleAccent: "工作機會",
    hireIntro: "我正在找影像、剪輯、多媒體相關的工作。歡迎直接寄信，我會盡快回覆。",
    hireCompany: "公司",
    hireCompanyPh: "例：某某影像製作公司",
    hireRole: "職稱",
    hireRolePh: "例：影片剪輯師",
    hireLink: "職缺連結",
    hireLinkPh: "貼上 104、LinkedIn 或公司網頁連結",
    hireMessage: "想聊的事",
    hireMessagePh: "例：想約時間聊聊這個職缺",
    hireOptionalNote: "以下全部選填。",
    hireMailSubject: "求職",
    hireMailGreeting: "Ching 你好，",
    hireMailIntro: "我想和你聊聊工作機會：",
    hireMailCompany: "公司",
    hireMailRole: "職稱",
    hireMailLink: "職缺連結",
    basedIn: "住新北市樹林區",
    externalLinks: "外部連結",
  },
  en: {
    tabHire: "Hiring Inquiries",
    tabProject: "Project Collaboration",
    tabsAria: "Type of inquiry",
    tabHint: 'For full-time or long-term roles, choose "Hiring Inquiries"; for one-off projects, choose "Project Collaboration."',
    hireTitleLead: "Let's talk about",
    hireTitleAccent: "opportunities",
    hireIntro:
      "I'm looking for video, editing, and multimedia roles. Feel free to email me directly and I'll reply as soon as I can.",
    hireCompany: "Company",
    hireCompanyPh: "e.g. a video production studio",
    hireRole: "Role",
    hireRolePh: "e.g. Video Editor",
    hireLink: "Job link",
    hireLinkPh: "Paste a 104, LinkedIn, or company page link",
    hireMessage: "What you'd like to discuss",
    hireMessagePh: "e.g. I'd like to set up a time to talk about this role",
    hireOptionalNote: "Everything below is optional.",
    hireMailSubject: "Hiring",
    hireMailGreeting: "Hi Ching,",
    hireMailIntro: "I'd like to talk with you about an opportunity:",
    hireMailCompany: "Company",
    hireMailRole: "Role",
    hireMailLink: "Job link",
    basedIn: "Based in Shulin, New Taipei City",
    externalLinks: "Links",
  },
};

type AboutExtraCopy = {
  toolsHeading: string;
};

export const aboutExtraCopy: Record<Locale, AboutExtraCopy> = {
  zh: { toolsHeading: "常用工具" },
  en: { toolsHeading: "Tools I use" },
};
