import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const MEDIA_DIR = path.join(ROOT, "public", "media");
const PHOTOS_JSON = path.join(CONTENT_DIR, "photos.json");
const CATEGORIES_JSON = path.join(CONTENT_DIR, "categories.json");
const VIDEOS_JSON = path.join(CONTENT_DIR, "videos.json");
const VIDEO_CATEGORIES_JSON = path.join(CONTENT_DIR, "videoCategories.json");
const SITE_TEXT_JSON = path.join(CONTENT_DIR, "site-text.json");
const SOUND_JSON = path.join(CONTENT_DIR, "sound.json");
const PHOTOS_DIR = path.join(MEDIA_DIR, "photos");
const VIDEOS_DIR = path.join(MEDIA_DIR, "videos");
const THUMBS_DIR = path.join(VIDEOS_DIR, "thumbs");
const SOUND_DIR = path.join(MEDIA_DIR, "sound");

for (const dir of [PHOTOS_DIR, VIDEOS_DIR, THUMBS_DIR, SOUND_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function uniqueSlug(base, existing) {
  let slug = base;
  let n = 2;
  const taken = new Set(existing.map((v) => v.slug));
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

// Camera-original photos (5-8MB, HEIC) were pinning visitors' CPUs and
// rendering as broken images in every non-Safari browser. Every upload now
// gets converted to JPEG and downsized to something reasonable for web
// display, using macOS's built-in `sips` (same pattern as the ffmpeg call
// below for video thumbnails — a system tool, not another npm dependency).
const MAX_PHOTO_DIMENSION = 2400;
const JPEG_QUALITY = 82;

function getImageDimensions(filePath) {
  const result = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", filePath]);
  const out = result.stdout?.toString() || "";
  return {
    width: Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0),
    height: Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0),
  };
}

// Converts HEIC/HEIF to JPEG and downsizes anything larger than
// MAX_PHOTO_DIMENSION, in place. Returns the filename to use (unchanged
// unless the format was converted). Never upscales smaller images.
function optimizePhoto(dir, filename) {
  const ext = path.extname(filename).toLowerCase();
  let filePath = path.join(dir, filename);
  let outFilename = filename;

  if (ext === ".heic" || ext === ".heif") {
    outFilename = filename.slice(0, -ext.length) + ".jpg";
    const outPath = path.join(dir, outFilename);
    spawnSync("sips", ["-s", "format", "jpeg", filePath, "--out", outPath]);
    fs.unlinkSync(filePath);
    filePath = outPath;
  }

  const { width, height } = getImageDimensions(filePath);
  if (Math.max(width, height) > MAX_PHOTO_DIMENSION) {
    spawnSync("sips", [
      "-Z",
      String(MAX_PHOTO_DIMENSION),
      "--setProperty",
      "formatOptions",
      String(JPEG_QUALITY),
      filePath,
    ]);
  }

  return outFilename;
}

// Camera-original videos (raw H.264/ProRes, hundreds of MB to 1GB+) were
// committed straight into git by auto-publish — pushing that much binary
// data to GitHub over normal home upload bandwidth just hangs, and any
// single file over 100MB is hard-rejected by GitHub regardless. Every
// upload now gets transcoded to a web-friendly H.264/AAC mp4 capped at
// 1080p (never upscales smaller sources) before it's ever written to
// content/videos.json or handed to git.
const VIDEO_MAX_WIDTH = 1920;
const VIDEO_MAX_HEIGHT = 1080;
// CRF 23 + a 4M maxrate cap was visibly blocky on high-motion footage (drone,
// racing) — CRF 23 is already a fairly compressed target, and the low cap
// throttled it further right when fast motion needed the most bits. CRF 18
// is close to visually lossless for x264, "slow" trades encode time for
// better quality-per-bit, and 12M only bounds worst-case runaway bitrate
// rather than actively capping normal scenes.
const VIDEO_CRF = 18;

function compressVideo(dir, filename) {
  const inputPath = path.join(dir, filename);
  const ext = path.extname(filename).toLowerCase();
  const base = filename.slice(0, -ext.length) || filename;
  const finalFilename = `${base}.mp4`;
  const tmpPath = path.join(dir, `${base}.compressing.mp4`);

  const result = spawnSync("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-vf",
    `scale=${VIDEO_MAX_WIDTH}:${VIDEO_MAX_HEIGHT}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
    "-c:v",
    "libx264",
    "-crf",
    String(VIDEO_CRF),
    "-preset",
    "slow",
    "-maxrate",
    "12M",
    "-bufsize",
    "24M",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    tmpPath,
  ]);

  if (result.status !== 0 || !fs.existsSync(tmpPath)) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error("[video] ffmpeg compression failed, keeping raw upload:", result.stderr?.toString().slice(-2000));
    return filename;
  }

  fs.unlinkSync(inputPath);
  fs.renameSync(tmpPath, path.join(dir, finalFilename));
  return finalFilename;
}

// Recursively merges a partial nested patch (e.g. { zh: { photography: { heading: "..." } } })
// into the existing site-text object, leaving every other field untouched.
function deepMerge(target, patch) {
  for (const key of Object.keys(patch)) {
    const value = patch[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] && typeof target[key] === "object" ? target[key] : {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

// ---------- Auto-publish ----------
// Debounces rapid edits (multiple uploads, several caption tweaks) into a
// single commit+push, instead of triggering a GitHub Actions run per click.

const PUBLISH_DEBOUNCE_MS = 4000;
let publishTimer = null;
let publishState = { pending: false, publishing: false, lastPublishedAt: null, lastError: null };

function schedulePublish() {
  publishState.pending = true;
  if (publishTimer) clearTimeout(publishTimer);
  publishTimer = setTimeout(runPublish, PUBLISH_DEBOUNCE_MS);
}

function runPublish() {
  publishTimer = null;
  publishState.pending = false;
  publishState.publishing = true;
  publishState.lastError = null;
  try {
    execSync(
      "git add content/photos.json content/categories.json content/videos.json content/videoCategories.json content/site-text.json content/sound.json public/media",
      { cwd: ROOT },
    );
    const diff = spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: ROOT });
    if (diff.status === 0) {
      return; // nothing changed
    }
    execSync('git commit -m "Auto-publish from admin panel"', { cwd: ROOT });

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      publishState.lastError = "GITHUB_TOKEN 未設定，內容已 commit 但沒有 push";
      return;
    }
    const authHeader = Buffer.from(`x-access-token:${token}`).toString("base64");
    execSync(
      `git -c http.extraheader="AUTHORIZATION: basic ${authHeader}" push origin main`,
      { cwd: ROOT, stdio: "pipe" },
    );
    publishState.lastPublishedAt = new Date().toISOString();
  } catch (err) {
    publishState.lastError = err.message;
    console.error("[publish] failed:", err.message);
  } finally {
    publishState.publishing = false;
  }
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/media", express.static(MEDIA_DIR));

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: PHOTOS_DIR,
    filename: (_req, file, cb) =>
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: VIDEOS_DIR,
    filename: (_req, file, cb) =>
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  // Raw camera originals routinely exceed 1GB; compressVideo() transcodes
  // every upload down to a web-sized mp4 regardless of source size, so this
  // cap only needs to guard against runaway disk usage, not gate quality.
  limits: { fileSize: 20 * 1024 * 1024 * 1024 },
});

const soundCoverUpload = multer({
  storage: multer.diskStorage({
    destination: SOUND_DIR,
    filename: (_req, file, cb) =>
      cb(null, `cover-${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.get("/api/publish-status", (_req, res) => {
  res.json(publishState);
});

// ---------- Site text ----------

app.get("/api/site-text", (_req, res) => {
  res.json(readJSON(SITE_TEXT_JSON));
});

app.patch("/api/site-text", (req, res) => {
  const data = readJSON(SITE_TEXT_JSON);
  deepMerge(data, req.body);
  writeJSON(SITE_TEXT_JSON, data);
  schedulePublish();
  res.json(data);
});

// ---------- Sound (single-show page: cover, copy, and platform links) ----------

app.get("/api/sound", (_req, res) => {
  res.json(readJSON(SOUND_JSON));
});

app.patch("/api/sound", (req, res) => {
  const data = readJSON(SOUND_JSON);
  const { links, ...textPatch } = req.body; // links have their own endpoints below
  deepMerge(data, textPatch);
  writeJSON(SOUND_JSON, data);
  schedulePublish();
  res.json(data);
});

app.post("/api/sound/cover", soundCoverUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "missing file" });
  const data = readJSON(SOUND_JSON);
  if (data.coverImage) {
    const oldPath = path.join(ROOT, "public", data.coverImage);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  data.coverImage = `/media/sound/${req.file.filename}`;
  writeJSON(SOUND_JSON, data);
  schedulePublish();
  res.json(data);
});

app.post("/api/sound/links", (req, res) => {
  const data = readJSON(SOUND_JSON);
  const link = { id: randomUUID(), label: req.body.label || "", url: req.body.url || "" };
  data.links.push(link);
  writeJSON(SOUND_JSON, data);
  schedulePublish();
  res.json(link);
});

app.patch("/api/sound/links/:id", (req, res) => {
  const data = readJSON(SOUND_JSON);
  const link = data.links.find((l) => l.id === req.params.id);
  if (!link) return res.status(404).json({ error: "not found" });
  if (req.body.label !== undefined) link.label = req.body.label;
  if (req.body.url !== undefined) link.url = req.body.url;
  writeJSON(SOUND_JSON, data);
  schedulePublish();
  res.json(link);
});

app.delete("/api/sound/links/:id", (req, res) => {
  const data = readJSON(SOUND_JSON);
  data.links = data.links.filter((l) => l.id !== req.params.id);
  writeJSON(SOUND_JSON, data);
  schedulePublish();
  res.json({ ok: true });
});

app.post("/api/sound/links/reorder", (req, res) => {
  const { order } = req.body;
  const data = readJSON(SOUND_JSON);
  const byId = new Map(data.links.map((l) => [l.id, l]));
  data.links = order.map((id) => byId.get(id)).filter(Boolean);
  writeJSON(SOUND_JSON, data);
  schedulePublish();
  res.json(data.links);
});

// ---------- Categories ----------

app.get("/api/categories", (_req, res) => {
  res.json(readJSON(CATEGORIES_JSON));
});

app.post("/api/categories", (req, res) => {
  const categories = readJSON(CATEGORIES_JSON);
  const entry = {
    id: randomUUID(),
    name: { zh: req.body.name_zh || "", en: req.body.name_en || "" },
    description: { zh: req.body.description_zh || "", en: req.body.description_en || "" },
    location: { zh: req.body.location_zh || "", en: req.body.location_en || "" },
    coverPhotoId: null,
  };
  categories.push(entry);
  writeJSON(CATEGORIES_JSON, categories);
  schedulePublish();
  res.json(entry);
});

app.patch("/api/categories/:id", (req, res) => {
  const categories = readJSON(CATEGORIES_JSON);
  const item = categories.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  if (req.body.name_zh !== undefined) item.name.zh = req.body.name_zh;
  if (req.body.name_en !== undefined) item.name.en = req.body.name_en;
  if (req.body.description_zh !== undefined) item.description.zh = req.body.description_zh;
  if (req.body.description_en !== undefined) item.description.en = req.body.description_en;
  if (req.body.location_zh !== undefined) item.location.zh = req.body.location_zh;
  if (req.body.location_en !== undefined) item.location.en = req.body.location_en;
  writeJSON(CATEGORIES_JSON, categories);
  schedulePublish();
  res.json(item);
});

app.post("/api/categories/:id/set-cover", (req, res) => {
  const { photoId } = req.body;
  const categories = readJSON(CATEGORIES_JSON);
  const category = categories.find((c) => c.id === req.params.id);
  if (!category) return res.status(404).json({ error: "category not found" });
  const photos = readJSON(PHOTOS_JSON);
  const photo = photos.find((p) => p.id === photoId && p.categoryId === category.id);
  if (!photo) return res.status(400).json({ error: "photo not in this category" });
  category.coverPhotoId = photoId;
  writeJSON(CATEGORIES_JSON, categories);
  schedulePublish();
  res.json(category);
});

app.delete("/api/categories/:id", (req, res) => {
  const categories = readJSON(CATEGORIES_JSON);
  const photos = readJSON(PHOTOS_JSON);
  const hasPhotos = photos.some((p) => p.categoryId === req.params.id);
  if (hasPhotos) {
    return res
      .status(400)
      .json({ error: "category still has photos — delete or move them first" });
  }
  writeJSON(
    CATEGORIES_JSON,
    categories.filter((c) => c.id !== req.params.id),
  );
  schedulePublish();
  res.json({ ok: true });
});

// ---------- Photos ----------

app.get("/api/photos", (_req, res) => {
  res.json(readJSON(PHOTOS_JSON));
});

app.post("/api/categories/:id/photos", photoUpload.array("files", 30), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "missing files" });
  }
  const categories = readJSON(CATEGORIES_JSON);
  const category = categories.find((c) => c.id === req.params.id);
  if (!category) return res.status(404).json({ error: "category not found" });

  const photos = readJSON(PHOTOS_JSON);
  const created = req.files.map((file) => {
    const filename = optimizePhoto(PHOTOS_DIR, file.filename);
    return {
      id: randomUUID(),
      src: `/media/photos/${filename}`,
      categoryId: category.id,
      caption: { zh: "", en: "" },
    };
  });
  photos.push(...created);
  writeJSON(PHOTOS_JSON, photos);

  if (!category.coverPhotoId) {
    category.coverPhotoId = created[0].id;
    writeJSON(CATEGORIES_JSON, categories);
  }

  schedulePublish();
  res.json(created);
});

