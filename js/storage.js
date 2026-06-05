const STORAGE_KEY = "lecture-clone-lectures";

export async function loadLectures() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const response = await fetch("data/lectures.json");
  if (!response.ok) {
    throw new Error("Could not load default lectures.");
  }
  return response.json();
}

export function saveLectures(lectures) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures));
}

export function resetLectures() {
  localStorage.removeItem(STORAGE_KEY);
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
