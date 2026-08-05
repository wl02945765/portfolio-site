// --- Auto-publish sync indicator ---
const syncIndicator = document.getElementById("sync-indicator");

function renderSyncStatus(state) {
  syncIndicator.classList.remove("pending", "publishing", "done", "error");
  if (state.publishing) {
    syncIndicator.textContent = "🔄 同步到網站中…";
    syncIndicator.classList.add("publishing");
  } else if (state.pending) {
    syncIndicator.textContent = "⏳ 即將自動同步…";
    syncIndicator.classList.add("pending");
  } else if (state.lastError) {
    syncIndicator.textContent = `⚠️ 同步失敗：${state.lastError}`;
    syncIndicator.classList.add("error");
  } else if (state.lastPublishedAt) {
    const t = new Date(state.lastPublishedAt).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
    syncIndicator.textContent = `✅ 已同步 ${t}`;
    syncIndicator.classList.add("done");
  } else {
    syncIndicator.textContent = "";
  }
}

async function pollSyncStatus() {
  try {
    const state = await fetch("/api/publish-status").then((r) => r.json());
    renderSyncStatus(state);
  } catch {
    // admin server briefly unreachable, ignore and retry next tick
  }
}

pollSyncStatus();
setInterval(pollSyncStatus, 2000);

// --- Tabs ---
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
  });
});

// --- Dropzone helper ---
function wireDropzone(dropEl, inputEl, filenameEl, onFile) {
  dropEl.addEventListener("click", () => inputEl.click());
  inputEl.addEventListener("change", () => {
    if (inputEl.files[0]) {
      filenameEl.textContent = inputEl.files[0].name;
      onFile(inputEl.files[0]);
    }
  });
  ["dragenter", "dragover"].forEach((evt) =>
    dropEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropEl.classList.add("drag-over");
    }),
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropEl.classList.remove("drag-over");
    }),
  );
  dropEl.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
      inputEl.files = e.dataTransfer.files;
      filenameEl.textContent = file.name;
      onFile(file);
    }
  });
}

// --- Multi-file dropzone (photos can be uploaded many at once) ---
function wireMultiDropzone(dropEl, inputEl, filenameEl, onFiles) {
  dropEl.addEventListener("click", () => inputEl.click());
  inputEl.addEventListener("change", () => {
    if (inputEl.files.length) {
      filenameEl.textContent = `已選擇 ${inputEl.files.length} 張`;
      onFiles(Array.from(inputEl.files));
    }
  });
  ["dragenter", "dragover"].forEach((evt) =>
    dropEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropEl.classList.add("drag-over");
    }),
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropEl.addEventListener(evt, (e) => {
      e.preventDefault();
      dropEl.classList.remove("drag-over");
    }),
  );
  dropEl.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) {
      filenameEl.textContent = `已選擇 ${files.length} 張`;
      onFiles(files);
    }
  });
}

let selectedPhotoFiles = [];
let selectedVideoFile = null;

wireMultiDropzone(
  document.getElementById("photo-drop"),
  document.getElementById("photo-file"),
  document.getElementById("photo-filename"),
  (files) => (selectedPhotoFiles = files),
);
wireDropzone(
  document.getElementById("video-drop"),
  document.getElementById("video-file"),
  document.getElementById("video-filename"),
  (file) => (selectedVideoFile = file),
);

// --- Reorder (native drag and drop within a grid) ---
function wireReorder(gridEl, onReordered) {
  let dragging = null;

  gridEl.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    dragging = card;
    card.classList.add("dragging");
  });

  gridEl.addEventListener("dragend", () => {
    if (dragging) dragging.classList.remove("dragging");
    dragging = null;
    onReordered(Array.from(gridEl.children).map((c) => c.dataset.id));
  });

  gridEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterEl = [...gridEl.querySelectorAll(".card:not(.dragging)")].reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null },
    ).element;

    if (!dragging) return;
    if (afterEl == null) {
      gridEl.appendChild(dragging);
    } else {
      gridEl.insertBefore(dragging, afterEl);
    }
  });
}