app.patch("/api/photos/:id", (req, res) => {
  const photos = readJSON(PHOTOS_JSON);
  const item = photos.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  if (req.body.caption_zh !== undefined) item.caption.zh = req.body.caption_zh;
  if (req.body.caption_en !== undefined) item.caption.en = req.body.caption_en;
  writeJSON(PHOTOS_JSON, photos);
  schedulePublish();
  res.json(item);
});

app.delete("/api/photos/:id", (req, res) => {
  const photos = readJSON(PHOTOS_JSON);
  const item = photos.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  const filePath = path.join(ROOT, "public", item.src);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  writeJSON(
    PHOTOS_JSON,
    photos.filter((p) => p.id !== req.params.id),
  );

  const categories = readJSON(CATEGORIES_JSON);
  const category = categories.find((c) => c.id === item.categoryId);
  if (category && category.coverPhotoId === item.id) {
    const remaining = photos.filter(
      (p) => p.categoryId === item.categoryId && p.id !== item.id,
    );
    category.coverPhotoId = remaining[0]?.id ?? null;
    writeJSON(CATEGORIES_JSON, categories);
  }

  schedulePublish();
  res.json({ ok: true });
});

app.post("/api/photos/reorder", (req, res) => {
  // `order` only lists the ids of one category's photos (that's all the admin
  // UI shows at a time) — reorder just that subsequence in place, keeping
  // every other category's photos exactly where they were.
  const { order } = req.body;
  const photos = readJSON(PHOTOS_JSON);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const reorderedSubset = order.map((id) => byId.get(id)).filter(Boolean);
  const orderSet = new Set(order);

  let cursor = 0;
  const result = photos.map((p) => (orderSet.has(p.id) ? reorderedSubset[cursor++] : p));

  writeJSON(PHOTOS_JSON, result);
  schedulePublish();
  res.json(result);
});

