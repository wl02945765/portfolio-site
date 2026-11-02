// 求職版按鈕：高 48px、字 13px、金色焦點環（觸控 ≥44px、中文小字難讀）。
// 目前只套 Hero、Contact、專案頁；其餘頁等之後再統一。
const base =
  "inline-flex min-h-[48px] items-center justify-center rounded-full border px-8 text-[13px] font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c9a66b]";

export const btnPrimary = `${base} border-zinc-200 bg-zinc-200 text-black hover:bg-white`;
export const btnSecondary = `${base} border-zinc-500 text-zinc-300 hover:bg-zinc-300 hover:text-black`;