// --- Categories + Photos ---
const categoryListView = document.getElementById("category-list-view");
const categoryDetailView = document.getElementById("category-detail-view");
const categoryGrid = document.getElementById("category-grid");
const categoryStatus = document.getElementById("category-status");
const photoGrid = document.getElementById("photo-grid");
const photoStatus = document.getElementById("photo-status");

let currentCategoryId = null;
let allCategories = [];
let allPhotos = [];

async function loadCategories() {
  [allCategories, allPhotos] = await Promise.all([
    fetch("/api/categories").then((r) => r.json()),
    fetch("/api/photos").then((r) => r.json()),
  ]);
  renderCategoryGrid();
  if (currentCategoryId) renderCategoryDetail();
}

function renderCategoryGrid() {
  categoryGrid.innerHTML = "";
  allCategories.forEach((cat) => {
    const count = allPhotos.filter((p) => p.categoryId === cat.id).length;
    const cover =
      allPhotos.find((p) => p.id === cat.coverPhotoId) ??
      allPhotos.find((p) => p.categoryId === cat.id);
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="thumb-wrap">
        ${
          cover
            ? `<img class="card-thumb" src="${cover.src}" alt="" />`
            : `<div class="card-thumb" style="display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.3);font-size:11px;">尚無照片</div>`
        }
      </div>
      <div class="card-body">
        <p style="margin:0;font-size:13px;font-weight:600;">${escapeHtml(cat.name.zh || cat.name.en || "未命名")}</p>
        <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.4);">${count} 張照片</p>
      </div>
    `;
    card.addEventListener("click", () => openCategory(cat.id));
    categoryGrid.appendChild(card);
  });
}

function openCategory(id) {
  currentCategoryId = id;
  categoryListView.style.display = "none";
  categoryDetailView.style.display = "block";
  renderCategoryDetail();
}

function backToCategories() {
  currentCategoryId = null;
  categoryDetailView.style.display = "none";
  categoryListView.style.display = "block";
}

document.getElementById("back-to-categories-btn").addEventListener("click", backToCategories);

function renderCategoryDetail() {
  const cat = allCategories.find((c) => c.id === currentCategoryId);
  if (!cat) return backToCategories();

  categoryDetailView.querySelectorAll("[data-cat-field]").forEach((input) => {
    const [group, lang] = input.dataset.catField.split("_");
    input.value = cat[group]?.[lang] || "";
    input.onblur = async () => {
      await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.catField]: input.value }),
      });
      loadCategories();
    };
  });

  const categoryPhotos = allPhotos.filter((p) => p.categoryId === cat.id);
  photoGrid.innerHTML = "";
  categoryPhotos.forEach((photo) => photoGrid.appendChild(renderPhotoCard(photo, cat)));
}

document.getElementById("delete-category-btn").addEventListener("click", async () => {
  if (!confirm("確定要刪除這個分類嗎？（分類內還有照片的話無法刪除）")) return;
  const res = await fetch(`/api/categories/${currentCategoryId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || "刪除失敗");
    return;
  }
  backToCategories();
  loadCategories();
});

// --- New category form ---
const newCategoryBtn = document.getElementById("new-category-btn");
const categoryForm = document.getElementById("category-form");
newCategoryBtn.addEventListener("click", () => {
  categoryForm.style.display = categoryForm.style.display === "none" ? "block" : "none";
});
document.getElementById("cancel-category-btn").addEventListener("click", () => {
  categoryForm.reset();
  categoryForm.style.display = "none";
});
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = {
    name_zh: form.name_zh.value,
    name_en: form.name_en.value,
    description_zh: form.description_zh.value,
    description_en: form.description_en.value,
    location_zh: form.location_zh.value,
    location_en: form.location_en.value,
  };
  categoryStatus.textContent = "建立中…";
  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    categoryStatus.textContent = "";
    form.reset();
    form.style.display = "none";
    loadCategories();
  } catch (err) {
    categoryStatus.textContent = `建立失敗：${err.message}`;
  }
});