// ---------- Video categories ----------
// Deliberately lighter than photo categories (no description/location/cover)
// — here a category is just a named row on the Video Work filmstrip.

app.get("/api/video-categories", (_req, res) => {
  res.json(readJSON(VIDEO_CATEGORIES_JSON));
});

app.post("/api/video-categories", (req, res) => {
  const categories = readJSON(VIDEO_CATEGORIES_JSON);
  const entry = {
    id: randomUUID(),
    name: { zh: req.body.name_zh || "", en: req.body.name_en || "" },
  };
  categories.push(entry);
  writeJSON(VIDEO_CATEGORIES_JSON, categories);
  schedulePublish();
  res.json(entry);
});

app.delete("/api/video-categories/:id", (req, res) => {
  const categories = readJSON(VIDEO_CATEGORIES_JSON);
  const videos = readJSON(VIDEOS_JSON);
  const hasVideos = videos.some((v) => v.categoryId === req.params.id);
  if (hasVideos) {
    return res
      .status(400)
      .json({ error: "category still has videos — reassign or delete them first" });
  }
  writeJSON(
    VIDEO_CATEGORIES_JSON,
    categories.filter((c) => c.id !== req.params.id),
  );
  schedulePublish();
  res.json({ ok: true });
});

// ---------- Videos ----------

