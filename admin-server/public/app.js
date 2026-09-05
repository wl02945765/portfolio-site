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
    card.draggable = true;
    card.dataset.id = cat.id;
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
      <div class="card-footer">
        <span class="handle">⠿ 拖曳排序</span>
      </div>
    `;
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-footer")) return;
      openCategory(cat.id);
    });
    categoryGrid.appendChild(card);
  });
}

wireReorder(categoryGrid, (order) =>
  fetch("/api/categories/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

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
      ${photo.beforeSrc ? '<span class="cover-badge before-after-badge">B/A</span>' : ""}
    </div>
    <div class="card-body">
      <input type="text" data-field="caption_zh" value="${escapeHtml(photo.caption.zh)}" placeholder="中文說明" />
      <input type="text" data-field="caption_en" value="${escapeHtml(photo.caption.en)}" placeholder="English caption" />
      <div class="before-row">
        <label class="before-upload-btn">
          ${photo.beforeSrc ? "更換 Before 版本" : "＋ 上傳 Before 版本"}
          <input type="file" accept="image/*" class="before-file-input" hidden />
        </label>
        ${photo.beforeSrc ? '<button type="button" class="delete-btn remove-before-btn">移除 Before</button>' : ""}
      </div>
    </div>
    <div class="card-footer">
      <button class="cover-btn">${isCover ? "★ 已是封面" : "設為封面"}</button>
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input[data-field]").forEach((input) => {
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
  card.querySelector(".card-footer .delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    loadCategories();
  });
  card.querySelector(".before-file-input").addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await fetch(`/api/photos/${photo.id}/before`, { method: "POST", body: fd });
    loadCategories();
  });
  const removeBeforeBtn = card.querySelector(".remove-before-btn");
  if (removeBeforeBtn) {
    removeBeforeBtn.addEventListener("click", async () => {
      if (!confirm("確定要移除這張照片的 Before 版本嗎？")) return;
      await fetch(`/api/photos/${photo.id}/before`, { method: "DELETE" });
      loadCategories();
    });
  }
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
const videoCategorySelect = document.getElementById("video-category-select");
const videoExternalCategorySelect = document.getElementById("video-external-category-select");
const videoExternalStatus = document.getElementById("video-external-status");
const videoCategoryList = document.getElementById("video-category-list");
const videoCategoryStatus = document.getElementById("video-category-status");

let allVideoCategories = [];

async function loadVideoCategories() {
  allVideoCategories = await fetch("/api/video-categories").then((r) => r.json());
  renderVideoCategoryOptions();
  renderVideoCategoryList();
}

function renderVideoCategoryOptions() {
  const options =
    `<option value="">（未分類）</option>` +
    allVideoCategories
      .map((c) => `<option value="${c.id}">${escapeHtml(c.name.zh || c.name.en)}</option>`)
      .join("");
  for (const select of [videoCategorySelect, videoExternalCategorySelect]) {
    const current = select.value;
    select.innerHTML = options;
    select.value = current;
  }
}

function renderVideoCategoryList() {
  videoCategoryList.innerHTML = allVideoCategories
    .map(
      (c) => `
      <span class="tag" data-id="${c.id}">
        ${escapeHtml(c.name.zh || c.name.en || "未命名")}
        <button type="button" title="刪除分類">✕</button>
      </span>
    `,
    )
    .join("");
  videoCategoryList.querySelectorAll(".tag button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.closest(".tag").dataset.id;
      const res = await fetch(`/api/video-categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "刪除失敗");
        return;
      }
      loadVideoCategories().then(loadVideos);
    });
  });
}

document.getElementById("video-category-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  videoCategoryStatus.textContent = "建立中…";
  try {
    const res = await fetch("/api/video-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_zh: form.name_zh.value, name_en: form.name_en.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    videoCategoryStatus.textContent = "";
    form.reset();
    loadVideoCategories().then(loadVideos);
  } catch (err) {
    videoCategoryStatus.textContent = `建立失敗：${err.message}`;
  }
});

async function loadVideos() {
  const videos = await fetch("/api/videos").then((r) => r.json());
  videoGrid.innerHTML = "";
  videos.forEach((video) => videoGrid.appendChild(renderVideoCard(video)));
}