function renderPhotoCard(photo, category) {
  const isCover = category.coverPhotoId === photo.id;
  const card = document.createElement("div");
  card.className = "card" + (isCover ? " is-cover" : "");
  card.draggable = true;
  card.dataset.id = photo.id;
  card.innerHTML = `
    <div class="thumb-wrap">
      <img class="card-thumb" src="${photo.src}" alt="" />
      ${isCover ? '<span class="cover-badge">★ 分類封面</span>' : ""}
    </div>
    <div class="card-body">
      <input type="text" data-field="caption_zh" value="${escapeHtml(photo.caption.zh)}" placeholder="中文說明" />
      <input type="text" data-field="caption_en" value="${escapeHtml(photo.caption.en)}" placeholder="English caption" />
    </div>
    <div class="card-footer">
      <button class="cover-btn">${isCover ? "★ 已是封面" : "設為封面"}</button>
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }).then(() => loadCategories()),
    );
  });
  card.querySelector(".cover-btn").addEventListener("click", async () => {
    await fetch(`/api/categories/${category.id}/set-cover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: photo.id }),
    });
    loadCategories();
  });
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    loadCategories();
  });
  return card;
}

wireReorder(photoGrid, (order) =>
  fetch("/api/photos/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

document.getElementById("photo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedPhotoFiles.length) {
    photoStatus.textContent = "請先選擇照片";
    return;
  }
  const fd = new FormData();
  selectedPhotoFiles.forEach((f) => fd.append("files", f));

  photoStatus.textContent = `上傳 ${selectedPhotoFiles.length} 張中…`;
  const submitBtn = e.target.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    const res = await fetch(`/api/categories/${currentCategoryId}/photos`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());
    photoStatus.textContent = "上傳完成！";
    e.target.reset();
    document.getElementById("photo-filename").textContent = "";
    selectedPhotoFiles = [];
    loadCategories();
  } catch (err) {
    photoStatus.textContent = `上傳失敗：${err.message}`;
  } finally {
    submitBtn.disabled = false;
  }
});

// --- Videos ---
const videoGrid = document.getElementById("video-grid");
const videoStatus = document.getElementById("video-status");

async function loadVideos() {
  const videos = await fetch("/api/videos").then((r) => r.json());
  videoGrid.innerHTML = "";
  videos.forEach((video) => videoGrid.appendChild(renderVideoCard(video)));
}

