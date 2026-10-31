export const MAX_NOTES = 80;
export const MAX_NOTE_TITLE = 90;
export const MAX_NOTE_BODY = 8000;

function cleanText(value, limit) {
  return String(value ?? '').replace(/\u0000/g, '').slice(0, limit);
}

export function normalizeNotes(value, now = Date.now()) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, MAX_NOTES).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const id = cleanText(item.id, 64).trim();
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const createdAt = Number.isFinite(Number(item.createdAt)) ? Number(item.createdAt) : now;
    const updatedAt = Number.isFinite(Number(item.updatedAt)) ? Number(item.updatedAt) : createdAt;
    return [{
      id,
      title: cleanText(item.title || 'Untitled note', MAX_NOTE_TITLE).trim() || 'Untitled note',
      body: cleanText(item.body, MAX_NOTE_BODY),
      createdAt,
      updatedAt
    }];
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertNote(notes, input, now = Date.now()) {
  const safe = normalizeNotes(notes, now);
  const id = cleanText(input?.id, 64).trim();
  if (!id) throw new TypeError('A note ID is required.');
  const existing = safe.find((note) => note.id === id);
  const next = {
    id,
    title: cleanText(input?.title || 'Untitled note', MAX_NOTE_TITLE).trim() || 'Untitled note',
    body: cleanText(input?.body, MAX_NOTE_BODY),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  const merged = [next, ...safe.filter((note) => note.id !== id)];
  return normalizeNotes(merged, now).slice(0, MAX_NOTES);
}

export function deleteNote(notes, id) {
  const target = cleanText(id, 64).trim();
  return normalizeNotes(notes).filter((note) => note.id !== target);
}

export function searchNotes(notes, query = '') {
  const q = cleanText(query, 200).trim().toLocaleLowerCase();
  const safe = normalizeNotes(notes);
  if (!q) return safe;
  return safe.filter((note) => `${note.title}\n${note.body}`.toLocaleLowerCase().includes(q));
}
