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

function renderVideo(lecture) {
  const aspect = lecture.aspect || 56.25;
  return `
    <div class="youtube-wrapper" style="padding-bottom: ${aspect}%">
      <iframe
        src="https://www.youtube.com/embed/${lecture.videoId}"
        title="${lecture.title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  `;
}

function renderFooter(lecture) {
  return `
    <hr>
    <div class="small">
      <p>Notes by ${lecture.author || "Unknown author"} · ${lecture.date || "No date"}</p>
      <p>Demo clone inspired by MIT Missing Semester</p>
    </div>
  `;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  const lectures = await loadLectures();
  const lecture = lectures.find((item) => item.id === id);

  if (!lecture) {
    document.body.innerHTML = `
      ${renderNav()}
      <div id="content">
        <h1 class="title">Lecture not found</h1>
        <p>No lecture with id <code>${id}</code> exists.</p>
        <p><a href="index.html">Back to lectures</a></p>
      </div>
    `;
    return;
  }

  document.title = `${lecture.title} · Lecture Clone`;

  const notesHtml = lecture.notesHtml || marked.parse(lecture.notes || "");

  document.body.innerHTML = `
    ${renderNav()}
    <div id="content">
      <h1 class="title">${lecture.title}</h1>
      ${renderVideo(lecture)}
      <div id="notes">${notesHtml}</div>
      ${renderFooter(lecture)}
    </div>
  `;
}

init();
