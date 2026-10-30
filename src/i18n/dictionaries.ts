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

export const aiPageCopy: Record<Locale, AiPageCopy> = {
  zh: {
    linkFromAbout: "我也會用 AI 當幫手 →",
    title: "我怎麼用 AI 當幫手",
    titleEn: "Working with AI",
    intro:
      "修圖、攝影、剪輯與聲音後製，是我親手做的事。AI 是我的幫手，幫我產生字幕初稿、排好音軌、處理下載上傳這類重複步驟；畫面和聲音怎麼取捨，由我決定。這個網站則是我和 AI 一起寫出來的。這一頁說明我們怎麼分工。",
    splitHeading: "分工",
    handTitle: "我親手做",
    handItems: ["修圖", "攝影", "剪輯", "混音", "畫面與聲音的取捨"],
    handNote: "修圖與攝影全程手作",
    handNoteLink: "看作品",
    aiTitle: "AI 幫我做",
    aiItems: ["字幕初稿", "把多軌音檔排好並匯出", "下載、上傳、通知這類重複步驟", "和我一起寫這個網站"],
    editHeading: "剪輯的幫手",
    cardSubtitleTitle: "自動字幕",
    cardSubtitleBody: "用本機語音辨識先產生字幕初稿，再由我逐句校對、調整斷句。AI 省下的是打字的時間，不是檢查的時間。",
    cardMixTitle: "音軌排列與匯出",
    cardMixBody: "多人錄音的軌道，用腳本自動對齊、排進 Audition 並匯出。混音的聽感與取捨，是我自己決定。",
    flowHeading: "流程自動化",
    flowBadge: "效率",
    flowBody: "每週固定要處理的 Podcast 檔案，我把重複的搬運步驟串成一條流程，讓時間留給真正需要判斷的地方。",
    flowSteps: ["偵測", "下載", "對齊", "排軌", "匯出", "上傳", "通知"],
    flowFootnote: "這是效率工具，不是社群貼文排程。",
    siteHeading: "這個網站是和 AI 一起做的",
    siteBody: "這是我作品集裡唯一由 AI 協助製作的作品。設計方向、版面取捨與內容由我決定，程式由 AI 協助撰寫。",
    sitePoints: ["Next.js 靜態網站", "自己的後台，一鍵上傳與排序", "照片自動轉檔、影片自動壓縮"],
    learnHeading: "正在學的 AI",
    learnIntro:
      "我把 AI 當成每天練習的工具，而不是一次學完的技能。做法是先拿自己真正遇到的重複工作當題目，再一步步讓 AI 幫忙。",
    learnHowLabel: "做法",
    learnTakeawayLabel: "心得",
    learnCards: [
      {
        title: "Claude Code",
        how: "把常做的步驟寫成可重複的指令與流程，並加上防呆，例如提交程式前自動檢查有沒有不小心帶到密碼或金鑰。",
        takeaway: "AI 說「做好了」不等於做好了。我習慣要求它附上證據，像是指令輸出或檔案，再自己確認。",
      },
      {
        title: "Agent 工作室",
        how: "在自己電腦上做的多角色分工練習環境：由一位特助接任務，分給不同專長的角色，如設計、影像、研究、工程，再由另一個角色查核。",
        takeaway: "分工之後，錯誤比較容易被抓到；但最後的取捨，還是要由人來決定。",
      },
      {
        title: "自動化流程",
        how: "把每週固定的 Podcast 檔案處理，從偵測、下載、對齊、排軌、匯出到上傳通知，串成一條流程。",
        takeaway: "先自己手動做熟，才知道哪一步可以交給電腦，哪一步要自己聽。",
      },
    ],
    builtHeading: "我用 AI 做出來的東西",
    builtIntro: "這些是我提出需求與想法、由 AI 協助實作的小專案。我負責說清楚問題、測試結果並回報修正。",
    builtRoleLabel: "我的角色",
    builtProjects: [
      {
        title: "露營日誌",
        subtitle: "苗栗懶人露營十選",
        body: "為 5 位大人一晚的露營行程，從 25 間苗栗營區挑出 10 間，逐一查過能不能訂，整理成可排序、可篩選的比較頁，附 Google 評論整理與導航連結。",
        role: "我負責提出需求與使用情境，並測試與回報問題；AI 協助實作。",
        image: "/media/ai-projects/camp-journal.webp",
        linkLabel: "查看網頁",
        linkHref: "https://claude.ai/artifact/PfKttqjPTKpFAmGuCWRQtG",
      },
      {
        title: "散場回家指南",
        subtitle: "高雄回家住宿",
        body: "演唱會散場後末班車已過，整理高雄 22:30 後的列車、隔天回台北的班次，以及 30 間可半夜入住的台南住宿，兩個人可以即時同步各自的選擇。",
        role: "我負責提出需求與使用情境，並測試與回報問題；AI 協助實作。",
        image: "/media/ai-projects/ride-home.webp",
      },
    ],
    builtStudio: {
      title: "多角色 AI 協作工作室",
      subtitle: "個人練習環境",
      body: "在自己電腦上做的分工練習：一位特助接下任務、判斷難易度，再分給設計、影像、研究、工程等角色；做完先由主管審，最後由另一個角色獨立查核，並重新跑一次證據。",
      role: "我負責設計這套分工與規則，並驗收結果；AI 協助實作。",
      flowAria: "流程圖：任務交給特助分級，再分給設計、影像、研究、工程等專業角色，接著由主管審、獨立查核，最後回報給我。",
      flow: {
        task: "任務",
        assistant: "特助（分級）",
        specialists: ["設計", "影像", "研究", "工程"],
        lead: "主管審",
        check: "獨立查核",
        report: "回報給我",
      },
    },
    backHeading: "回到作品",
    backLinks: [
      { href: "/photography", label: "攝影與修圖" },
      { href: "/video-work", label: "影片作品" },
      { href: "/sound", label: "聲音" },
      { href: "/contact", label: "聯絡我" },
    ],
  },
  en: {
    linkFromAbout: "I also work with AI as an assistant →",
    title: "Working with AI",
    titleEn: "我怎麼用 AI 當幫手",
    intro:
      "Retouching, photography, editing and sound are what I do by hand. AI is my assistant for subtitle drafts, track layout and repetitive file steps; the creative calls are mine. This website is the one thing I built together with AI. Here is how we split the work.",
    splitHeading: "Who does what",
    handTitle: "By my hand",
    handItems: ["Retouching", "Photography", "Editing", "Mixing", "Picture and sound decisions"],
    handNote: "Retouching and photography are 100% hand-made",
    handNoteLink: "See the work",
    aiTitle: "AI helps with",
    aiItems: [
      "Subtitle drafts",
      "Laying out and exporting multitrack audio",
      "Repetitive download / upload / notify steps",
      "Building this website with me",
    ],
    editHeading: "Helpers for editing",
    cardSubtitleTitle: "Auto subtitles",
    cardSubtitleBody:
      "Local speech recognition produces a first draft; I proofread every line and fix the line breaks. AI saves typing time, not checking time.",
    cardMixTitle: "Track layout & export",
    cardMixBody:
      "A script aligns multi-person recordings, lays them out in Audition and exports. How the mix sounds, and what to keep, is my call.",
    flowHeading: "Workflow automation",
    flowBadge: "Efficiency",
    flowBody:
      "For a weekly podcast, I chained the repetitive file-handling steps into one flow, so my time goes to the parts that need judgment.",
    flowSteps: ["Detect", "Download", "Align", "Layout", "Export", "Upload", "Notify"],
    flowFootnote: "An efficiency tool, not a social-media scheduler.",
    siteHeading: "This website was built with AI",
    siteBody:
      "It is the only piece in my portfolio made with AI assistance. Design direction, layout and content are mine; AI helped write the code.",
    sitePoints: [
      "Next.js static site",
      "My own admin: one-step upload and sorting",
      "Photos auto-converted, videos auto-compressed",
    ],
    learnHeading: "What I'm learning",
    learnIntro:
      "I treat AI as a tool I practice every day, not a skill I finish learning once. I start from the repetitive work I actually run into, then let AI help one step at a time.",
    learnHowLabel: "How",
    learnTakeawayLabel: "Takeaway",
    learnCards: [
      {
        title: "Claude Code",
        how: "I turn steps I repeat into reusable commands and workflows, with safeguards such as an automatic check that stops passwords or keys from being committed by accident.",
        takeaway: "When AI says it's done, it isn't necessarily done. I ask for evidence, such as command output or files, and check it myself.",
      },
      {
        title: "Agent Studio",
        how: "A multi-role practice setup on my own computer: an assistant takes the task, hands it to roles with different specialties such as design, video, research and engineering, and another role reviews the result.",
        takeaway: "Splitting the work makes mistakes easier to catch, but the final judgment still belongs to a person.",
      },
      {
        title: "Workflow automation",
        how: "I chained the weekly Podcast file handling — detect, download, align, arrange tracks, export, upload and notify — into one workflow.",
        takeaway: "Only after doing it by hand do I know which steps to hand to the computer and which ones I need to listen to myself.",
      },
    ],
    builtHeading: "Things I built with AI",
    builtIntro:
      "Small projects where I defined the idea and the problem, and AI helped build them. I explain the need, test the result and report what to fix.",
    builtRoleLabel: "My role",
    builtProjects: [
      {
        title: "Camp Journal",
        subtitle: "Miaoli Easy Glamping: Top 10",
        body: "A comparison page for a one-night trip for five adults: 10 of 25 Miaoli campsites, each checked for availability, sortable and filterable, with review summaries and navigation links.",
        role: "I defined the needs and use cases and tested the results; AI helped with the implementation.",
        image: "/media/ai-projects/camp-journal.webp",
        linkLabel: "View",
        linkHref: "https://claude.ai/artifact/PfKttqjPTKpFAmGuCWRQtG",
      },
      {
        title: "After-Show Ride Home",
        subtitle: "Kaohsiung Ride-Home Stay",
        body: "After a concert ended past the last trains, this page lists trains leaving Kaohsiung after 22:30, next-day trains back to Taipei, and 30 Tainan stays with late check-in. Two people can sync their picks in real time.",
        role: "I defined the needs and use cases and tested the results; AI helped with the implementation.",
        image: "/media/ai-projects/ride-home.webp",
      },
    ],
    builtStudio: {
      title: "Multi-Agent Studio",
      subtitle: "A personal practice setup",
      body: "A practice setup on my own computer: an assistant takes a task, judges how hard it is, and hands it to roles such as design, video, research and engineering. A lead reviews the work, then another role checks it independently and reruns the evidence.",
      role: "I designed the roles and rules and checked the results; AI helped with the implementation.",
      flowAria: "Flow chart: a task goes to an assistant for triage, then to specialists in design, video, research and engineering, followed by lead review, an independent check, and a report back to me.",
      flow: {
        task: "Task",
        assistant: "Assistant (triage)",
        specialists: ["Design", "Video", "Research", "Engineering"],
        lead: "Lead review",
        check: "Independent check",
        report: "Report",
      },
    },
    backHeading: "Back to the work",
    backLinks: [
      { href: "/photography", label: "Photo & Retouch" },
      { href: "/video-work", label: "Video Work" },
      { href: "/sound", label: "Sound" },
      { href: "/contact", label: "Contact" },
    ],
  },
};

/** About「生活與旅行」的吉他影片說明（同上，分開放避免被後台覆蓋）。 */
export const aboutGuitarVideo: Record<Locale, { caption: string; playLabel: string }> = {
  zh: { caption: "夜晚的海邊，和弟弟、媽媽一起彈吉他（左邊第一位是我）", playLabel: "播放影片" },
  en: { caption: "An evening by the sea, playing guitar with my brother and mom (I'm first from the left)", playLabel: "Play video" },
};

export const aboutGalleryCaption: Record<Locale, string> = {
  zh: "澳洲的朋友們｜在工作與生活之間，我認識了來自各國的朋友。",
  en: "Friends in Australia — people from all over the world I met through work and everyday life.",
};
