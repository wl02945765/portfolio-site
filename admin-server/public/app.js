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

let selectedPhotoFile = null;
let selectedVideoFile = null;

wireDropzone(
  document.getElementById("photo-drop"),
  document.getElementById("photo-file"),
  document.getElementById("photo-filename"),
  (file) => (selectedPhotoFile = file),
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

// --- Photos ---
const photoGrid = document.getElementById("photo-grid");
const photoStatus = document.getElementById("photo-status");

async function loadPhotos() {
  const photos = await fetch("/api/photos").then((r) => r.json());
  photoGrid.innerHTML = "";
  photos.forEach((photo) => photoGrid.appendChild(renderPhotoCard(photo)));
}

function renderPhotoCard(photo) {
  const card = document.createElement("div");
  card.className = "card" + (photo.isCover ? " is-cover" : "");
  card.draggable = true;
  card.dataset.id = photo.id;
  card.innerHTML = `
    <div class="thumb-wrap">
      <img class="card-thumb" src="${photo.src}" alt="" />
      ${photo.isCover ? '<span class="cover-badge">★ 分類封面</span>' : ""}
    </div>
    <div class="card-body">
      <input type="text" data-field="caption_zh" value="${escapeHtml(photo.caption.zh)}" placeholder="中文說明" />
      <input type="text" data-field="caption_en" value="${escapeHtml(photo.caption.en)}" placeholder="English caption" />
      <input type="text" data-field="category" value="${escapeHtml(photo.category)}" placeholder="分類" />
    </div>
    <div class="card-footer">
      <button class="cover-btn" ${photo.category ? "" : "disabled"}>${photo.isCover ? "★ 已是封面" : "設為封面"}</button>
      <button class="delete-btn">刪除</button>
    </div>
  `;
  card.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () =>
      fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [input.dataset.field]: input.value }),
      }).then(() => loadPhotos()),
    );
  });
  card.querySelector(".cover-btn").addEventListener("click", async () => {
    await fetch(`/api/photos/${photo.id}/set-cover`, { method: "POST" });
    loadPhotos();
  });
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    if (!confirm("確定要刪除這張照片嗎？")) return;
    await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    loadPhotos();
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
  if (!selectedPhotoFile) {
    photoStatus.textContent = "請先選擇一張照片";
    return;
  }
  const form = e.target;
  const fd = new FormData();
  fd.append("file", selectedPhotoFile);
  fd.append("caption_zh", form.caption_zh.value);
  fd.append("caption_en", form.caption_en.value);
  fd.append("category", form.category.value);

  photoStatus.textContent = "上傳中…";
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    const res = await fetch("/api/photos", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    photoStatus.textContent = "上傳完成！";
    form.reset();
    document.getElementById("photo-filename").textContent = "";
    selectedPhotoFile = null;
    loadPhotos();
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

function escapeHtml(str) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

loadPhotos();
loadVideos();
