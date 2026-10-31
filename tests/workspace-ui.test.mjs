import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');

test('ChrissysProxy exposes all seven accessible workspace tabs and panels', () => {
  for (const section of ['overview', 'games', 'apps', 'library', 'notes', 'downloads', 'tools']) {
    assert.match(html, new RegExp(`data-hub-tab="${section}"`));
    assert.match(html, new RegExp(`data-hub-pane="${section}"`));
  }
});

test('all eight game cards use local original artwork and legitimate catalogue URLs', () => {
  const images = ['arcade', 'racing', 'puzzle', 'adventure', 'sports', 'platformer', 'boss-battle', 'strategy'];
  for (const image of images) {
    assert.ok(existsSync(new URL(`../public/assets/games/${image}.webp`, import.meta.url)));
    assert.ok(html.includes(`/assets/games/${image}.webp`));
  }
  for (const url of ['https://poki.com/', 'https://www.crazygames.com/', 'https://itch.io/games/html5', 'https://armorgames.com/', 'https://www.coolmathgames.com/', 'https://www.y8.com/', 'https://www.newgrounds.com/games', 'https://gamejolt.com/games']) {
    assert.ok(html.includes(url));
  }
});

test('game and app launchers are connected to current-tab navigation', () => {
  assert.match(app, /querySelectorAll\('\[data-launch-url\]'\)/);
  assert.match(app, /go\(button\.dataset\.launchUrl, tab\)/);
  for (const [name, url] of [['YouTube', 'https://www.youtube.com/'], ['TikTok', 'https://www.tiktok.com/'], ['Instagram', 'https://www.instagram.com/'], ['Discord', 'https://discord.com/app'], ['Spotify', 'https://open.spotify.com/'], ['Reddit', 'https://www.reddit.com/']]) {
    assert.ok(html.includes(`data-launch-url="${url}"`), `${name} launcher is missing`);
    assert.ok(html.includes(`<strong>${name}</strong>`), `${name} label is missing`);
  }
  for (const removed of ['khanacademy.org', 'scratch.mit.edu', 'code.org', 'github.com', 'docs.google.com', 'photopea.com']) assert.ok(!html.includes(removed), `${removed} should not remain in the Apps section`);
});

test('Auto prefers the tested libcurl transport and browser history tracks Scramjet URL changes', () => {
  assert.match(app, /preferred === 'epoxy' \? \['epoxy'\] : \['libcurl', 'epoxy'\]/);
  assert.match(app, /async function chooseTransport\(preferenceOverride\)/);
  assert.match(app, /await chooseTransport\(this\.value\)/);
  assert.match(app, /registration\.update\(\)\.catch/);
  assert.match(app, /matches\(navigator\.serviceWorker\.controller\)/);
  assert.doesNotMatch(app, /isProxyWorker\(/);
  assert.match(app, /managedFrame\.addEventListener\('urlchange'/);
  assert.match(app, /function recordScramjetUrlChange\(/);
});

test('Scramjet service worker sends already-filtered proxy requests directly to the fetch handler', () => {
  const worker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  assert.match(worker, /requestUrl\.pathname\.startsWith\(SCRAMJET_PREFIX\)/);
  assert.match(worker, /return await scramjet\.fetch\(event\)/);
  assert.doesNotMatch(worker, /scramjet\.route\(event\)/);
});

test('notes autosave and downloads export tracking are connected', () => {
  assert.match(app, /function saveNoteForTab/);
  assert.match(app, /setTimeout\(\(\) => saveNoteForTab\(tab, true\), 650\)/);
  assert.match(app, /function recordExport/);
  assert.match(app, /function exportNotes/);
  assert.ok(html.includes('data-export-action="notes"'));
  assert.match(html, /data-role="note-body"/);
  assert.match(html, /data-role="export-log"/);
});

test('command palette supports filtering and keyboard navigation', () => {
  assert.match(app, /filterCommands\(COMMANDS/);
  assert.match(app, /ArrowDown/);
  assert.match(app, /ArrowUp/);
  assert.match(app, /key === 'k'/);
  assert.match(html, /id="command-backdrop"/);
});

test('PWA favicon and install manifest are included', () => {
  for (const file of ['favicon.svg', 'manifest.webmanifest', 'assets/icons/favicon.ico', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png']) {
    assert.ok(existsSync(new URL(`../public/${file}`, import.meta.url)));
  }
  assert.match(html, /rel="manifest" href="\/manifest.webmanifest"/);
});

test('tools cards open actual settings and workspace sections', () => {
  assert.match(app, /querySelectorAll\('\[data-open-settings\]'\)/);
  for (const section of ['connection', 'diagnostics', 'privacy', 'appearance']) assert.ok(html.includes(`data-open-settings="${section}"`));
  assert.ok(html.includes('data-hub-jump="notes"'));
  assert.ok(html.includes('data-hub-jump="downloads"'));
});

test('low-lag setting disables expensive interface effects and persists as a boolean preference', () => {
  assert.match(html, /id="low-lag-toggle"/);
  assert.match(html, /body\.low-lag[^\n]*backdrop-filter:none/);
  assert.match(app, /classList\.toggle\('low-lag', !!settings\.lowLagMode\)/);
  assert.match(app, /settings\.lowLagMode = this\.checked/);
});

test('brand home control is keyboard accessible', () => {
  assert.match(html, /id="brand-home" role="button" tabindex="0"/);
  assert.match(app, /\$\('brand-home'\)\.addEventListener\('keydown'/);
});