app.get("/api/videos", (_req, res) => {
  res.json(readJSON(VIDEOS_JSON));
});

app.post("/api/videos", videoUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "missing file" });
  const videos = readJSON(VIDEOS_JSON);
  const id = randomUUID();
  const titleEn = req.body.title_en || req.body.title_zh || "untitled";
  const slug = uniqueSlug(slugify(titleEn), videos);
  const filename = compressVideo(VIDEOS_DIR, req.file.filename);
  const videoPath = path.join(VIDEOS_DIR, filename);
  const thumbName = `${id}.jpg`;
  const thumbPath = path.join(THUMBS_DIR, thumbName);

  let thumbnail = "";
  const result = spawnSync("ffmpeg", [
    "-y",
    "-ss",
    "1",
    "-i",
    videoPath,
    "-frames:v",
    "1",
    thumbPath,
  ]);
  if (result.status === 0 && fs.existsSync(thumbPath)) {
    thumbnail = `/media/videos/thumbs/${thumbName}`;
  }

  const entry = {
    id,
    slug,
    thumbnail,
    videoSrc: `/media/videos/${filename}`,
    title: { zh: req.body.title_zh || "", en: req.body.title_en || "" },
    services: {
      zh: req.body.services_zh || "",
      en: req.body.services_en || "",
    },
    year: req.body.year || "",
    categoryId: req.body.category_id || null,
  };
  videos.push(entry);
  writeJSON(VIDEOS_JSON, videos);
  schedulePublish();
  res.json(entry);
});

