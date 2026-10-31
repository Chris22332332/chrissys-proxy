import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNotes, upsertNote, deleteNote, searchNotes, MAX_NOTE_BODY } from '../public/notes-core.js';

test('note normalization filters invalid records and duplicate IDs', () => {
  const result = normalizeNotes([{ id: 'a', title: 'one' }, { id: 'a', title: 'duplicate' }, null, { id: '' }], 100);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'one');
  assert.equal(result[0].createdAt, 100);
});

test('note upsert preserves creation time and updates edit time', () => {
  const initial = upsertNote([], { id: 'n1', title: 'First', body: 'Body' }, 100);
  const changed = upsertNote(initial, { id: 'n1', title: 'Updated', body: 'New body' }, 200);
  assert.equal(changed.length, 1);
  assert.equal(changed[0].createdAt, 100);
  assert.equal(changed[0].updatedAt, 200);
  assert.equal(changed[0].title, 'Updated');
});

test('note content is length-limited and null bytes are removed', () => {
  const [note] = upsertNote([], { id: 'n', title: 'x'.repeat(200), body: `a\0${'b'.repeat(MAX_NOTE_BODY + 10)}` }, 1);
  assert.equal(note.title.length, 90);
  assert.equal(note.body.length, MAX_NOTE_BODY);
  assert.equal(note.body.includes('\0'), false);
});

test('note deletion and text search operate on safe normalized records', () => {
  const notes = upsertNote(upsertNote([], { id: 'a', title: 'Math', body: 'Algebra' }, 1), { id: 'b', title: 'Music', body: 'Saxophone' }, 2);
  assert.deepEqual(searchNotes(notes, 'saxo').map((note) => note.id), ['b']);
  assert.deepEqual(deleteNote(notes, 'a').map((note) => note.id), ['b']);
});
