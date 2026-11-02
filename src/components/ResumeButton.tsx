import { RESUME_PATH } from "@/lib/resumePath";
import { withBasePath } from "@/lib/basePath";

type Props = {
  available: boolean;
  label: string;
  pendingLabel: string;
  pendingNote: string;
  className?: string;
};

/**
 * 履歷下載鈕。PDF 還沒放進 public/resume/ 之前顯示停用狀態＋【待補】說明，
 * 不做出點了會 404 的按鈕。
 */
export function ResumeButton({ available, label, pendingLabel, pendingNote, className = "" }: Props) {
  const base =
    "inline-flex min-h-[44px] items-center rounded-full border px-6 text-xs font-medium uppercase tracking-[0.15em]";
  if (available) {
    return (
      <a
        href={withBasePath(RESUME_PATH)}
        download
        className={`${base} border-zinc-300 text-zinc-300 transition-colors hover:bg-zinc-300 hover:text-black ${className}`}
      >
        {label}
      </a>
    );
  }
  return (
    <span className={`flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`${base} cursor-not-allowed border-dashed border-zinc-500 text-zinc-400`}
      >
        {pendingLabel}
      </button>
      <span className="font-mono text-xs text-zinc-400">{pendingNote}</span>
    </span>
  );
}
