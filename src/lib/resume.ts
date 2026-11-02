import fs from "node:fs";
import path from "node:path";

// 履歷 PDF 預定放在 public/resume/ching-huang-resume.pdf。
// 檔案還沒放之前，履歷按鈕顯示停用狀態，避免做出點了會 404 的按鈕。
// 只能在伺服器端（頁面的 server component）呼叫，建置時決定一次。
import { RESUME_PATH } from "@/lib/resumePath";

export function hasResume(): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", RESUME_PATH));
}
