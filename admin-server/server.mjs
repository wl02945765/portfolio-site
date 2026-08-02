import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const MEDIA_DIR = path.join(ROOT, "public", "media");
const PHOTOS_JSON = path.join(CONTENT_DIR, "photos.json");
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

// ---------- Photos ----------

app.get("/api/photos", (_req, res) => {
  res.json(readJSON(PHOTOS_JSON));
});

app.post("/api/photos", photoUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "missing file" });
  const photos = readJSON(PHOTOS_JSON);
  const entry = {
    id: randomUUID(),
    src: `/media/photos/${req.file.filename}`,
    category: req.body.category || "",
    caption: {
      zh: req.body.caption_zh || "",
      en: req.body.caption_en || "",
    },
  };
  photos.push(entry);
  writeJSON(PHOTOS_JSON, photos);
  res.json(entry);
});

app.patch("/api/photos/:id", (req, res) => {
  const photos = readJSON(PHOTOS_JSON);
  const item = photos.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: "not found" });
  if (req.body.category !== undefined) item.category = req.body.category;
  if (req.body.caption_zh !== undefined) item.caption.zh = req.body.caption_zh;
  if (req.body.caption_en !== undefined) item.caption.en = req.body.caption_en;
  writeJSON(PHOTOS_JSON, photos);
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
  res.json({ ok: true });
});

app.post("/api/photos/reorder", (req, res) => {
  const { order } = req.body;
  const photos = readJSON(PHOTOS_JSON);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const reordered = order.map((id) => byId.get(id)).filter(Boolean);
  writeJSON(PHOTOS_JSON, reordered);
  res.json(reordered);
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
  res.json({ ok: true });
});

app.post("/api/videos/reorder", (req, res) => {
  const { order } = req.body;
  const videos = readJSON(VIDEOS_JSON);
  const byId = new Map(videos.map((v) => [v.id, v]));
  const reordered = order.map((id) => byId.get(id)).filter(Boolean);
  writeJSON(VIDEOS_JSON, reordered);
  res.json(reordered);
});

const PORT = process.env.ADMIN_PORT || 4321;
app.listen(PORT, () => {
  console.log(`Admin panel running at http://localhost:${PORT}`);
});
