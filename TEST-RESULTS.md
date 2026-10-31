# ChrissysProxy v23 test report

## Verified locally

- `npm install`: completed successfully; npm reported zero vulnerabilities.
- `npm start` with `PORT=8080`: passed startup checks and served the app.
- Real browser proxy navigation: Example Domain, Google, DuckDuckGo search results, YouTube, and CrazyGames rendered with Libcurl.
- TikTok rendered its page with Libcurl; some TikTok API requests returned site-side 403 responses.
- CrazyGames game route rendered; Back and Forward moved between its catalogue and game route.
- Auto selected Libcurl and rendered tested pages. Explicit Libcurl rendered; explicit Epoxy reproduced the YouTube Scramjet error screen.
- Reload after an app update continued with the already active compatible service worker.
- Removed the redundant Scramjet service-worker route lookup that reproduced the undefined `prefix` error after refresh.
- Startup now waits for the worker matching the current build instead of continuing under the stale worker.
- `npm test`: 50 tests passed, 0 failed; source/configuration checks passed. `npm run preflight` passed.

## Environment note

This local machine runs Node 24.13.0; the project declares Node 22 (`>=22.9 <23`). Local installation, startup, and tests succeeded on Node 24, but the declared Node 22 runtime was not available here. Render was not tested, so Render-specific networking/DNS behavior remains unverified.
