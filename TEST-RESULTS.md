# ChrissysProxy v24 test report

## Verified locally

- `npm install`: completed successfully; npm reported zero vulnerabilities.
- `npm start` with `PORT=8080`: passed startup checks and served the app.
- Prior local browser checks: Example Domain, Google, DuckDuckGo search results, YouTube, and CrazyGames rendered with Libcurl; TikTok rendered, with some site API requests returning 403. CrazyGames game route and Back/Forward were checked. Epoxy reproduced a YouTube error locally.
- `npm test`: 50 tests passed, 0 failed; source/configuration checks passed. `npm run preflight` passed.

## Verified on Render

- Build `chrissysproxy-20261031-23` deployed successfully on Node 22.23.4. `/healthz` returned `ok: true` and the v23 build ID.
- Example Domain and Google homepage rendered over Libcurl; Example Domain rendered over Epoxy.
- Brave Search returned results over Epoxy.
- DuckDuckGo timed out from Render (`ETIMEDOUT` to `52.250.42.157:443`) with both transports. Google search triggered Google's unusual-traffic CAPTCHA. This points to destination/network restrictions on Render's outbound path, not a local TLS certificate error.
- v24 changes the default search engine to Brave based on that live test; an updated Render deploy is required before the new default is live.

## Environment note

This local machine runs Node 24.13.0; the project declares Node 22 (`>=22.9 <23`). Local installation, startup, and tests succeeded on Node 24; Render was separately tested on Node 22.23.4. Render Free may spin down after inactivity, and third-party sites can block proxy IPs or fail on the host network.
