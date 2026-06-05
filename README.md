# Lecture Clone

A static clone of the [MIT Missing Semester](https://missing.csail.mit.edu/2020/version-control/) lecture page layout: a video player on top and author-written notes below.

## Features

- Dark theme with lime-green navigation bar
- Embedded YouTube lectures with responsive 16:9 player
- Markdown lecture notes (headings, code blocks, links)
- Upload page for authors to publish, edit, and delete lectures
- Lectures stored in browser `localStorage` with JSON export/import

## Project structure

```
lecture-clone/
├── index.html          # Lecture listing
├── lecture.html        # Single lecture view (video + notes)
├── admin.html          # Upload / manage lectures
├── about.html
├── css/main.css
├── js/
│   ├── storage.js      # Load/save lecture data
│   ├── index.js
│   ├── lecture.js
│   └── admin.js
└── data/lectures.json  # Default lecture content
```

## Getting started

This site uses ES modules and `fetch`, so open it through a local web server (not `file://`).

```bash
python -m http.server 8080 --directory .
```

Then visit:

- http://localhost:8080/ — all lectures
- http://localhost:8080/lecture.html?id=version-control — sample Git lecture
- http://localhost:8080/admin.html — upload a lecture

## Publishing a lecture

1. Open **upload** (`admin.html`).
2. Fill in the title, author, date, YouTube URL or video ID, and notes in Markdown.
3. Click **Publish lecture**.

Uploaded lectures are saved in your browser until you export them as `lectures.json` or reset to defaults.

## Default lecture

The bundled **Version Control (Git)** lecture uses:

- Video: [Lecture 6: Version Control (git) (2020)](https://www.youtube.com/watch?v=2sjqTHE0zok)
- Notes adapted from the [Missing Semester course materials](https://missing.csail.mit.edu/2020/version-control/)

## License

Demo project inspired by MIT Missing Semester. Original course materials are licensed under CC BY-NC-SA.
