# ChrissysProxy v15

ChrissysProxy is a private, purple-themed browser workspace built with Node.js 22, Express, Scramjet 1.x, BareMux 2.x, Libcurl/Epoxy transports, and Wisp JS.

## What's new in v15

- A custom purple brand icon, SVG/ICO/PNG favicons, Apple touch icon, and installable web manifest.
- Seven workspace sections: Home, Games, Apps, Library, Notes, Downloads, and Tools.
- Eight locally stored original game-card illustrations and a live game-catalogue filter.
- Original SVG interface icons for the app launcher and workspace controls.
- A command palette (`Ctrl+K`) with keyboard navigation and actions for tabs, search, workspace sections, settings, and diagnostics.
- Local Notes with search, autosave, delete, and JSON backup export.
- A Downloads & Exports panel that records ChrissysProxy-generated backups. External website downloads remain subject to browser and site behavior.
- Existing browser tabs, pinning, drag reordering, duplicate/reopen, session restore, history, bookmarks, settings import/export, diagnostics, and purple themes.
- Protected hosted access and authenticated same-origin Wisp WebSocket upgrades.

The Games section links to third-party catalogues including Poki, CrazyGames, itch.io HTML5, Armor Games, Coolmath Games, Y8, Newgrounds, and Game Jolt. These are ordinary websites, not built-in games. Availability depends on the site and the network; ChrissysProxy does not bypass school/work network restrictions or site access controls.

## Quick start (Windows / Node 22)

1. Install Node.js 22.9 or newer in the Node 22 line.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm test`.
5. Run `npm run preflight`.
6. For local development, copy `ENVIRONMENT.example.txt` to `.env` if you want to set local preferences, then run `npm run dev`.
7. Open `http://localhost:8080`.

Local development binds to `127.0.0.1`. Do not expose the local development server to the public internet.

## Render

See [RENDER-DEPLOYMENT.md](RENDER-DEPLOYMENT.md). Hosted deployments require `PORTAL_ACCESS_PASSWORD` (20+ characters) and `PORTAL_SESSION_SECRET` (a different secret, 32+ characters). `npm start` validates both variables and runs the installed-package/asset preflight before starting Express.

## Diagnostics

- `GET /healthz` — public liveness/health response.
- `GET /__portal/diagnostics` — authenticated dependency and asset status.
- Settings → Diagnostics — browser support, assets, and authenticated WebSocket probe.

A healthy server or successful WebSocket open does not by itself prove that an external page will render. Test a permitted HTTPS destination through the managed Scramjet frame.

## Publication note

The hosted access password is a shared password, not individual user accounts. Anyone given that password can access the same service. Before offering this to a broad public audience, decide whether you need per-user accounts, usage quotas, abuse reporting, a privacy notice, and a support contact. Do not market the service as unblockable or guaranteed to work on restricted networks.
