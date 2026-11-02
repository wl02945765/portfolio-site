import type { Metadata } from "next";
import Link from "next/link";

// 預設 404 頁的 title 會變成「404: This page could not be found.Ching's Profile」（少分隔符號）。
// 自訂一頁，title 與其他頁一致。
export const metadata: Metadata = {
  title: "找不到頁面｜Ching's Profile",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <h1 className="heading-font text-3xl font-medium text-zinc-100 sm:text-4xl">找不到這個頁面</h1>
      <p className="max-w-md text-sm leading-7 text-zinc-400">
        網址可能打錯了，或這個頁面已經搬家。可以回首頁，或直接看影片作品。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-500 px-8 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black"
        >
          回首頁
        </Link>
        <Link
          href="/video-work"
          className="inline-flex min-h-[44px] items-center rounded-full border border-zinc-500 px-8 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black"
        >
          影片作品
        </Link>
      </div>
    </div>
  );
}