function renderVideoCard(video) {
  const categoryOptions =
    `<option value="">（未分類）</option>` +
    allVideoCategories
      .map(
        (c) =>
          `<option value="${c.id}" ${c.id === video.categoryId ? "selected" : ""}>${escapeHtml(c.name.zh || c.name.en)}</option>`,
      )
      .join("");

  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = video.id;
  card.innerHTML = `
    <div class="thumb-wrap">
      <img class="card-thumb" src="${video.thumbnail || ""}" alt="" />
      ${video.youtubeId ? `<span class="chip mono" style="position:absolute;left:6px;top:6px;background:rgba(0,0,0,.6);padding:2px 6px;font-size:10px;">▶ YouTube</span>` : ""}
    </div>
    <div class="card-body">
      <input type="text" data-field="title_zh" value="${escapeHtml(video.title.zh)}" placeholder="中文標題" />
      <input type="text" data-field="title_en" value="${escapeHtml(video.title.en)}" placeholder="English title" />
      <input type="text" data-field="services_zh" value="${escapeHtml(video.services.zh)}" placeholder="服務內容" />
      <input type="text" data-field="services_en" value="${escapeHtml(video.services.en)}" placeholder="Services" />
      <input type="text" data-field="year" value="${escapeHtml(video.year || "")}" placeholder="年份" />
      <select data-field="category_id">${categoryOptions}</select>
    </div>
    <div class="card-footer">
      <span class="handle">⠿ 拖曳排序</span>
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input, select").forEach((input) => {
    const evt = input.tagName === "SELECT" ? "change" : "blur";
    input.addEventListener(evt, () =>
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
  fd.append("category_id", form.category_id.value);

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

document.getElementById("video-external-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  videoExternalStatus.textContent = "新增中…";
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    const res = await fetch("/api/videos/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtube_url: form.youtube_url.value,
        title_zh: form.title_zh.value,
        title_en: form.title_en.value,
        services_zh: form.services_zh.value,
        services_en: form.services_en.value,
        year: form.year.value,
        category_id: form.category_id.value,
      }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "新增失敗");
    videoExternalStatus.textContent = "新增完成！";
    form.reset();
    loadVideos();
  } catch (err) {
    videoExternalStatus.textContent = `新增失敗：${err.message}`;
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

// --- Sound episodes (podcast entries, e.g. 歲月車廂) ---
let selectedSoundEpisodeFile = null;
let allSoundEpisodes = [];

wireDropzone(
  document.getElementById("sound-episode-drop"),
  document.getElementById("sound-episode-file"),
  document.getElementById("sound-episode-filename"),
  (file) => (selectedSoundEpisodeFile = file),
);

async function loadSoundEpisodes() {
  allSoundEpisodes = await fetch("/api/sound/episodes").then((r) => r.json());
  renderSoundEpisodeList();
}

function soundEpisodeBadges(ep) {
  const badges = [];
  if (ep.audioSrc) badges.push('<span class="cover-badge">♪ Audio</span>');
  if (ep.youtubeId) badges.push('<span class="cover-badge">▶ YouTube</span>');
  if (ep.compare?.rawSrc && ep.compare?.mixedSrc) badges.push('<span class="cover-badge">⇄ Compare</span>');
  return badges.join(" ");
}

function renderSoundEpisodeList() {
  const list = document.getElementById("sound-episode-list");
  list.innerHTML = "";
  allSoundEpisodes.forEach((ep) => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = ep.id;
    card.style.marginBottom = "16px";
    card.innerHTML = `
      <div class="card-body">
        <div style="margin-bottom:8px">${soundEpisodeBadges(ep)}</div>
        <input type="text" data-field="title_zh" value="${escapeHtml(ep.title.zh)}" placeholder="標題（中文）" />
        <input type="text" data-field="title_en" value="${escapeHtml(ep.title.en)}" placeholder="Title (English)" />
        <textarea data-field="description_zh" placeholder="簡介（中文）" rows="2">${escapeHtml(ep.description?.zh || "")}</textarea>
        <textarea data-field="description_en" placeholder="Description (English)" rows="2">${escapeHtml(ep.description?.en || "")}</textarea>

        <div style="margin-top:10px">
          <label style="display:block;font-size:12px;margin-bottom:4px">YouTube 連結</label>
          <div style="display:flex;gap:8px">
            <input type="url" class="yt-url" placeholder="https://youtube.com/watch?v=..." value="${ep.youtubeId ? `https://youtu.be/${ep.youtubeId}` : ""}" style="flex:1" />
            <button type="button" class="cover-btn yt-attach-btn">更新</button>
          </div>
        </div>

        <div style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap">
          <label style="font-size:12px">
            未混音檔案
            <input type="file" accept="audio/*" class="raw-file" />
          </label>
          <label style="font-size:12px">
            混音後檔案
            <input type="file" accept="audio/*" class="mixed-file" />
          </label>
        </div>
        <p class="status compare-warning"></p>
      </div>
      <div class="card-footer">
        <span class="handle">⠿ 拖曳排序</span>
        <button class="delete-btn">刪除整集</button>
      </div>
    `;

    card.querySelectorAll("input[data-field], textarea[data-field]").forEach((input) => {
      input.addEventListener("blur", () =>
        fetch(`/api/sound/episodes/${ep.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [input.dataset.field]: input.value }),
        }),
      );
    });

    card.querySelector(".yt-attach-btn").addEventListener("click", async () => {
      const url = card.querySelector(".yt-url").value;
      const res = await fetch(`/api/sound/episodes/${ep.id}/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url }),
      });
      if (!res.ok) {
        alert((await res.json().catch(() => ({}))).error || "更新失敗");
        return;
      }
      loadSoundEpisodes();
    });

    const warningEl = card.querySelector(".compare-warning");
    async function uploadCompareSide(side, file) {
      const fd = new FormData();
      fd.append("file", file);
      warningEl.textContent = "上傳中…";
      const res = await fetch(`/api/sound/episodes/${ep.id}/compare/${side}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      warningEl.textContent = data.warning || "";
      loadSoundEpisodes();
    }
    card.querySelector(".raw-file").addEventListener("change", (e) => {
      if (e.target.files[0]) uploadCompareSide("raw", e.target.files[0]);
    });
    card.querySelector(".mixed-file").addEventListener("change", (e) => {
      if (e.target.files[0]) uploadCompareSide("mixed", e.target.files[0]);
    });

    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("確定要刪除這整集嗎？（含音檔跟對比檔案）")) return;
      await fetch(`/api/sound/episodes/${ep.id}`, { method: "DELETE" });
      loadSoundEpisodes();
    });

    list.appendChild(card);
  });
}

