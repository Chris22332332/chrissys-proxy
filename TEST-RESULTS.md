# ChrissysProxy v15 test report

## Passed locally

- Node unit tests: **48 passed, 0 failed** (`npm test`).
- Source/configuration checks: **74 PASS checks** (`npm run check`).
- Syntax: server, Wisp upgrade, runtime configuration, service worker, settings core, tab core, notes core, command core, browser app, preflight, and startup check.
- HTML selector audit: 61 JavaScript ID lookups resolve; 67 HTML IDs are unique; no duplicate IDs.
- Login inline JavaScript syntax: passed.
- Hidden-dotfile upload simulation: passed.
- Notes normalization, sanitization, upsert, delete, and search tests: passed.
- Command-palette filtering tests: passed.
- Tab order/pin/reorder tests: passed.
- Wisp upgrade path, malformed request, origin/session rejection, and synchronous/asynchronous error-handling tests: passed.
- PWA manifest and favicon/ICO/PNG files, eight local game images, and new browser modules: passed presence/structure checks.

## Not verified

- A fresh real npm dependency install in this workspace: **failed to reach `registry.npmjs.org` with `EAI_AGAIN`**.
- Real installed-package preflight for this exact archive: not run here because dependencies could not be fetched.
- Real HTTP server startup with the installed third-party dependencies: not verified here.
- Real Wisp handshake and external website navigation through Scramjet: not verified.
- Real interactive Chromium browser test: unavailable due to sandbox browser navigation policy.

Do not interpret unit tests or static checks as proof of a working live proxy. The required next proof is a successful Render build/prestart, `/healthz`, authenticated Wisp handshake, and a permitted HTTPS page loading through Scramjet.