function renderVideoCard(video) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = video.id;
  card.innerHTML = `
    <img class="card-thumb" src="${video.thumbnail || ""}" alt="" />
    <div class="card-body">
      <input type="text" data-field="title_zh" value="${escapeHtml(video.title.zh)}" placeholder="中文標題" />
      <input type="text" data-field="title_en" value="${escapeHtml(video.title.en)}" placeholder="English title" />
      <input type="text" data-field="services_zh" value="${escapeHtml(video.services.zh)}" placeholder="服務內容" />
      <input type="text" data-field="services_en" value="${escapeHtml(video.services.en)}" placeholder="Services" />
      <input type="text" data-field="year" value="${escapeHtml(video.year || "")}" placeholder="年份" />
    </div>
    <div class="card-footer">
      <span class="handle">⠿ 拖曳排序</span>
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }),
    );
  });
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這支影片嗎？")) return;
    await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
    loadVideos();
  });
  return card;
}

wireReorder(videoGrid, (order) =>
  fetch("/api/videos/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

document.getElementById("video-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedVideoFile) {
    videoStatus.textContent = "請先選擇一支影片";
    return;
  }
  const form = e.target;
  const fd = new FormData();
  fd.append("file", selectedVideoFile);
  fd.append("title_zh", form.title_zh.value);
  fd.append("title_en", form.title_en.value);
  fd.append("services_zh", form.services_zh.value);
  fd.append("services_en", form.services_en.value);
  fd.append("year", form.year.value);

  videoStatus.textContent = "上傳中，並產生縮圖…";
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    const res = await fetch("/api/videos", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    videoStatus.textContent = "上傳完成！";
    form.reset();
    document.getElementById("video-filename").textContent = "";
    selectedVideoFile = null;
    loadVideos();
  } catch (err) {
    videoStatus.textContent = `上傳失敗：${err.message}`;
  } finally {
    submitBtn.disabled = false;
  }
});

// --- Sound (single show: cover, copy, platform links) ---
let selectedSoundCoverFile = null;
let currentSound = null;

wireDropzone(
  document.getElementById("sound-cover-drop"),
  document.getElementById("sound-cover-file"),
  document.getElementById("sound-cover-filename"),
  (file) => {
    selectedSoundCoverFile = file;
    uploadSoundCover(file);
  },
);

async function uploadSoundCover(file) {
  const fd = new FormData();
  fd.append("file", file);
  document.getElementById("sound-cover-filename").textContent = "上傳中…";
  const res = await fetch("/api/sound/cover", { method: "POST", body: fd });
  currentSound = await res.json();
  document.getElementById("sound-cover-filename").textContent = "已更新封面";
  renderSoundCoverPreview();
}

function renderSoundCoverPreview() {
  const preview = document.getElementById("sound-cover-preview");
  if (currentSound?.coverImage) {
    preview.src = currentSound.coverImage;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
}

async function loadSound() {
  currentSound = await fetch("/api/sound").then((r) => r.json());
  renderSoundCoverPreview();

  document.querySelectorAll("[data-sound-field]").forEach((el) => {
    const [group, lang] = el.dataset.soundField.split("_");
    el.value = currentSound[group]?.[lang] || "";
    el.onblur = async () => {
      const res = await fetch("/api/sound", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [group]: { [lang]: el.value } }),
      });
      currentSound = await res.json();
    };
  });

  renderSoundLinks();
}

const soundLinkGrid = document.getElementById("sound-link-grid");
const soundLinkStatus = document.getElementById("sound-link-status");

function renderSoundLinks() {
  soundLinkGrid.innerHTML = "";
  (currentSound.links || []).forEach((link) => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = link.id;
    card.innerHTML = `
      <div class="card-body">
        <input type="text" data-field="label" value="${escapeHtml(link.label)}" placeholder="平台名稱" />
        <input type="text" data-field="url" value="${escapeHtml(link.url)}" placeholder="連結網址" />
      </div>
      <div class="card-footer">
        <span class="handle">⠿ 拖曳排序</span>
        <button class="delete-btn">刪除</button>
      </div>
    `;
    card.querySelectorAll("input").forEach((input) => {
      input.addEventListener("blur", () =>
        fetch(`/api/sound/links/${link.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [input.dataset.field]: input.value }),
        }),
      );
    });
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("確定要刪除這個連結嗎？")) return;
      await fetch(`/api/sound/links/${link.id}`, { method: "DELETE" });
      loadSound();
    });
    soundLinkGrid.appendChild(card);
  });
}

