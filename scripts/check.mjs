import * as securityExports from '../src/security.js';
import { readFileSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const syntaxFiles = ['server.js', 'src/security.js', 'src/wisp-upgrade.js', 'src/runtime-config.js', 'public/sw.js', 'public/settings-core.js', 'public/tab-core.js', 'public/notes-core.js', 'public/command-core.js', 'public/app.js', 'scripts/preflight.mjs', 'scripts/startup-check.mjs'];
for (const file of syntaxFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || `${file}: syntax check failed\n`);
    process.exit(result.status || 1);
  }
  console.log(`PASS syntax: ${file}`);
}

const html = readFileSync('public/index.html', 'utf8');
const appJs = readFileSync('public/app.js', 'utf8');
const worker = readFileSync('public/sw.js', 'utf8');
const server = readFileSync('server.js', 'utf8');
const security = readFileSync('src/security.js', 'utf8');
const runtimeConfigSource = readFileSync('src/runtime-config.js', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const render = readFileSync('render.yaml', 'utf8');


const htmlIds = [...html.matchAll(/\bid\s*=\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const uniqueHtmlIds = new Set(htmlIds);
if (uniqueHtmlIds.size !== htmlIds.length) throw new Error('public/index.html contains duplicate element IDs.');
const usedIds = [...new Set([...appJs.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]))];
const missingIds = usedIds.filter((id) => !uniqueHtmlIds.has(id));
if (missingIds.length) throw new Error(`app.js references missing HTML IDs: ${missingIds.join(', ')}`);
console.log(`PASS HTML selector audit: ${usedIds.length} JavaScript IDs exist; ${htmlIds.length} unique HTML IDs; no duplicates`);

const loginHtml = readFileSync('public/login.html', 'utf8');
const inlineScripts = [...loginHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).filter((script) => script.trim());
const tempDir = mkdtempSync(join(tmpdir(), 'portal-login-check-'));
try {
  inlineScripts.forEach((script, index) => {
    const scriptPath = join(tempDir, `login-${index}.js`);
    writeFileSync(scriptPath, script);
    const result = spawnSync(process.execPath, ['--check', scriptPath], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || 'Login inline script syntax check failed.');
  });
} finally { rmSync(tempDir, { recursive: true, force: true }); }
console.log(`PASS login inline JavaScript syntax: ${inlineScripts.length} script(s)`);

const requiredFiles = [
  'public/favicon.svg', 'public/manifest.webmanifest', 'public/assets/icons/favicon.ico', 'public/assets/icons/favicon-32.png', 'public/assets/icons/icon-192.png', 'public/assets/icons/icon-512.png', 'public/assets/icons/icon-maskable-512.png', 'public/assets/games/arcade.webp', 'public/assets/games/racing.webp', 'public/assets/games/puzzle.webp', 'public/assets/games/adventure.webp', 'public/assets/games/sports.webp', 'public/assets/games/platformer.webp', 'public/assets/games/boss-battle.webp', 'public/assets/games/strategy.webp', 'public/index.html', 'public/app.js', 'public/settings-core.js', 'public/tab-core.js', 'public/notes-core.js', 'public/command-core.js', 'public/sw.js', 'public/login.html',
  'package.json', 'server.js', 'src/security.js', 'src/wisp-upgrade.js', 'src/runtime-config.js', 'tests/security.test.mjs', 'tests/wisp-upgrade.test.mjs', 'tests/settings-core.test.mjs', 'tests/tab-core.test.mjs', 'tests/notes-core.test.mjs', 'tests/command-core.test.mjs',
  'scripts/check.mjs', 'scripts/preflight.mjs', 'scripts/startup-check.mjs', 'render.yaml', 'ENVIRONMENT.example.txt', 'tests/upload-layout.test.mjs', 'tests/runtime-config.test.mjs', 'tests/workspace-ui.test.mjs',
  'README.txt', 'README.md', 'SETUP.md', 'RENDER-DEPLOYMENT.md', 'SECURITY.md', 'ENGINEERING-AUDIT.md', 'TEST-RESULTS.md', 'UPLOAD-TO-GITHUB.txt'
];
for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing project file: ${file}`);
  console.log(`PASS file: ${file}`);
}

if (pkg.scripts?.start !== 'node server.js') throw new Error('Production start command must run server.js without requiring a .env file.');
if (pkg.scripts?.dev !== 'node --env-file-if-exists=.env server.js') throw new Error('Local dev command must support an optional .env file.');
if (pkg.scripts?.prestart !== 'node scripts/startup-check.mjs && node scripts/preflight.mjs') throw new Error('npm start must validate runtime configuration and real packages before server.js.');
if (!pkg.scripts?.test?.includes('node --test')) throw new Error('npm test must run the Node test suite');
if (pkg.dependencies?.['@mercuryworkshop/scramjet'] !== '1.1.0') throw new Error('Scramjet must remain pinned to the published v1.1.0 npm package compatible with this app code');
if (pkg.dependencies?.['@mercuryworkshop/bare-mux'] !== '2.1.9') throw new Error('BareMux must remain on the v2.1.9 API used by this project');
if (pkg.dependencies?.['@mercuryworkshop/libcurl-transport'] !== '1.5.2') throw new Error('Libcurl transport must remain on v1.x with the BareMux integration');
if (pkg.dependencies?.['@mercuryworkshop/epoxy-transport'] !== '2.1.28') throw new Error('Epoxy transport must remain on v2.x with the BareMux integration');
if (pkg.dependencies?.['@mercuryworkshop/wisp-js'] !== '0.5.1') throw new Error('Wisp server package must be pinned to the tested Wisp API generation');
if (!pkg.dependencies?.express || !pkg.dependencies?.['@mercuryworkshop/wisp-js']) throw new Error('Express and Wisp server dependencies are required');
const preflight = readFileSync('scripts/preflight.mjs', 'utf8');
if (preflight.includes("load('@mercuryworkshop/bare-mux')")) throw new Error('Do not import the browser-only BareMux client module in Node preflight.');
if (!preflight.includes('BareMuxConnection') || !preflight.includes('browser API marker') || !preflight.includes('public/settings-core.js') || !preflight.includes('public/tab-core.js')) throw new Error('Preflight must inspect the served BareMux browser bundle marker.');
if (!server.includes('const localAssets = [') || !server.includes('...localAssetResults') || !server.includes('const required = [scramjetAll, scramjetWasm, scramjetSync, baremuxWorker, baremuxIndex, libcurlEntry, epoxyEntry, ...localAssetResults]')) throw new Error('Proxy diagnostics must require the configured transports and all local UI/PWA/game assets to be present.');
if (pkg.engines?.node !== '>=22.9 <23') throw new Error('Node engine range must support Node 22 env-file-if-exists and stay below Node 23');
console.log('PASS package metadata and compatible Scramjet 1 / BareMux 2 transport generation');

for (const id of [
  'settings-btn', 'settings-backdrop', 'duplicate-tab', 'reopen-tab', 'stop',
  'theme-select', 'motion-toggle', 'history-toggle', 'restore-toggle', 'max-tabs-select', 'compact-tabs-toggle',
  'engine-select', 'transport-select', 'autoplay-toggle', 'clipboard-toggle',
  'fullscreen-toggle', 'clear-history-setting', 'clear-bookmarks-setting',
  'export-bookmarks', 'export-history', 'import-bookmarks', 'bookmark-file', 'forget-data',
  'logout', 'run-diagnostics', 'test-wisp', 'copy-diagnostics', 'diag-output',
  'export-settings', 'import-settings', 'settings-file', 'reset-settings', 'command-btn', 'command-backdrop', 'command-search', 'command-results'
]) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing UI control: ${id}`);
}
for (const section of ['general', 'appearance', 'search', 'tabs', 'privacy', 'permissions', 'connection', 'advanced', 'diagnostics', 'about']) {
  if (!html.includes(`data-settings-tab="${section}"`) || !html.includes(`data-settings-section="${section}"`)) {
    throw new Error(`Settings section ${section} is incomplete`);
  }
}
const settingsNavButtons = [...html.matchAll(/<button\b([^>]*data-settings-tab=\"[^\"]+\"[^>]*)>/g)].map((match) => match[1]);
if (settingsNavButtons.length !== 10 || settingsNavButtons.some((attrs) => !/\baria-label=\"[^\"]+\"/.test(attrs) || !/\btitle=\"[^\"]+\"/.test(attrs))) throw new Error('All settings navigation buttons must have accessible names and mobile tooltips');
console.log('PASS accessible names and mobile tooltips for all ten settings navigation buttons');
if (!appJs.includes("from './tab-core.js'") || !appJs.includes('reorderTabsWithinGroup') || !appJs.includes('setTabPinOrder')) throw new Error('Browser tab core module is not imported.');
if (!appJs.includes('normalizeSettings') || !appJs.includes('ALLOWED_MAX_TABS') || !appJs.includes('normalizePortalSettings')) throw new Error('Settings must be normalized and tab limits must be constrained.');
if (!appJs.includes('settings.maxTabs') || !appJs.includes('compact-tabs') || !appJs.includes('function moveTab') || !appJs.includes('function setTabPinned') || !appJs.includes('tab.el.draggable = true')) throw new Error('Tab limit and compact-tab settings must affect actual UI behavior.');
if (!appJs.includes('exportSettings') || !appJs.includes('importSettings') || !appJs.includes('resetSettings') || !appJs.includes('validateSettingsBackup')) throw new Error('Advanced settings import/export/reset actions are incomplete.');
if (!appJs.includes('validateSettingsBackup(parsed)') || !appJs.includes('file.size > 1024 * 1024')) throw new Error('Settings import must validate format and file size.');
if (!html.includes('id="tab-context-menu"') || !html.includes('data-tab-action="others"') || !html.includes('data-tab-action="pin"')) throw new Error('Custom tab context menu is missing');
if (html.includes('class="quick"')) throw new Error('Preset auto-recommendation links must not be present');
if (!html.includes('id="bq"') || !html.includes('role="search"')) throw new Error('Address/search bar is missing');
if (!html.includes('<title>ChrissysProxy — Purple Browser Workspace</title>')) throw new Error('ChrissysProxy document title or branding is missing.');
if (!html.includes('type="module" src="/app.js?build=chrissysproxy-20261031-23"')) throw new Error('HTML does not load the v23 application script');
if (!appJs.includes("const BUILD_ID = 'chrissysproxy-20261031-23'")) throw new Error('App script build identifier is wrong');
if (!appJs.includes('scramjet.createFrame()') || !appJs.includes('tab.scramFrame.go(url)')) throw new Error('Scramjet managed frame API is missing');
if (!appJs.includes('connection.setTransport(path, options)')) throw new Error('BareMux transport must be configured before the service worker');
if (!appJs.includes('tab.navigationRequestId') || !appJs.includes('tabs.includes(tab)')) throw new Error('Navigation race/closed-tab protection is missing');
if (!appJs.includes('const placeholder = document.createElement(\'iframe\')')) throw new Error('Home must replace the managed iframe with a clean placeholder');
if (!appJs.includes('withTimeout(controller.init()')) throw new Error('Scramjet initialization timeout is missing');
if (!appJs.includes('if (!scramjet)') || !appJs.includes('if (!connection)')) throw new Error('Proxy retry must reuse initialized Scramjet and BareMux instances');
if (!appJs.includes("const queryPreference = new URLSearchParams(location.search).get('transport')")) throw new Error('Transport selection must validate URL overrides and preserve Auto fallback');
if (!appJs.includes('if (error) target.remove()')) throw new Error('Failed proxy scripts must be removed so a retry can fetch them again');
if (!appJs.includes("key === 't'")) throw new Error('Keyboard shortcuts are missing');
if (!html.includes('id="settings-file"') || !html.includes('id="max-tabs-select"') || !html.includes('id="compact-tabs-toggle"')) throw new Error('Settings import or tab controls are missing.');
console.log('PASS ten settings sections, import/export, pinned/reorderable tabs, and navigation lifecycle');

if (worker.includes('indexedDB.deleteDatabase') || worker.includes('indexedDB.databases') || worker.includes('openIDB')) throw new Error('Service worker must not manipulate Scramjet IndexedDB');
if (!worker.includes("requestUrl.pathname.startsWith(SCRAMJET_PREFIX)")) throw new Error('Service worker must only intercept proxied-page paths');
if (!worker.includes('scramjet.loadConfig()') || !worker.includes('scramjet.fetch(event)')) throw new Error('Scramjet request path is incomplete');
if (!appJs.includes("from './settings-core.js'") || !html.includes('type="module"')) throw new Error('Browser settings module is not loaded as an ES module.');
if (!worker.includes('chrissysproxy-20261031-23')) throw new Error('Service worker build identifier is wrong');
console.log('PASS conservative service-worker routing and Scramjet-managed storage');

const securityImport = server.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/src\/security\.js['"]/s);
if (!securityImport) throw new Error('Could not find server.js security imports');
for (const imported of securityImport[1].split(',').map((part) => part.trim()).filter(Boolean)) {
  const [exportedName] = imported.split(/\s+as\s+/);
  if (!Object.hasOwn(securityExports, exportedName)) throw new Error(`server.js imports missing security export: ${exportedName}`);
}
if (!security.includes('parsed.protocol === \'https:\' || parsed.protocol === \'http:\'')) throw new Error('Same-origin check must reject non-HTTP origins');
if (!security.includes('if (typeof origin !== \'string\' || !origin')) throw new Error('Same-origin check must fail closed when Origin is missing');
console.log('PASS server.js local imports and fail-closed Origin validation');

if (!runtimeConfigSource.includes('PORTAL_ACCESS_PASSWORD') || !runtimeConfigSource.includes('PORTAL_SESSION_SECRET') || !server.includes('verifySessionToken')) throw new Error('Hosted session authentication is missing');
if (!server.includes('handleWispUpgrade(req, socket, head')) throw new Error('Wisp WebSocket requests must pass through the independently tested upgrade handler');
const upgrade = readFileSync('src/wisp-upgrade.js', 'utf8');
if (!upgrade.includes('req.url = parsed.pathname') || !upgrade.includes('socket.end(`${response}\\r\\n`)')) throw new Error('Wisp upgrade path normalization and flushed HTTP rejections are missing');
if (!server.includes('const secure = Boolean(req.secure)')) throw new Error('Session Secure cookies must rely on Express trusted-proxy TLS detection, not an arbitrary forwarded header.');
if (!server.includes('allow_private_ips: false') || !server.includes('allow_loopback_ips: false') || !server.includes('allow_udp_streams: false')) throw new Error('Wisp network safety defaults are missing');
if (!server.includes('port_whitelist: [80, 443]')) throw new Error('Wisp destination port allowlist is missing');
if (!server.includes('wisp_version: 2') || !server.includes('parse_real_ip: false')) throw new Error('Wisp v2 or forwarded-client-IP trust policy is missing');
if (!server.includes('const localAssets = [') || !server.includes('/__portal/diagnostics') || !server.includes("app.get('/healthz'")) throw new Error('Health and diagnostics endpoints are missing');
if (!server.includes("const BUILD_ID = 'chrissysproxy-20261031-23'")) throw new Error('Server build identifier is wrong');
console.log('PASS protected Wisp endpoint, destination policy, and diagnostics');

const login = readFileSync('public/login.html', 'utf8');
if (!login.includes('/api/login') || !login.includes('autocomplete="current-password"')) throw new Error('Private sign-in page is incomplete');
if (login.includes('YOUR_PASSWORD')) throw new Error('Do not ship a hard-coded password');
if (render.includes('PORTAL_ACCESS_PASSWORD') || render.includes('PORTAL_SESSION_SECRET') || !render.includes('healthCheckPath: /healthz')) throw new Error('Render Blueprint must leave optional sign-in disabled by default and define a health check');
if (!render.includes('name: chrissysproxy')) throw new Error('Render Blueprint must use the ChrissysProxy service name.');
if (!render.includes('buildCommand: npm install && npm test && npm run preflight') || !render.includes('startCommand: npm start')) throw new Error('Render must install dependencies, run tests, and verify real package exports/assets before deploying');
if (existsSync('.node-version') && readFileSync('.node-version', 'utf8').trim() !== '22') throw new Error('Optional .node-version file, when present, must contain 22');
console.log('PASS Node version selected by package.json engines; hidden Node dotfile is optional');
if (existsSync('.env.example')) console.log('INFO legacy .env.example found; ENVIRONMENT.example.txt is the visible template used by this build');
console.log('PASS opt-in sign-in and new-service Render configuration');

if (!server.includes('listenHost } = runtimeConfig')) throw new Error('Server must use the centrally validated runtime host binding.');
if (!runtimeConfigSource.includes("hosted ? '0.0.0.0' : '127.0.0.1'")) throw new Error('Hosted service must bind to all interfaces and local development to loopback.');
for (const file of ['server.js', 'public/app.js', 'public/sw.js', 'public/index.html']) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('portal-20261030-10')) throw new Error(`Old v10 build identifier remains in ${file}`);
  if (!content.includes('chrissysproxy-20261031-23')) throw new Error(`ChrissysProxy v23 build identifier missing from ${file}`);
}
console.log('PASS matching ChrissysProxy v23 build identifier and safe local binding across server, app, HTML, and service worker');

const gameAssetFiles = ['public/favicon.svg', 'public/manifest.webmanifest', 'public/assets/icons/favicon.ico', 'public/assets/icons/favicon-32.png', 'public/assets/icons/icon-192.png', 'public/assets/icons/icon-512.png', 'public/assets/icons/icon-maskable-512.png', 'public/assets/games/arcade.webp', 'public/assets/games/racing.webp', 'public/assets/games/puzzle.webp', 'public/assets/games/adventure.webp', 'public/assets/games/sports.webp', 'public/assets/games/platformer.webp', 'public/assets/games/boss-battle.webp', 'public/assets/games/strategy.webp'];
for (const file of gameAssetFiles) if (!existsSync(file)) throw new Error(`Missing original game artwork: ${file}`);
for (const section of ['overview', 'games', 'apps', 'library', 'notes', 'downloads', 'tools']) {
  if (!html.includes(`data-hub-tab="${section}"`) || !html.includes(`data-hub-pane="${section}"`)) throw new Error(`ChrissysProxy workspace section ${section} is incomplete.`);
}
if (!appJs.includes('function setHubSection') || !appJs.includes('data-launch-url') || !appJs.includes('function renderLibrary')) throw new Error('Workspace navigation or launch cards are not connected to browser logic.');
if (!server.includes('resolveRuntimeConfig') || !server.includes('CHRISSYSPROXY_SERVER_STARTUP_COMPLETE')) throw new Error('Server startup diagnostics are missing.');
if (!html.includes('data-hub-tab="notes"') || !html.includes('data-hub-tab="downloads"') || !html.includes('data-role="note-body"') || !html.includes('data-role="export-log"')) throw new Error('Notes and downloads workspace panels are incomplete.');
if (!html.includes('data-role="export-log-clear"') || !appJs.includes("noteRole('export-log-clear')")) throw new Error('Per-tab export history clear control is not connected.');
if (!appJs.includes('function exportNotes') || !appJs.includes('function saveNoteForTab') || !appJs.includes('function renderDownloads') || !appJs.includes('function openCommandPalette') || !appJs.includes('filterCommands') || !appJs.includes('queueNoteSave')) throw new Error('Notes, export manager, or command palette behavior is not connected.');
const manifest = readFileSync('public/manifest.webmanifest', 'utf8');
let manifestData;
try { manifestData = JSON.parse(manifest); } catch { throw new Error('PWA manifest is not valid JSON.'); }
if (manifestData.name !== 'ChrissysProxy' || manifestData.display !== 'standalone' || !manifestData.icons?.some((icon) => icon.sizes === '512x512' && icon.purpose === 'any') || !manifestData.icons?.some((icon) => icon.purpose === 'maskable')) throw new Error('PWA manifest is missing the expected app identity or install icon declarations.');
if (!html.includes('/manifest.webmanifest') || !manifest.includes('/assets/icons/icon-512.png') || !html.includes('/assets/icons/favicon.ico') || !html.includes('rel="apple-touch-icon"')) throw new Error('Installable browser icon/manifest links are missing.');
for (const [file, expectedSize] of [['public/assets/icons/icon-192.png', 192], ['public/assets/icons/icon-512.png', 512], ['public/assets/icons/icon-maskable-512.png', 512], ['public/assets/icons/apple-touch-icon.png', 180], ['public/assets/icons/favicon-32.png', 32]]) {
  const png = readFileSync(file);
  if (png.length < 100 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== expectedSize || png.readUInt32BE(20) !== expectedSize) throw new Error(`Invalid PNG icon dimensions or signature: ${file}`);
}
const ico = readFileSync('public/assets/icons/favicon.ico');
if (ico.length < 100 || ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) throw new Error('Favicon ICO header is invalid.');
for (const file of gameAssetFiles.slice(7)) {
  const webp = readFileSync(file);
  if (webp.subarray(0, 4).toString() !== 'RIFF' || webp.subarray(8, 12).toString() !== 'WEBP' || webp.length < 1024) throw new Error(`Game artwork is not a valid WebP image: ${file}`);
}
console.log('PASS ChrissysProxy workspace tabs, game artwork, app cards, local notes, export manager, command palette, PWA icons, and startup diagnostics');