app.patch("/api/videos/:id", (req, res) => {
  const videos = readJSON(VIDEOS_JSON);
  const item = videos.find((v) => v.id === req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  if (req.body.title_zh !== undefined) item.title.zh = req.body.title_zh;
  if (req.body.title_en !== undefined) item.title.en = req.body.title_en;
  if (req.body.services_zh !== undefined) item.services.zh = req.body.services_zh;
  if (req.body.services_en !== undefined) item.services.en = req.body.services_en;
  if (req.body.year !== undefined) item.year = req.body.year;
  if (req.body.category_id !== undefined) item.categoryId = req.body.category_id || null;
  writeJSON(VIDEOS_JSON, videos);
  schedulePublish();
  res.json(item);
});

app.delete("/api/videos/:id", (req, res) => {
  const videos = readJSON(VIDEOS_JSON);
  const item = videos.find((v) => v.id === req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  const videoPath = path.join(ROOT, "public", item.videoSrc);
  if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
  if (item.thumbnail) {
    const thumbPath = path.join(ROOT, "public", item.thumbnail);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }
  writeJSON(
    VIDEOS_JSON,
    videos.filter((v) => v.id !== req.params.id),
  );
  schedulePublish();
  res.json({ ok: true });
});

app.post("/api/videos/reorder", (req, res) => {
  const { order } = req.body;
  const videos = readJSON(VIDEOS_JSON);
  const byId = new Map(videos.map((v) => [v.id, v]));
  const reordered = order.map((id) => byId.get(id)).filter(Boolean);
  writeJSON(VIDEOS_JSON, reordered);
  schedulePublish();
  res.json(reordered);
});

// Without this, multer/busboy errors (e.g. file over the size cap) bubble up
// as Express's default handler, which serves a raw HTML stack trace that the
// admin UI then dumps verbatim into the status text.
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "檔案太大，超過上傳上限" : err.message;
    return res.status(400).json({ error: message });
  }
  console.error("[server] unhandled error:", err);
  res.status(500).json({ error: err.message || "未知錯誤" });
});

const PORT = process.env.ADMIN_PORT || 4321;
app.listen(PORT, () => {
  console.log(`Admin panel running at http://localhost:${PORT}`);
});