wireReorder(soundLinkGrid, (order) =>
  fetch("/api/sound/links/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

document.getElementById("sound-link-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  soundLinkStatus.textContent = "新增中…";
  try {
    const res = await fetch("/api/sound/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: form.label.value, url: form.url.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    soundLinkStatus.textContent = "";
    form.reset();
    loadSound();
  } catch (err) {
    soundLinkStatus.textContent = `新增失敗：${err.message}`;
  }
});

loadSound();

// --- Site text (About/Hero/etc copy editing) ---
const TEXT_SCHEMA = [
  {
    section: "全站導覽列",
    fields: [{ path: "brandName", label: "左上角品牌標題（同時也是瀏覽器分頁標題）" }],
  },
  {
    section: "首頁 Hero",
    fields: [
      { path: "heroTitle", label: "主標題" },
      { path: "heroSlogan", label: "標語", type: "textarea" },
      { path: "heroCtaPhotography", label: "「查看照片作品」按鈕文字" },
      { path: "heroCtaVideoWork", label: "「查看影片作品」按鈕文字" },
    ],
  },
  {
    section: "Photography 頁",
    fields: [
      { path: "photography.heading", label: "頁面標題" },
      { path: "photography.empty", label: "尚無作品時的提示文字" },
      { path: "photography.folderEmpty", label: "分類內尚無照片時的提示文字" },
      { path: "photography.backToPhotography", label: "「返回」連結文字" },
    ],
  },
  {
    section: "Video Work 頁",
    fields: [
      { path: "videoWork.heading", label: "頁面標題" },
      { path: "videoWork.empty", label: "尚無作品時的提示文字" },
      { path: "videoWork.backToList", label: "「返回」連結文字" },
    ],
  },
  {
    section: "About 頁",
    fields: [
      { path: "about.heading", label: "頁面標題" },
      { path: "about.heroDescription", label: "首屏簡介一句話" },
      { path: "about.storyTitle", label: "「我的故事」段落標題" },
      { path: "about.storyBody", label: "「我的故事」內文（空行分段）", type: "textarea" },
      { path: "about.timelineTitle", label: "時間軸標題" },
      { path: "about.philosophyTitle", label: "「創作觀」段落標題" },
      { path: "about.philosophyIntro", label: "「創作觀」開場白" },
      { path: "about.philosophyClosing", label: "「創作觀」結語" },
      { path: "about.beyondTitle", label: "「工作之外」段落標題" },
      { path: "about.beyondBody", label: "「工作之外」內文（空行分段）", type: "textarea" },
      { path: "about.skillsTitle", label: "技能段落標題" },
      { path: "about.ctaText", label: "結尾標語" },
      { path: "about.ctaButton", label: "結尾按鈕文字" },
    ],
  },
  {
    section: "Contact 頁",
    fields: [
      { path: "contact.heading", label: "頁面標題" },
      { path: "contact.body", label: "說明文字", type: "textarea" },
      { path: "contact.emailLabel", label: "Email 欄位標籤" },
    ],
  },
];

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : ""), obj);
}

function nestedFromPath(path, value) {
  const parts = path.split(".");
  const root = {};
  let cursor = root;
  parts.forEach((part, i) => {
    if (i === parts.length - 1) {
      cursor[part] = value;
    } else {
      cursor[part] = {};
      cursor = cursor[part];
    }
  });
  return root;
}

const textSectionsEl = document.getElementById("text-sections");
let siteText = { zh: {}, en: {} };

async function loadSiteText() {
  siteText = await fetch("/api/site-text").then((r) => r.json());
  renderTextSections();
}

function renderTextSections() {
  textSectionsEl.innerHTML = "";
  TEXT_SCHEMA.forEach((group) => {
    const section = document.createElement("div");
    section.className = "text-section";
    section.innerHTML = `<h3>${group.section}</h3>`;

    group.fields.forEach((field) => {
      const row = document.createElement("div");
      row.className = "text-field-pair";
      row.innerHTML = ["zh", "en"]
        .map((lang) => {
          const value = escapeHtml(getPath(siteText[lang], field.path));
          const langLabel = lang === "zh" ? "中文" : "English";
          const control =
            field.type === "textarea"
              ? `<textarea data-lang="${lang}" data-path="${field.path}" rows="3">${value}</textarea>`
              : `<input type="text" data-lang="${lang}" data-path="${field.path}" value="${value}" />`;
          return `<label>${field.label}（${langLabel}）${control}</label>`;
        })
        .join("");
      section.appendChild(row);
    });

    textSectionsEl.appendChild(section);
  });

  textSectionsEl.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("blur", async () => {
      const { lang, path } = el.dataset;
      await fetch("/api/site-text", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [lang]: nestedFromPath(path, el.value) }),
      });
    });
  });
}

loadSiteText();

function escapeHtml(str) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

loadCategories();
loadVideos();
