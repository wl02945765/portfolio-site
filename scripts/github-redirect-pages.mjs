// Turns the GitHub Pages copy of the site into a redirect to Cloudflare Pages.
//
// The site moved to Cloudflare Pages (served from Taipei, ~5-30x faster here
// than GitHub Pages' Singapore edge), but the old github.io links are
// already out on business cards and profiles. Every HTML page in the GitHub
// build is replaced by a tiny page that forwards to the same path on
// Cloudflare. Media files are left untouched on purpose: Cloudflare 302s its
// >25 MiB files (video masters, podcast audio) back to this copy.
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "out";
const TARGET_ORIGIN = process.env.REDIRECT_TARGET_ORIGIN || "https://ching-profile.pages.dev";
const BASE_PATH = process.env.GITHUB_PAGES_BASE_PATH || "";

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

let count = 0;
for (const file of walk(OUT_DIR)) {
  if (!file.endsWith(".html")) continue;
  const rel = path.relative(OUT_DIR, file).split(path.sep).join("/");
  // "about/index.html" -> "/about/", "index.html" -> "/", "404.html" -> "/"
  const pagePath = rel === "404.html" ? "/" : "/" + rel.replace(/index\.html$/, "");
  const target = TARGET_ORIGIN + pagePath;
  // The script keeps the visitor's exact path/query/hash (including the 404
  // page, which GitHub serves for any unknown URL); the meta refresh is the
  // no-JavaScript fallback.
  const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>Ching's Profile</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${escape(target)}">
<meta http-equiv="refresh" content="0; url=${escape(target)}">
<script>
(function () {
  var base = ${JSON.stringify(BASE_PATH)};
  var p = location.pathname;
  if (base && p.indexOf(base) === 0) p = p.slice(base.length) || "/";
  location.replace(${JSON.stringify(TARGET_ORIGIN)} + p + location.search + location.hash);
})();
</script>
</head>
<body style="background:#000;color:#aaa;font-family:sans-serif">
<p>網站已搬家，正在前往 <a href="${escape(target)}" style="color:#fff">${escape(target)}</a></p>
</body>
</html>
`;
  fs.writeFileSync(file, html);
  count += 1;
}
console.log(`[github-redirect-pages] ${count} HTML page(s) now redirect to ${TARGET_ORIGIN}`);