wireReorder(document.getElementById("sound-episode-list"), (order) =>
  fetch("/api/sound/episodes/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

document.getElementById("sound-episode-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData();
  if (selectedSoundEpisodeFile) fd.append("file", selectedSoundEpisodeFile);
  fd.append("title_zh", form.title_zh.value);
  fd.append("title_en", form.title_en.value);
  fd.append("description_zh", form.description_zh.value);
  fd.append("description_en", form.description_en.value);

  const statusEl = document.getElementById("sound-episode-status");
  statusEl.textContent = "新增中…";
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    const res = await fetch("/api/sound/episodes", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    statusEl.textContent = "新增完成！";
    form.reset();
    document.getElementById("sound-episode-filename").textContent = "";
    selectedSoundEpisodeFile = null;
    loadSoundEpisodes();
  } catch (err) {
    statusEl.textContent = `新增失敗：${err.message}`;
  } finally {
    submitBtn.disabled = false;
  }
});

loadSoundEpisodes();

// --- Site text (About/Hero/etc copy editing) ---
const TEXT_SCHEMA = [
  {
    section: "全站導覽列",
    fields: [
      { path: "brandName", label: "左上角品牌標題（同時也是瀏覽器分頁標題）" },
      { path: "nav.aboutLabel", label: "導覽列「About Me」項目文字" },
      { path: "nav.photographyLabel", label: "導覽列「Photography」項目文字" },
      { path: "nav.videoWorkLabel", label: "導覽列「Video Work」項目文字" },
      { path: "nav.soundLabel", label: "導覽列「Sound」項目文字" },
      { path: "nav.contactLabel", label: "導覽列「Contact」項目文字" },
    ],
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
      { path: "videoWork.uncategorized", label: "未分類影片的分行標籤" },
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

const fontScaleSlider = document.getElementById("font-scale-slider");
const fontScaleValueEl = document.getElementById("font-scale-value");

async function loadSiteText() {
  siteText = await fetch("/api/site-text").then((r) => r.json());
  renderTextSections();
  renderFontScale();
}

function renderFontScale() {
  const scale = siteText.typography?.fontScale ?? 1;
  fontScaleSlider.value = scale;
  fontScaleValueEl.textContent = `${Math.round(scale * 100)}%`;
}

fontScaleSlider.addEventListener("input", () => {
  fontScaleValueEl.textContent = `${Math.round(Number(fontScaleSlider.value) * 100)}%`;
});

fontScaleSlider.addEventListener("change", async () => {
  const fontScale = Number(fontScaleSlider.value);
  await fetch("/api/site-text", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ typography: { fontScale } }),
  });
  siteText.typography = { fontScale };
});

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
loadVideoCategories().then(loadVideos);

