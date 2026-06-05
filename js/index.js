import { loadLectures } from "./storage.js";

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

async function init() {
  const lectures = await loadLectures();

  const cards = lectures
    .map(
      (lecture) => `
      <a class="lecture-card" href="lecture.html?id=${lecture.id}">
        <h2>${lecture.title}</h2>
        <div class="meta">${lecture.author || "Unknown"} · ${lecture.date || "No date"}</div>
      </a>
    `
    )
    .join("");

  document.body.innerHTML = `
    ${renderNav()}
    <div id="content">
      <h1 class="title">Lectures</h1>
      <p>Video lectures with author notes below each recording.</p>
      ${cards || '<p>No lectures yet. <a href="admin.html">Upload one</a>.</p>'}
    </div>
  `;
}

init();
