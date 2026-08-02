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
const PHOTOS_DIR = path.join(MEDIA_DIR, "photos");
const VIDEOS_DIR = path.join(MEDIA_DIR, "videos");
const THUMBS_DIR = path.join(VIDEOS_DIR, "thumbs");

for (const dir of [PHOTOS_DIR, VIDEOS_DIR, THUMBS_DIR]) {
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
      "git add content/photos.json content/categories.json content/videos.json public/media",
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
  limits: { fileSize: 1024 * 1024 * 1024 },
});

app.get("/api/publish-status", (_req, res) => {
  res.json(publishState);
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
  const created = req.files.map((file) => ({
    id: randomUUID(),
    src: `/media/photos/${file.filename}`,
    categoryId: category.id,
    caption: { zh: "", en: "" },
  }));
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
  const videoPath = path.join(VIDEOS_DIR, req.file.filename);
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
    videoSrc: `/media/videos/${req.file.filename}`,
    title: { zh: req.body.title_zh || "", en: req.body.title_en || "" },
    services: {
      zh: req.body.services_zh || "",
      en: req.body.services_en || "",
    },
    year: req.body.year || "",
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

const PORT = process.env.ADMIN_PORT || 4321;
app.listen(PORT, () => {
  console.log(`Admin panel running at http://localhost:${PORT}`);
});
