// Post-processes the static export (out/) for Cloudflare Pages.
//
// Cloudflare Pages rejects any single file over 25 MiB. The only files that
// big are full video masters and podcast audio — never needed to render a
// page, only fetched once someone presses play. Those are removed from the
// Cloudflare upload and redirected to the same path on the GitHub Pages copy
// of the site, which keeps serving every file. Everything else (pages,
// images, preview loops) is served from Cloudflare's Taipei edge.
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "out";
const MAX_BYTES = 25 * 1024 * 1024;
const FALLBACK_ORIGIN = process.env.LARGE_MEDIA_ORIGIN || "https://wl02945765.github.io/portfolio-site";

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const redirects = [];
for (const file of walk(OUT_DIR)) {
  if (fs.statSync(file).size <= MAX_BYTES) continue;
  const urlPath = "/" + path.relative(OUT_DIR, file).split(path.sep).map(encodeURIComponent).join("/");
  redirects.push(`${urlPath} ${FALLBACK_ORIGIN}${urlPath} 302`);
  fs.unlinkSync(file);
}
fs.writeFileSync(path.join(OUT_DIR, "_redirects"), redirects.join("\n") + "\n");

// Media filenames are random UUIDs written once by the admin panel, so they
// can be cached for a long time; a week keeps the occasional in-place edit
// from sticking around forever.
fs.writeFileSync(
  path.join(OUT_DIR, "_headers"),
  [
    "/_next/static/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "/media/*",
    "  Cache-Control: public, max-age=604800",
    "",
  ].join("\n"),
);

console.log(`[cloudflare-postbuild] redirected ${redirects.length} file(s) over 25 MiB to ${FALLBACK_ORIGIN}`);