// --- Photography page: top featured strip ---
const featuredPhotoGrid = document.getElementById("featured-photo-grid");
const featuredPhotoStatus = document.getElementById("featured-photo-status");

wireMultiDropzone(
  document.getElementById("featured-photo-drop"),
  document.getElementById("featured-photo-file"),
  document.getElementById("featured-photo-filename"),
  uploadFeaturedPhotos,
);

async function loadFeaturedPhotos() {
  const photos = await fetch("/api/featured-photos").then((r) => r.json());
  featuredPhotoGrid.innerHTML = "";
  photos.forEach((photo) => featuredPhotoGrid.appendChild(renderFeaturedPhotoCard(photo)));
}

function renderFeaturedPhotoCard(photo) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = photo.id;
  card.innerHTML = `
    <div class="thumb-wrap">
      <img class="card-thumb" src="${photo.src}" alt="" />
    </div>
    <div class="card-body">
      <input type="text" data-field="caption_zh" value="${escapeHtml(photo.caption.zh)}" placeholder="中文說明" />
      <input type="text" data-field="caption_en" value="${escapeHtml(photo.caption.en)}" placeholder="English caption" />
    </div>
    <div class="card-footer">
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/featured-photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }),
    );
  });
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    await fetch(`/api/featured-photos/${photo.id}`, { method: "DELETE" });
    loadFeaturedPhotos();
  });
  return card;
}

wireReorder(featuredPhotoGrid, (order) =>
  fetch("/api/featured-photos/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

async function uploadFeaturedPhotos(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  featuredPhotoStatus.textContent = `上傳 ${files.length} 張中…`;
  try {
    const res = await fetch("/api/featured-photos", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    featuredPhotoStatus.textContent = "上傳完成！";
    document.getElementById("featured-photo-filename").textContent = "";
    loadFeaturedPhotos();
  } catch (err) {
    featuredPhotoStatus.textContent = `上傳失敗：${err.message}`;
  }
}

loadFeaturedPhotos();

// --- About page: "beyond work" gallery ---
const aboutGalleryGrid = document.getElementById("about-gallery-grid");
const aboutGalleryStatus = document.getElementById("about-gallery-status");

wireMultiDropzone(
  document.getElementById("about-gallery-drop"),
  document.getElementById("about-gallery-file"),
  document.getElementById("about-gallery-filename"),
  uploadAboutGallery,
);

async function loadAboutGallery() {
  const photos = await fetch("/api/about-gallery").then((r) => r.json());
  aboutGalleryGrid.innerHTML = "";
  photos.forEach((photo) => aboutGalleryGrid.appendChild(renderAboutGalleryCard(photo)));
}

function renderAboutGalleryCard(photo) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = photo.id;
  card.innerHTML = `
    <div class="thumb-wrap">
      ${photo.src ? `<img class="card-thumb" src="${photo.src}" alt="" />` : '<div class="card-thumb" style="display:flex;align-items:center;justify-content:center;color:#666;font-size:12px;">尚未上傳照片</div>'}
    </div>
    <div class="card-body">
      <input type="text" data-field="caption_zh" value="${escapeHtml(photo.caption.zh)}" placeholder="中文說明" />
      <input type="text" data-field="caption_en" value="${escapeHtml(photo.caption.en)}" placeholder="English caption" />
    </div>
    <div class="card-footer">
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/about-gallery/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }),
    );
  });
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    await fetch(`/api/about-gallery/${photo.id}`, { method: "DELETE" });
    loadAboutGallery();
  });
  return card;
}

