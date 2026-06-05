import { loadLectures, saveLectures, resetLectures, slugify } from "./storage.js";

let lectures = [];
let editingId = null;

function renderNav() {
  return `
    <div id="nav-bg">
      <div id="top-nav">
        <a id="logo" href="index.html">./lecture-clone</a>
        | <a href="index.html">lectures</a>
        | <a href="admin.html">upload</a>
        | <a href="about.html">about</a>
      </div>
    </div>
  `;
}

function showFlash(message) {
  const flash = document.getElementById("flash");
  if (!flash) return;
  flash.textContent = message;
  flash.hidden = false;
  setTimeout(() => { flash.hidden = true; }, 3000);
}

function extractVideoId(urlOrId) {
  const value = urlOrId.trim();
  if (!value) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return value;
}

function renderLectureList() {
  const list = document.getElementById("lecture-list");
  if (!list) return;
  if (!lectures.length) {
    list.innerHTML = "<li>No lectures uploaded yet.</li>";
    return;
  }
  list.innerHTML = lectures.map((lecture) => `
      <li>
        <span>${lecture.title}</span>
        <span class="actions">
          <a class="btn btn-secondary" href="lecture.html?id=${lecture.id}">view</a>
          <button class="btn btn-secondary" type="button" data-edit="${lecture.id}">edit</button>
          <button class="btn btn-secondary" type="button" data-delete="${lecture.id}">delete</button>
        </span>
      </li>
    `).join("");
  list.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => startEdit(button.dataset.edit));
  });
  list.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteLecture(button.dataset.delete));
  });
}

function fillForm(lecture) {
  document.getElementById("title").value = lecture?.title || "";
  document.getElementById("author").value = lecture?.author || "";
  document.getElementById("date").value = lecture?.date || "";
  document.getElementById("video").value = lecture?.videoId || "";
  document.getElementById("notes").value = lecture?.notes || "";
  document.getElementById("submit-btn").textContent = lecture ? "Save changes" : "Publish lecture";
  document.getElementById("cancel-btn").hidden = !lecture;
}

function startEdit(id) {
  const lecture = lectures.find((item) => item.id === id);
  if (!lecture) return;
  editingId = id;
  fillForm(lecture);
  document.getElementById("title").focus();
}

function cancelEdit() {
  editingId = null;
  fillForm(null);
}

function deleteLecture(id) {
  const lecture = lectures.find((item) => item.id === id);
  if (!lecture) return;
  if (!confirm(`Delete "${lecture.title}"?`)) return;
  lectures = lectures.filter((item) => item.id !== id);
  saveLectures(lectures);
  renderLectureList();
  if (editingId === id) cancelEdit();
  showFlash("Lecture deleted.");
}

function handleSubmit(event) {
  event.preventDefault();
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const date = document.getElementById("date").value.trim();
  const videoId = extractVideoId(document.getElementById("video").value);
  const notes = document.getElementById("notes").value.trim();
  if (!title || !videoId || !notes) {
    showFlash("Title, video, and notes are required.");
    return;
  }
  const lecture = {
    id: editingId || slugify(title),
    title,
    author: author || "Anonymous",
    date: date || new Date().toISOString().slice(0, 10),
    videoId,
    aspect: 56.25,
    notes
  };
  const duplicate = lectures.find((item) => item.id === lecture.id && item.id !== editingId);
  if (duplicate) lecture.id = `${lecture.id}-${Date.now()}`;
  if (editingId) {
    lectures = lectures.map((item) => (item.id === editingId ? lecture : item));
    showFlash("Lecture updated.");
  } else {
    lectures = [lecture, ...lectures];
    showFlash("Lecture published.");
  }
  saveLectures(lectures);
  editingId = null;
  event.target.reset();
  fillForm(null);
  renderLectureList();
}

function exportLectures() {
  const blob = new Blob([JSON.stringify(lectures, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lectures.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importLectures(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      lectures = imported;
      saveLectures(lectures);
      renderLectureList();
      cancelEdit();
      showFlash(`Imported ${imported.length} lecture(s).`);
    } catch {
      showFlash("Could not import file. Use a valid lectures.json.");
    }
  };
  reader.readAsText(file);
}

async function init() {
  lectures = await loadLectures();
  document.body.innerHTML = `
    ${renderNav()}
    <div id="content">
      <h1 class="title">Upload lecture</h1>
      <p>Add a video lecture with notes. Notes support <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener">Markdown</a>.</p>
      <div id="flash" class="flash" hidden></div>
      <form id="lecture-form" class="admin-form">
        <label>Lecture title<input id="title" name="title" required placeholder="Version Control (Git)"></label>
        <label>Author<input id="author" name="author" placeholder="Your name"></label>
        <label>Date<input id="date" name="date" type="date"></label>
        <label>YouTube video URL or ID<input id="video" name="video" required placeholder="https://www.youtube.com/watch?v=2sjqTHE0zok"></label>
        <label>Lecture notes (Markdown)<textarea id="notes" name="notes" required placeholder="# Introduction"></textarea></label>
        <div class="admin-actions">
          <button id="submit-btn" class="btn" type="submit">Publish lecture</button>
          <button id="cancel-btn" class="btn btn-secondary" type="button" hidden>Cancel edit</button>
        </div>
      </form>
      <hr>
      <h2>Your lectures</h2>
      <ul id="lecture-list" class="lecture-list-admin"></ul>
      <div class="admin-actions">
        <button id="export-btn" class="btn btn-secondary" type="button">Export JSON</button>
        <label class="btn btn-secondary" style="cursor:pointer">Import JSON<input id="import-input" type="file" accept="application/json,.json" hidden></label>
        <button id="reset-btn" class="btn btn-secondary" type="button">Reset to defaults</button>
      </div>
    </div>
  `;
  document.getElementById("lecture-form").addEventListener("submit", handleSubmit);
  document.getElementById("cancel-btn").addEventListener("click", cancelEdit);
  document.getElementById("export-btn").addEventListener("click", exportLectures);
  document.getElementById("import-input").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) importLectures(file);
    event.target.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("Reset all lectures to the default Git lecture?")) return;
    resetLectures();
    location.reload();
  });
  fillForm(null);
  renderLectureList();
}

init();
