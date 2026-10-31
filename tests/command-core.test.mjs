import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCommands } from '../public/command-core.js';

const commands = [
  { id: 'new-tab', label: 'New tab', detail: 'Create a tab', keywords: 'open browser' },
  { id: 'games', label: 'Open Games', detail: 'Browse game libraries', keywords: 'play' },
  { id: 'settings', label: 'Settings', detail: 'Appearance and privacy' }
];

test('command filtering returns all safe commands for an empty query', () => {
  assert.equal(filterCommands(commands).length, 3);
});

test('command filtering searches labels, details, and keywords case-insensitively', () => {
  assert.deepEqual(filterCommands(commands, 'PLAY').map((item) => item.id), ['games']);
  assert.deepEqual(filterCommands(commands, 'appearance').map((item) => item.id), ['settings']);
});

test('command filtering handles malformed input without throwing', () => {
  assert.deepEqual(filterCommands(null, 'games'), []);
  assert.deepEqual(filterCommands([{ id: 1, label: 'bad' }, null], 'bad'), []);
});