wireReorder(aboutGalleryGrid, (order) =>
  fetch("/api/about-gallery/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

async function uploadAboutGallery(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  aboutGalleryStatus.textContent = `上傳 ${files.length} 張中…`;
  try {
    const res = await fetch("/api/about-gallery", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    aboutGalleryStatus.textContent = "上傳完成！";
    document.getElementById("about-gallery-filename").textContent = "";
    loadAboutGallery();
  } catch (err) {
    aboutGalleryStatus.textContent = `上傳失敗：${err.message}`;
  }
}

loadAboutGallery();

// --- About page: skills ---
const skillGroupList = document.getElementById("skill-group-list");
const skillGroupStatus = document.getElementById("skill-group-status");

async function loadSkillGroups() {
  const groups = await fetch("/api/about-skills").then((r) => r.json());
  skillGroupList.innerHTML = "";
  groups.forEach((group) => skillGroupList.appendChild(renderSkillGroup(group)));
}

function renderSkillGroup(group) {
  const wrap = document.createElement("div");
  wrap.className = "text-section";
  wrap.innerHTML = `
    <div class="fields">
      <label>分類（中文） <input type="text" data-field="category_zh" value="${escapeHtml(group.category.zh)}" /></label>
      <label>Category (EN) <input type="text" data-field="category_en" value="${escapeHtml(group.category.en)}" /></label>
    </div>
    <div class="fields">
      <label>項目（中文，一行一個） <textarea data-field="items_zh" rows="4">${escapeHtml(group.items.zh.join("\n"))}</textarea></label>
      <label>Items (EN, one per line) <textarea data-field="items_en" rows="4">${escapeHtml(group.items.en.join("\n"))}</textarea></label>
    </div>
    <button class="delete-btn">刪除這個分類</button>
  `;
  wrap.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("blur", () =>
      fetch(`/api/about-skills/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [el.dataset.field]: el.value }),
      }),
    );
  });
  wrap.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這個技能分類嗎？")) return;
    await fetch(`/api/about-skills/${group.id}`, { method: "DELETE" });
    loadSkillGroups();
  });
  return wrap;
}

document.getElementById("skill-group-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  skillGroupStatus.textContent = "建立中…";
  try {
    const res = await fetch("/api/about-skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_zh: form.category_zh.value, category_en: form.category_en.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    skillGroupStatus.textContent = "";
    form.reset();
    loadSkillGroups();
  } catch (err) {
    skillGroupStatus.textContent = `建立失敗：${err.message}`;
  }
});

loadSkillGroups();

// --- About page: hero portrait ---
wireDropzone(
  document.getElementById("about-hero-drop"),
  document.getElementById("about-hero-file"),
  document.getElementById("about-hero-filename"),
  (file) => uploadAboutHeroPortrait(file),
);

async function uploadAboutHeroPortrait(file) {
  const fd = new FormData();
  fd.append("file", file);
  document.getElementById("about-hero-filename").textContent = "上傳中…";
  const res = await fetch("/api/about-hero/portrait", { method: "POST", body: fd });
  const data = await res.json();
  document.getElementById("about-hero-filename").textContent = "已更新照片";
  renderAboutHeroPreview(data);
}

function renderAboutHeroPreview(data) {
  const preview = document.getElementById("about-hero-preview");
  if (data?.portraitSrc) {
    preview.src = data.portraitSrc;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
}

fetch("/api/about-hero")
  .then((r) => r.json())
  .then(renderAboutHeroPreview);

// --- About page: hero tags ---
const aboutTagList = document.getElementById("about-tag-list");
const aboutTagStatus = document.getElementById("about-tag-status");

async function loadAboutTags() {
  const tags = await fetch("/api/about-tags").then((r) => r.json());
  aboutTagList.innerHTML = "";
  tags.forEach((tag) => aboutTagList.appendChild(renderAboutTag(tag)));
}

function renderAboutTag(tag) {
  const el = document.createElement("span");
  el.className = "tag";
  el.innerHTML = `
    <input type="text" data-field="zh" value="${escapeHtml(tag.zh)}" style="width:80px" />
    <input type="text" data-field="en" value="${escapeHtml(tag.en)}" style="width:100px" />
    <button title="刪除">×</button>
  `;
  el.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/about-tags/${tag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }),
    );
  });
  el.querySelector("button").addEventListener("click", async () => {
    await fetch(`/api/about-tags/${tag.id}`, { method: "DELETE" });
    loadAboutTags();
  });
  return el;
}

document.getElementById("about-tag-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  aboutTagStatus.textContent = "建立中…";
  try {
    const res = await fetch("/api/about-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zh: form.zh.value, en: form.en.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    aboutTagStatus.textContent = "";
    form.reset();
    loadAboutTags();
  } catch (err) {
    aboutTagStatus.textContent = `建立失敗：${err.message}`;
  }
});

loadAboutTags();

// --- About page: philosophy lines ---
const aboutPhilosophyList = document.getElementById("about-philosophy-list");
const aboutPhilosophyStatus = document.getElementById("about-philosophy-status");

async function loadAboutPhilosophy() {
  const lines = await fetch("/api/about-philosophy").then((r) => r.json());
  aboutPhilosophyList.innerHTML = "";
  lines.forEach((line) => aboutPhilosophyList.appendChild(renderAboutPhilosophyLine(line)));
}

function renderAboutPhilosophyLine(line) {
  const el = document.createElement("span");
  el.className = "tag";
  el.innerHTML = `
    <input type="text" data-field="zh" value="${escapeHtml(line.zh)}" style="width:160px" />
    <input type="text" data-field="en" value="${escapeHtml(line.en)}" style="width:200px" />
    <button title="刪除">×</button>
  `;
  el.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/about-philosophy/${line.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }),
    );
  });
  el.querySelector("button").addEventListener("click", async () => {
    await fetch(`/api/about-philosophy/${line.id}`, { method: "DELETE" });
    loadAboutPhilosophy();
  });
  return el;
}

document.getElementById("about-philosophy-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  aboutPhilosophyStatus.textContent = "建立中…";
  try {
    const res = await fetch("/api/about-philosophy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zh: form.zh.value, en: form.en.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    aboutPhilosophyStatus.textContent = "";
    form.reset();
    loadAboutPhilosophy();
  } catch (err) {
    aboutPhilosophyStatus.textContent = `建立失敗：${err.message}`;
  }
});

loadAboutPhilosophy();

// --- About page: timeline ---
const aboutTimelineList = document.getElementById("about-timeline-list");
const aboutTimelineStatus = document.getElementById("about-timeline-status");

async function loadAboutTimeline() {
  const steps = await fetch("/api/about-timeline").then((r) => r.json());
  aboutTimelineList.innerHTML = "";
  steps.forEach((step) => aboutTimelineList.appendChild(renderAboutTimelineStep(step)));
}

function renderAboutTimelineStep(step) {
  const wrap = document.createElement("div");
  wrap.className = "text-section card";
  wrap.draggable = true;
  wrap.dataset.id = step.id;
  wrap.innerHTML = `
    <div class="fields">
      <label>時期（中文） <input type="text" data-field="period_zh" value="${escapeHtml(step.period.zh)}" /></label>
      <label>Period (EN) <input type="text" data-field="period_en" value="${escapeHtml(step.period.en)}" /></label>
    </div>
    <div class="fields">
      <label>標題（中文，可留空） <input type="text" data-field="title_zh" value="${escapeHtml(step.title.zh)}" /></label>
      <label>Title (EN) <input type="text" data-field="title_en" value="${escapeHtml(step.title.en)}" /></label>
    </div>
    <div class="fields">
      <label>項目清單（中文，一行一個，可留空） <textarea data-field="items_zh" rows="3">${escapeHtml(step.items.zh.join("\n"))}</textarea></label>
      <label>Items (EN, one per line) <textarea data-field="items_en" rows="3">${escapeHtml(step.items.en.join("\n"))}</textarea></label>
    </div>
    <button class="delete-btn">刪除這個時期</button>
  `;
  wrap.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("blur", () =>
      fetch(`/api/about-timeline/${step.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [el.dataset.field]: el.value }),
      }),
    );
  });
  wrap.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這個時期嗎？")) return;
    await fetch(`/api/about-timeline/${step.id}`, { method: "DELETE" });
    loadAboutTimeline();
  });
  return wrap;
}

wireReorder(aboutTimelineList, (order) =>
  fetch("/api/about-timeline/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  }),
);

document.getElementById("about-timeline-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  aboutTimelineStatus.textContent = "建立中…";
  try {
    const res = await fetch("/api/about-timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period_zh: form.period_zh.value, period_en: form.period_en.value }),
    });
    if (!res.ok) throw new Error(await res.text());
    aboutTimelineStatus.textContent = "";
    form.reset();
    loadAboutTimeline();
  } catch (err) {
    aboutTimelineStatus.textContent = `建立失敗：${err.message}`;
  }
});

loadAboutTimeline();
