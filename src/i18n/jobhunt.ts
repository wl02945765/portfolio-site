import type { Locale } from "./dictionaries";

/**
 * 求職版新增文案（專案說明頁、Contact 雙模式、About 職能區）。
 * 刻意不放進 content/site-text.json：那份檔案原本由後台讀寫，分開放不會被覆蓋。
 * 文案來源：_review/positioning.md（T3）。標「待使用者確認」的句子一律採用不含推論的替代版。
 * 所有沒有資料的地方用 pending() 產生「【待補：…】」，不編造事實。
 */

export function pending(locale: Locale, label: string): string {
  return locale === "zh" ? `【待補：${label}】` : `[To fill: ${label}]`;
}

type WorkCopy = {
  listTitle: string;
  listIntro: string;
  listMetaTitle: string;
  featuredHeading: string;
  featuredAll: string;
  viewProject: string;
  backToList: string;
  watchPlay: string;
  watchOnYoutube: string;
  summaryLabel: string;
  summaryFallback: (year: string | undefined, services: string) => string;
  glanceRole: string;
  glanceTools: string;
  glanceLength: string;
  platformYoutube: string;
  backgroundHeading: string;
  roleHeading: string;
  roleTeamNote: string;
  toolsHeading: string;
  processHeading: string;
  outcomeHeading: string;
  outcomePlatform: string;
  prev: string;
  next: string;
  contactHire: string;
  pendingBackground: string;
  pendingType: string;
  pendingTools: string;
  pendingProcess: string;
  pendingLength: string;
  pendingOutcome: string;
  pendingRoleConfirm: string;
  projectNote: string;
};

export const workCopy: Record<Locale, WorkCopy> = {
  zh: {
    listTitle: "精選專案",
    listIntro: "挑出幾支代表作，說明我在每支作品裡負責什麼、怎麼做。",
    listMetaTitle: "精選專案｜Ching's Profile",
    featuredHeading: "精選專案",
    featuredAll: "看全部專案",
    viewProject: "專案說明",
    backToList: "返回精選專案",
    watchPlay: "播放影片",
    watchOnYoutube: "在 YouTube 上觀看 ↗",
    summaryLabel: "摘要",
    summaryFallback: (year, services) =>
      `${year ? `${year} 年作品，` : ""}我參與的項目：${services}。`,
    glanceRole: "我的角色",
    glanceTools: "使用工具",
    glanceLength: "片長與平台",
    platformYoutube: "YouTube",
    backgroundHeading: "背景",
    roleHeading: "我的角色",
    roleTeamNote: "團隊作品中，我與團隊各自負責的部分",
    toolsHeading: "使用工具",
    processHeading: "流程",
    outcomeHeading: "成果",
    outcomePlatform: "發布平台",
    prev: "上一個專案",
    next: "下一個專案",
    contactHire: "聯絡我（招募洽詢）",
    pendingBackground: "專案背景（2～3 句）",
    pendingType: "作品類型",
    pendingTools: "實際使用的軟體",
    pendingProcess: "3～5 步流程",
    pendingLength: "片長",
    pendingOutcome: "成品規格（長度、解析度）",
    pendingRoleConfirm: "請確認以上角色是否正確",
    projectNote: "專案說明",
  },
  en: {
    listTitle: "Selected Projects",
    listIntro: "A few representative pieces, and what I did on each one.",
    listMetaTitle: "Selected Projects | Ching's Profile",
    featuredHeading: "Selected Projects",
    featuredAll: "All projects",
    viewProject: "Project notes",
    backToList: "Back to Selected Projects",
    watchPlay: "Play video",
    watchOnYoutube: "Watch on YouTube ↗",
    summaryLabel: "Summary",
    summaryFallback: (year, services) => `${year ? `${year}. ` : ""}What I worked on: ${services}.`,
    glanceRole: "My role",
    glanceTools: "Tools",
    glanceLength: "Length & platform",
    platformYoutube: "YouTube",
    backgroundHeading: "Background",
    roleHeading: "My Role",
    roleTeamNote: "Who did what on this team project",
    toolsHeading: "Tools",
    processHeading: "Process",
    outcomeHeading: "Outcome",
    outcomePlatform: "Published on",
    prev: "Previous project",
    next: "Next project",
    contactHire: "Get in touch (hiring)",
    pendingBackground: "project background, 2–3 sentences",
    pendingType: "type of work",
    pendingTools: "software actually used",
    pendingProcess: "3–5 step process",
    pendingLength: "length",
    pendingOutcome: "final specs (length, resolution)",
    pendingRoleConfirm: "please confirm the roles above",
    projectNote: "Project notes",
  },
};

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
  resumeButton: string;
  resumePending: string;
  resumePendingNote: string;
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
    resumeButton: "下載履歷（PDF）",
    resumePending: "履歷整理中",
    resumePendingNote: "【待補：履歷 PDF】",
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
    resumeButton: "Download résumé (PDF)",
    resumePending: "Résumé in progress",
    resumePendingNote: "[To fill: résumé PDF]",
    basedIn: "Based in Shulin, New Taipei City",
    externalLinks: "Links",
  },
};

type AboutExtraCopy = {
  statusLine: string;
  toolsHeading: string;
  proficiencyPending: string;
  toolsNote: string;
  graduationLine: string;
  timelinePendingPrefix: string;
  resumeButton: string;
  resumePending: string;
  resumePendingNote: string;
  projectsLink: string;
  contactHire: string;
};

export const aboutExtraCopy: Record<Locale, AboutExtraCopy> = {
  zh: {
    statusLine: "我正在找影像、剪輯或多媒體相關的工作，也接少量案子。",
    toolsHeading: "常用工具",
    proficiencyPending: "熟練度【待補】",
    toolsNote: "熟練度由本人確認後填入。",
    graduationLine: "畢業製作時，我負責現場收音與聲音後期製作。",
    timelinePendingPrefix: "待補",
    resumeButton: "下載履歷（PDF）",
    resumePending: "履歷整理中",
    resumePendingNote: "【待補：履歷 PDF】",
    projectsLink: "看精選專案",
    contactHire: "聯絡我（招募洽詢）",
  },
  en: {
    statusLine: "I'm looking for video, editing, or multimedia roles, and I take on select freelance projects.",
    toolsHeading: "Tools I use",
    proficiencyPending: "Proficiency [TBD]",
    toolsNote: "Proficiency levels to be confirmed.",
    graduationLine: "For my graduation project, I handled location sound and audio post-production.",
    timelinePendingPrefix: "To fill",
    resumeButton: "Download résumé (PDF)",
    resumePending: "Résumé in progress",
    resumePendingNote: "[To fill: résumé PDF]",
    projectsLink: "Selected projects",
    contactHire: "Get in touch (hiring)",
  },
};
